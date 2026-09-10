import pytest
from app.services.tamilnadu_data import district_profile
from app.engines.ranking.market_gap import gap
from app.api.routes.decision import analyze, AnalyzeRequest

def test_three_distinct_locations_produce_different_evidence_and_rankings():
    # Location A: Agricultural / Motor Pump Hub (Coimbatore)
    profile_a = district_profile("Coimbatore")
    req_a = AnalyzeRequest(district="Coimbatore", lat=None, lon=None, margin_capital=150000)
    res_a = analyze(req_a)

    # Location B: High Density Metro (Chennai)
    profile_b = district_profile("Chennai")
    req_b = AnalyzeRequest(district="Chennai", lat=None, lon=None, margin_capital=150000)
    res_b = analyze(req_b)

    # Location C: High Altitude Tourism / Horticulture (Nilgiris)
    profile_c = district_profile("Nilgiris")
    req_c = AnalyzeRequest(district="Nilgiris", lat=None, lon=None, margin_capital=150000)
    res_c = analyze(req_c)

    # 1. Verify Distinct District Evidences
    assert profile_a["population_2011"]["value"] != profile_b["population_2011"]["value"]
    assert profile_b["population_2011"]["value"] != profile_c["population_2011"]["value"]

    assert profile_a["density_2011"]["value"] == 699
    assert profile_b["density_2011"]["value"] == 10052
    assert profile_c["density_2011"]["value"] == 300

    # 2. Verify Distinct ODOP Primary Products
    odop_a = profile_a["odop_primary"]["value"]
    odop_b = profile_b["odop_primary"]["value"]
    odop_c = profile_c["odop_primary"]["value"]

    assert odop_a != odop_c
    assert odop_b != odop_c
    assert odop_a == "Motor Pumps"
    assert odop_c == "Tea"

    # 3. Verify Market Gap benchmarks differ based on regional population scale
    gap_a = gap("cold_storage", 0, profile_a["population_estimate_2026"]["value"])
    gap_b = gap("cold_storage", 0, profile_b["population_estimate_2026"]["value"])
    gap_c = gap("cold_storage", 0, profile_c["population_estimate_2026"]["value"])

    assert gap_a["expected_units"] != gap_b["expected_units"]
    assert gap_b["expected_units"] != gap_c["expected_units"]

    # 4. Verify End-to-End API Evidence Output differs materially
    ev_a = res_a["evidence"]["district_baseline"]
    ev_b = res_b["evidence"]["district_baseline"]
    ev_c = res_c["evidence"]["district_baseline"]

    assert ev_a["district"] == "Coimbatore"
    assert ev_b["district"] == "Chennai"
    assert ev_c["district"] == "Nilgiris"

    # 5. Verify Why-This-Location reasoning differs by location
    rec_a_why = str(res_a["recommendation"]["why"])
    rec_c_why = str(res_c["recommendation"]["why"])

    assert "Coimbatore" in rec_a_why or "Motor Pumps" in rec_a_why or "699" in rec_a_why
    assert "Nilgiris" in rec_c_why or "Tea" in rec_c_why or "300" in rec_c_why

def test_unregistered_business_rule_does_not_treat_zero_pois_as_zero_competition():
    # Gap engine test with 0 mapped POIs
    g = gap("cold_storage", 0, 100000)
    assert g["status"] in ("ESTIMATED", "NEEDS_VERIFICATION")
    # Must explicitly state mapped zeros do NOT mean zero ground competition
    reason = g["reason"].lower()
    assert "not" in reason or "ground" in reason or "unmapped" in reason
