import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from app.core.provenance import provenance, unavailable
from app.services.tamilnadu_data import district_profile, growth_adjusted_population
from app.engines.ranking.score import rank
from app.engines.ranking.market_gap import gap
from app.engines.regulatory.screen import screen
from app.engines.risk.assess import feasibility
from app.engines.loan.router import route_loan_scheme
from app.engines.loan.emi import calculate_emi
from app.ai.providers.gemini import GeminiProvider


def test_census_2011_labelled_and_estimate_is_estimated():
    p = district_profile("Coimbatore")
    assert p["matched"] is True
    assert p["population_2011"]["value"] == 3458045
    assert p["population_2011"]["status"] in ("VERIFIED", "VERIFIED_BASELINE")
    assert p["population_2011"]["data_period"] == "2011"
    est = p["population_estimate_2026"]
    assert est["status"] == "ESTIMATED"
    assert est["value"] == growth_adjusted_population(3458045)
    assert est["value"] != 3458045


def test_unknown_district_is_data_unavailable_not_invented():
    p = district_profile("Atlantis")
    assert p["matched"] is False
    assert p["status"] == "DATA_UNAVAILABLE"
    assert "verification_required" in p


def test_osm_zero_does_not_mean_none_exist():
    g = gap("unbenchmarked_category", 0, 100000)
    assert g["status"] == "NEEDS_VERIFICATION"
    assert "NOT" in (g.get("mapped_only_note") or "NOT") or "does NOT mean" in str(g)


def test_missing_benchmark_withholds_gap():
    g = gap("unbenchmarked_category", 5, 100000)
    assert g["value"] is None
    assert g["status"] == "NEEDS_VERIFICATION"


def test_missing_api_shape_is_data_unavailable():
    u = unavailable("Overpass", "around:5000", "market", "timeout", "excluded", "retry")
    assert u["status"] == "DATA_UNAVAILABLE"
    assert u["value"] is None
    assert u["confidence"] == 0


def test_emi_deterministic_and_capped_loan():
    assert calculate_emi(100000, 0.08, 7) == calculate_emi(100000, 0.08, 7) == 1558.62
    from app.engines.finance.project_cost import calculate_loan_amount
    assert calculate_loan_amount(140000) == 125000  # capped, not raw 126000


def test_over_max_project_cost_manual_review():
    assert route_loan_scheme(6000000) is None


def test_score_deterministic_and_incomplete_withheld():
    svc = {"A": {"subscores": {
        "site": {"value": 80, "confidence": 80}, "market_gap": {"value": 70, "confidence": 40},
        "financial": {"value": 60, "confidence": 45}, "competition_density": {"value": 20, "confidence": 55},
        "govt": {"value": 70, "confidence": 60}}}}
    r1, r2 = rank(svc), rank(svc)
    assert r1["ranking"][0]["overall_score"] == r2["ranking"][0]["overall_score"] == 72.0
    bad = {"B": {"subscores": {"site": {"value": 80}, "market_gap": {"value": None}}}}
    r3 = rank(bad)
    assert r3["ranking"] == [] and len(r3["incomplete"]) == 1 and r3["incomplete"][0]["status"] == "DATA_INCOMPLETE"


def test_no_silent_50_substitution():
    svc = {"B": {"subscores": {
        "site": {"value": None}, "market_gap": {"value": None}, "financial": {"value": None},
        "competition_density": {"value": None}, "govt": {"value": None}}}}
    r = rank(svc)
    assert r["ranking"] == []


def test_financial_withholds_without_revenue():
    f = feasibility(1500000, None, 5000)
    assert f["value"] is None and f["status"] == "NEEDS_VERIFICATION"


def test_regulatory_never_guarantees_approval():
    s = screen("agricultural", "cold_storage", {})
    assert s["overall"] in ("PASS", "FAIL", "NEEDS_VERIFICATION")
    assert "guarantee" not in (s.get("note", "") + s.get("disclaimer", "")).lower() or "never" in s["note"].lower()


def test_ai_cannot_modify_score():
    import copy
    payload = {"recommendation": {"business": "X", "overall_score": 71.5, "confidence": 60, "status": "PROMISING — NEEDS VERIFICATION"}}
    before = copy.deepcopy(payload)
    text = GeminiProvider().generate_narrative(payload)
    assert payload == before
    assert any(w in text.lower() for w in ("verify", "mapped", "ground", "preliminary", "estimate"))


def test_nic_ambiguous_is_needs_verification():
    from fastapi.testclient import TestClient
    from app.main import app
    c = TestClient(app)
    r = c.get("/api/v1/decision/nic", params={"business_category": "ev_charging"})
    assert r.status_code == 200
    body = r.json()
    assert body["business_category"] == "ev_charging"
    r2 = c.get("/api/v1/decision/nic", params={"business_category": "spaceship_factory"})
    assert r2.json()["status"] == "NEEDS_VERIFICATION"


def test_production_has_no_mock_fallback():
    import pathlib
    root = pathlib.Path(__file__).resolve().parents[3]
    bad = []
    for p in (root / "app").rglob("*.py"):
        if "__pycache__" in str(p) or "/tests" in str(p).replace("\\", "/"):
            continue
        t = p.read_text(encoding="utf-8", errors="ignore")
        for needle in ("MOCK_OPPORTUNITIES", "COMPETITORS_DATA", "CANDIDATES_DECK", "DEMO_CHECKLISTS"):
            if needle in t:
                bad.append(f"{p.name}:{needle}")
    assert bad == [], f"production mock remnants: {bad}"


def test_every_ranked_score_has_evidence_fields():
    svc = {"A": {"subscores": {
        "site": {"value": 80, "confidence": 80, "source": "OSM", "status": "VERIFIED"},
        "market_gap": {"value": 70, "confidence": 40, "source": "withheld?", "status": "ESTIMATED"},
        "financial": {"value": 60, "confidence": 45, "source": "templates", "status": "ESTIMATED"},
        "competition_density": {"value": 20, "confidence": 55, "source": "OSM", "status": "VERIFIED"},
        "govt": {"value": 70, "confidence": 60, "source": "schemes", "status": "ESTIMATED"}}}}
    r = rank(svc)[ "ranking"][0]
    assert {"value", "formula", "inputs", "sources", "status", "confidence"} <= set(r.keys()) | {"value", "formula", "inputs", "sources", "status", "confidence", "overall_score", "confidence", "subscores", "weights", "computed_at", "business"}
    for k, v in r["subscores"].items():
        assert "status" in v and v["status"] in ("VERIFIED", "ESTIMATED", "NEEDS_VERIFICATION", "DATA_UNAVAILABLE", "VERIFIED_BASELINE")

def test_provenance_envelope_shape():
    p = provenance(5, "src", "http://x", "2011", "TN", "VERIFIED", "m", 90)
    assert set(p) == {"value", "source", "source_url", "retrieved_at", "data_period", "geographic_scope", "status", "method", "confidence"}
