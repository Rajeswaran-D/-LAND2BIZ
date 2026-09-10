import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

import pytest
from app.core.data_loader import REPO_ROOT
from app.services.geo_live import deduplicate_spatial_entities, CATEGORY_CATCHMENT_M
from app.services.tamilnadu_data import district_profile, regional_demand_signal
from app.engines.ranking.market_gap import gap, BENCHMARKS
from app.engines.ranking.score import rank, calculate_data_completeness
from app.engines.risk.assess import feasibility


def test_legal_source_registry_schema():
    path = os.path.join(REPO_ROOT, "data", "legal_source_registry.json")
    assert os.path.exists(path), "legal_source_registry.json missing"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    assert "sources" in data
    assert len(data["sources"]) >= 18
    for s in data["sources"]:
        assert "source_id" in s
        assert "authority_level" in s
        assert "permitted_use" in s
        assert "commercial_use_status" in s


def test_hces_consumption_baseline_structure():
    path = os.path.join(REPO_ROOT, "data", "normalized", "hces_consumption_baseline.json")
    assert os.path.exists(path), "hces_consumption_baseline.json missing"
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    assert "tamil_nadu_mpce_2022_23" in data
    assert data["tamil_nadu_mpce_2022_23"]["rural_mpce_inr"] == 5310
    assert data["tamil_nadu_mpce_2022_23"]["urban_mpce_inr"] == 8310


def test_multi_radius_catchments():
    assert CATEGORY_CATCHMENT_M["market"] == 3000
    assert CATEGORY_CATCHMENT_M["grocery"] == 1000
    assert CATEGORY_CATCHMENT_M["cold_storage"] == 10000
    assert CATEGORY_CATCHMENT_M["fuel_ev"] == 2000


def test_spatial_entity_deduplication():
    google_recs = [
        {"place_id": "g1", "name": "Fresh Dairy Outlet", "lat": 11.0168, "lng": 76.9558, "distance_m": 120, "retrieved_at": "2026-09-10T12:00:00Z"},
        {"place_id": "g2", "name": "Coimbatore Supermarket", "lat": 11.0200, "lng": 76.9600, "distance_m": 450, "retrieved_at": "2026-09-10T12:00:00Z"},
    ]
    osm_recs = [
        {"osm_id": "node/101", "name": "Fresh Dairy Outlet", "lat": 11.0169, "lng": 76.9559, "distance_m": 125, "retrieved_at": "2026-09-10T12:00:00Z"}, # within 50m of g1
        {"osm_id": "node/102", "name": "Local Milk Shop", "lat": 11.0500, "lng": 76.9900, "distance_m": 1200, "retrieved_at": "2026-09-10T12:00:00Z"},
    ]
    count, merged = deduplicate_spatial_entities(google_recs, osm_recs, max_distance_m=50.0)
    assert count == 3 # g1 matched with node/101; g2 unique; node/102 unique
    sources = [m["source"] for m in merged]
    assert "Deduplicated (Google Places + OpenStreetMap)" in sources
    assert "Google Places API (New)" in sources
    assert "OpenStreetMap Overpass API" in sources


def test_market_gap_with_official_benchmarks():
    res = gap("cold_storage", 1, 100000)
    assert res["status"] == "ESTIMATED"
    assert res["value"] == 50 # expected = 100000 / 50000 = 2; (2 - 1) / 2 * 100 = 50
    assert "NABARD" in res["benchmark_source"]


def test_market_gap_withholds_when_benchmark_missing():
    res = gap("unknown_exotic_category", 0, 100000)
    assert res["status"] == "NEEDS_VERIFICATION"
    assert res["value"] is None


def test_three_score_separation():
    subs = {
        "site": {"value": 80, "confidence": 80, "status": "VERIFIED"},
        "market_gap": {"value": 70, "confidence": 40, "status": "ESTIMATED"},
        "financial": {"value": 60, "confidence": 45, "status": "ESTIMATED"},
        "competition_density": {"value": 20, "confidence": 55, "status": "VERIFIED"},
        "govt": {"value": 70, "confidence": 60, "status": "ESTIMATED"},
    }
    comp = calculate_data_completeness(subs)
    assert comp == 100

    services = {"Test Business": {"subscores": subs}}
    res = rank(services)
    item = res["ranking"][0]
    assert "overall_score" in item
    assert "confidence_score" in item
    assert "data_completeness_score" in item
    assert item["overall_score"] == 72.0
    assert item["confidence_score"] == 56
    assert item["data_completeness_score"] == 100


def test_financial_line_item_provenance_tagging():
    f = feasibility(1500000, 30000, 15000, revenue_origin="SOURCE_BASED")
    assert f["status"] == "ESTIMATED"
    assert f["provenance_origin"] == "SOURCE_BASED"
    assert f["line_item_origins"]["project_cost"] == "DERIVED"
    assert f["line_item_origins"]["monthly_net_typical"] == "SOURCE_BASED"


def test_input_sensitivity_analysis():
    services1 = {"Biz": {"subscores": {
        "site": {"value": 80, "confidence": 80, "status": "VERIFIED"},
        "market_gap": {"value": 50, "confidence": 50, "status": "ESTIMATED"},
        "financial": {"value": 60, "confidence": 50, "status": "ESTIMATED"},
        "competition_density": {"value": 20, "confidence": 50, "status": "VERIFIED"},
        "govt": {"value": 70, "confidence": 50, "status": "ESTIMATED"},
    }}}
    services2 = {"Biz": {"subscores": {
        "site": {"value": 80, "confidence": 80, "status": "VERIFIED"},
        "market_gap": {"value": 65, "confidence": 50, "status": "ESTIMATED"}, # +15 pts (+30% increase)
        "financial": {"value": 60, "confidence": 50, "status": "ESTIMATED"},
        "competition_density": {"value": 20, "confidence": 50, "status": "VERIFIED"},
        "govt": {"value": 70, "confidence": 50, "status": "ESTIMATED"},
    }}}
    r1 = rank(services1)["ranking"][0]["overall_score"]
    r2 = rank(services2)["ranking"][0]["overall_score"]
    assert r2 > r1
    # 0.25 weight * +15 = +3.75 -> 67.0 vs 70.8
    assert round(r2 - r1, 1) == 3.8


def test_multi_location_verification():
    locs = [
        ("Coimbatore", True),    # Semi-urban/Urban
        ("Salem", True),         # Urban
        ("Thanjavur", True),     # Semi-urban
        ("Nilgiris", True),      # Rural mountain
        ("Ariyalur", True),      # Rural
        ("Perambalur", True),    # Rural
        ("Chennai", False),      # Urban capital
    ]
    for dname, is_rural in locs:
        prof = district_profile(dname, is_rural=is_rural)
        assert prof["matched"] is True
        assert "population_2011" in prof
        assert prof["population_2011"]["status"] == "VERIFIED_BASELINE"
        assert prof["population_estimate_2026"]["status"] == "ESTIMATED"
        assert "regional_demand_signal" in prof
        assert prof["regional_demand_signal"]["status"] == "VERIFIED_STATISTICAL_BASELINE"


def test_evidence_value_schema_exists():
    path = os.path.join(REPO_ROOT, "data", "schemas", "evidence_value.schema.json")
    assert os.path.exists(path), "evidence_value.schema.json missing"
    with open(path, encoding="utf-8") as f:
        schema = json.load(f)
    assert "title" in schema
    assert "properties" in schema
    assert "legal" in schema["properties"]
    assert "evidence" in schema["properties"]


def test_machine_readable_datasets_catalog():
    path = os.path.join(REPO_ROOT, "data", "catalog", "datasets.json")
    assert os.path.exists(path), "datasets.json missing"
    with open(path, encoding="utf-8") as f:
        catalog = json.load(f)
    assert isinstance(catalog, list)
    assert len(catalog) >= 12
    for ds in catalog:
        assert "dataset_id" in ds
        assert "authority_level" in ds
        assert "legal_status" in ds
        assert "confidence_method" in ds


def test_canonical_evidence_constructor():
    from app.core.provenance import canonical_evidence
    ev = canonical_evidence(
        value=3458045,
        unit="persons",
        data_type="integer",
        source_id="census_2011_tn",
        source_name="Census of India 2011",
        organization="Office of the Registrar General & Census Commissioner",
        official_url="https://censusindia.gov.in/",
        authority_level="LEVEL 1",
        document_title="District Census Handbook Tamil Nadu 2011",
        table="Table A-02",
        district="Coimbatore",
        status="VERIFIED_BASELINE",
        evidence_class="CLASS A",
        confidence=95,
        legal_status="LEGAL_USE_VERIFIED",
    )
    assert ev["value"] == 3458045
    assert ev["classification"]["status"] == "VERIFIED_BASELINE"
    assert ev["classification"]["evidence_class"] == "CLASS A"
    assert ev["legal"]["legal_status"] == "LEGAL_USE_VERIFIED"
    assert ev["evidence"]["table"] == "Table A-02"

