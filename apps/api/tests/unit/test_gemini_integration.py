import pytest
import json
from app.core.config import settings
from app.ai.providers.gemini import GeminiRESTClient
from app.ai.service import GeminiAIService, gemini_service
from app.ai.schemas import BusinessOpportunitySchema, MarketGapSynthesisSchema
from app.api.routes.decision import analyze, AnalyzeRequest, what_if_scenario, WhatIfRequest

def test_gemini_config_and_service_fallback():
    client = GeminiRESTClient()
    # Key should be fetched safely from settings/environment
    assert isinstance(client.is_configured(), bool)
    
    service = GeminiAIService(client=client)
    # Service fallback must return valid structured response even when unconfigured/offline
    gap_res = service.synthesize_market_gap({"district": {"district": "TestDistrict"}})
    assert "location_summary" in gap_res
    assert "underserved_niches" in gap_res

def test_gemini_opportunity_reasoning_preserves_deterministic_math():
    service = GeminiAIService()
    candidate = {
        "id": "solar_cold_storage_15mt",
        "title": "Solar Cold Storage 15MT",
        "capital_min_inr": 1500000,
        "overall_score": 82.5,
        "subscores": {
            "site": {"value": 75.0},
            "market_gap": {"value": 80.0},
            "financial": {"value": 85.0}
        }
    }
    evidence_bundle = {
        "district_baseline": {"district": "Coimbatore", "odop_primary": {"value": "Motor Pumps"}}
    }

    res = service.enhance_opportunity_reasoning(candidate, evidence_bundle)
    # Deterministic CAPEX and overall score MUST be preserved
    assert res["estimated_project_cost"] == 1500000
    assert res["overall_score"] == 82.5
    assert len(res["why_this_location"]) > 0

def test_what_if_scenario_api_integration():
    req = WhatIfRequest(margin_capital=150000, cost_increase_pct=10.0, demand_change_pct=-15.0)
    res = what_if_scenario(req)

    assert "scenario_cost" in res
    assert "scenario_loan" in res
    assert "scenario_emi" in res
    assert "explanation" in res
    assert res["explanation"]["scenario_name"] != ""

def test_security_gemini_key_never_exposed_in_api_response():
    req = AnalyzeRequest(district="Coimbatore", margin_capital=150000)
    res = analyze(req)

    res_str = json.dumps(res)
    api_key = settings.get_api_key()
    
    if api_key:
        assert api_key not in res_str, "CRITICAL SECURITY VIOLATION: API Key leaked in API response!"
    assert "ai_status" in res
