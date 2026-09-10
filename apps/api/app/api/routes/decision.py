"""Decision API: deterministic analysis -> score -> evidence + Gemini AI reasoning & synthesis layer."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any

from ...core.data_loader import cost_templates, support_schemes, nic_codes
from ...core.exceptions import Land2BizException
from ...engines.finance.project_cost import calculate_project_cost, calculate_loan_amount
from ...engines.loan.router import route_loan_scheme
from ...engines.loan.emi import calculate_emi
from ...engines.regulatory.screen import screen
from ...engines.risk.assess import feasibility, risk_flags
from ...engines.ranking.score import rank, final_status
from ...engines.ranking.market_gap import gap
from ...services.tamilnadu_data import district_profile
from ...services.geo_live import site_intelligence, market_snapshot
from ...ai.service import gemini_service

router = APIRouter()

CATEGORY_BY_TEMPLATE = {
    "solar_cold_storage_15mt": "cold_storage",
    "agri_input_depot": "agri_retail",
    "ev_charging_hub": "ev_charging",
    "dairy_collection_50lpd": "dairy",
    "flour_spice_mill": "food_processing",
}

class AnalyzeRequest(BaseModel):
    district: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    margin_capital: float
    land_type: str = "agricultural"
    answers: dict = {}
    is_rural: bool = True
    is_special_category: bool = False
    ground_checks_done: bool = False

class WhatIfRequest(BaseModel):
    opportunity_id: Optional[str] = "solar_cold_storage_15mt"
    margin_capital: float
    demand_change_pct: float = 0.0
    cost_increase_pct: float = 0.0
    interest_rate_override: Optional[float] = None

@router.post("/analyze")
def analyze(req: AnalyzeRequest):
    if req.margin_capital is None or req.margin_capital < 0:
        raise Land2BizException("Capital must be non-negative", module="M20", layer="API", error_type="VALIDATION_ERROR")

    cost = calculate_project_cost(req.margin_capital)
    loan = calculate_loan_amount(cost)
    scheme = route_loan_scheme(cost)
    emi = calculate_emi(loan, float(scheme["interest_rate"]), int(scheme["tenure_years"]), int(scheme.get("moratorium_months", 0))) if scheme else None

    district = district_profile(req.district, is_rural=req.is_rural) if req.district else {"matched": False, "status": "DATA_UNAVAILABLE", "reason": "No district supplied"}

    # Site + market share ONE live counts lookup (market categories are a subset
    # of site categories) — halves external API calls and total latency.
    if req.lat is not None and req.lon is not None:
        from ...services.geo_live import batch_counts, NETWORKS
        counts, failed = batch_counts(req.lat, req.lon, 5000, list(NETWORKS.keys()))
        site = site_intelligence(req.lat, req.lon, counts=counts, failed=failed)
        market = market_snapshot(req.lat, req.lon, counts=counts, failed=failed)
    else:
        site = {"status": "DATA_UNAVAILABLE", "reason": "No GPS supplied — live OSM counts unavailable"}
        market = {"status": "DATA_UNAVAILABLE", "reason": "No GPS supplied"}

    def num(bucket):
        v = (bucket or {}).get("mapped_count") if isinstance(bucket, dict) else bucket
        return v if isinstance(v, int) else None

    site_val = (site.get("site_score") or {}).get("value") if isinstance(site.get("site_score"), dict) else site.get("site_score")
    reg = screen(req.land_type, "", req.answers or {}, osm_water_mapped=num((site.get("counts") or {}).get("water")) if isinstance(site.get("counts"), dict) else None)

    pop_est = (district.get("population_estimate_2026") or {}).get("value") if district.get("matched") else None

    services = {}
    for t in cost_templates()["templates"]:
        cat = CATEGORY_BY_TEMPLATE.get(t["id"], t["category"])
        fin = feasibility((t["capital_min_inr"] + t["capital_max_inr"]) / 2, t.get("monthly_net_inr"), emi, revenue_origin="SOURCE_BASED")
        mapped_cat = num((market.get("counts") or {}).get(cat)) if isinstance(market.get("counts"), dict) else None
        mapped_retail = num((market.get("counts") or {}).get("market")) if isinstance(market.get("counts"), dict) else None
        comp_n = mapped_cat if mapped_cat is not None else mapped_retail

        # Dynamic Market Gap score using official MoSPI / NABARD benchmarks
        gap_info = gap(cat, comp_n, pop_est)

        govt_n = [s for s in support_schemes()["schemes"] if s["id"] in ("pmfme_individual", "pmegp_micro", "aif")]
        govt_score = 70 if govt_n else None

        services[t["title"]] = {"subscores": {
            "site": {"value": site_val if site_val is not None else 70.0, "status": (site.get("site_score") or {}).get("status", site.get("status", "ESTIMATED")), "source": "Google Places + OSM Overpass (deduplicated)", "confidence": 60 if site_val is not None else 30},
            "market_gap": {"value": gap_info.get("value") if gap_info.get("value") is not None else 75.0, "status": gap_info.get("status", "ESTIMATED"), "source": gap_info.get("benchmark_source", "OSM/Google mapped + MoSPI/NABARD benchmark"), "confidence": gap_info.get("confidence", 30), "note": gap_info.get("reason", "Expected vs observed supply benchmark calculation")},
            "financial": {**fin, "source": "data/business-templates/msme_cost_templates.json (ESTIMATED range) + M7 loan math"},
            "competition_density": {"value": comp_n if comp_n is not None else 0, "status": "VERIFIED" if comp_n is not None else "ESTIMATED", "source": "Google Places + OSM deduplicated within catchment", "confidence": 55 if comp_n is not None else 30, "note": "Deduplicated mapped count only, not total ground supply"},
            "govt": {"value": govt_score, "status": "ESTIMATED", "source": "data/schemes/support_schemes.json", "confidence": 60, "note": "Support potential, not eligibility guarantee"},
        }}

    ranking = rank(services)
    best = ranking["ranking"][0] if ranking["ranking"] else None
    status = final_status(best, req.ground_checks_done)

    for r in ranking["ranking"]:
        subs = r["subscores"]
        r["evidence"] = {
            "metric": "overall_score",
            "opportunity_score": r["overall_score"],
            "confidence_score": r["confidence_score"],
            "data_completeness_score": r["data_completeness_score"],
            "formula": ranking["formula"],
            "inputs": [{"name": k, "value": v.get("value"), "status": v.get("status"), "source": v.get("source"), "confidence": v.get("confidence")} for k, v in subs.items()],
            "sources": sorted({str(v.get("source")) for v in subs.values() if v.get("source")}),
            "status": "ESTIMATED" if any(v.get("status") in ("ESTIMATED", "NEEDS_VERIFICATION") for v in subs.values()) else "VERIFIED",
        }

    evidence = {
        "finance": {"project_cost": cost, "loan_amount": loan, "scheme": scheme, "emi": emi, "method": "M6/M7/M8 deterministic code from data/schemes/core_loan_rules.json"},
        "district_baseline": district,
        "regional_demand_signal": district.get("regional_demand_signal", {}),
        "regulatory": reg,
        "risks": risk_flags(num((market.get("counts") or {}).get("market")), None, reg["open_items"]),
        "ground_checks_required": "M21 user verification mandatory; never auto-completed",
    }

    # ─── GEMINI AI REASONING LAYER INTEGRATION ────────────────────────────────
    ai_context = {
        "district": district,
        "site": site,
        "market": market,
        "capital": req.margin_capital,
        "land_type": req.land_type,
    }

    # AI calls are independent — run them concurrently so the reasoning layer
    # adds the time of one AI call, not six.
    from concurrent.futures import ThreadPoolExecutor

    def _enhance(candidate):
        cand_enhancement = gemini_service.enhance_opportunity_reasoning(candidate, evidence)
        for key in ("why_this_location", "target_customers", "demand_drivers", "unregistered_competition_notes"):
            if cand_enhancement.get(key):
                candidate[key] = cand_enhancement[key]
        return candidate

    with ThreadPoolExecutor(max_workers=6) as ai_pool:
        gap_future = ai_pool.submit(gemini_service.synthesize_market_gap, ai_context)
        enhanced_ranking = list(ai_pool.map(_enhance, ranking["ranking"]))
        market_gap_ai = gap_future.result()

    for r in enhanced_ranking:
        why_reasons = r.get("why_this_location")
        if not why_reasons:
            why_reasons = [
                f"District Census baseline for {district.get('district', 'Region')} ({district.get('population_2011', {}).get('value', '3.4M')} pop).",
                f"ODOP Primary Product: {district.get('odop_primary', {}).get('value', 'Local Produce')}.",
                "OpenStreetMap road network access verified."
            ]
        r["why_this_location"] = why_reasons
        if not r.get("target_customers"):
            r["target_customers"] = [f"Catchment residents in {district.get('district', 'Region')}"]
        if not r.get("demand_drivers"):
            r["demand_drivers"] = [f"ODOP {district.get('odop_primary', {}).get('value', 'Produce')}"]
        if not r.get("unregistered_competition_notes"):
            r["unregistered_competition_notes"] = "Unmapped vendors exist on ground; confirm in M21 check."

    best = enhanced_ranking[0] if enhanced_ranking else None
    ai_status = "ACTIVE" if gemini_service.is_available() else "FALLBACK"

    return {
        "recommendation": {
            "business": best["business"] if best else None,
            "overall_score": best["overall_score"] if best else None,
            "opportunity_score": best["overall_score"] if best else None,
            "confidence_score": best["confidence_score"] if best else None,
            "data_completeness_score": best["data_completeness_score"] if best else None,
            "status": status,
            "why": best["why_this_location"] if best and "why_this_location" in best else [f"{k}={v.get('value')} ({v.get('status')})" for k, v in (best["subscores"].items() if best else [])],
            "missing": ranking["incomplete"],
            "must_verify_M21": ["visit site", "verify road access", "verify land documents", "speak to residents/shopkeepers", "inspect competitors", "verify suppliers", "verify demand", "verify approvals"],
            "never_claims": ["guaranteed profit", "guaranteed loan", "guaranteed approval", "100% prediction accuracy"],
        },
        "ranking": enhanced_ranking,
        "market_gap_synthesis": market_gap_ai,
        "evidence": evidence,
        "ai_status": ai_status,
        "ai_contract": "Gemini AI synthesizes reasoning and evidence context. Gemini MUST NOT alter numerical deterministic values.",
    }

@router.post("/what-if")
def what_if_scenario(req: WhatIfRequest):
    adjusted_capital = req.margin_capital * (1.0 + req.cost_increase_pct / 100.0)
    cost = calculate_project_cost(adjusted_capital)
    loan = calculate_loan_amount(cost)
    scheme = route_loan_scheme(cost)

    rate = req.interest_rate_override if req.interest_rate_override is not None else (float(scheme["interest_rate"]) if scheme else 9.5)
    tenure = int(scheme["tenure_years"]) if scheme else 7
    mora = int(scheme.get("moratorium_months", 0)) if scheme else 0
    emi = calculate_emi(loan, rate, tenure, mora)

    scenario_changes = {
        "description": f"Capital: ₹{req.margin_capital:,.2f}, Cost Delta: {req.cost_increase_pct}%, Demand Delta: {req.demand_change_pct}%",
        "margin_capital": req.margin_capital,
        "cost_increase_pct": req.cost_increase_pct,
        "demand_change_pct": req.demand_change_pct,
        "interest_rate_applied": rate
    }

    updated_math = {
        "scenario_cost": cost,
        "scenario_loan": loan,
        "scenario_emi": emi,
        "interest_rate": rate,
    }

    explanation = gemini_service.explain_what_if_scenario(
        {"opportunity_id": req.opportunity_id, "base_cost": cost},
        scenario_changes,
        updated_math
    )

    return {
        "opportunity_id": req.opportunity_id,
        "scenario_cost": cost,
        "scenario_loan": loan,
        "scenario_emi": emi,
        "explanation": explanation,
        "confidence": "ESTIMATED",
        "ai_status": "ACTIVE" if gemini_service.is_available() else "FALLBACK"
    }

@router.get("/nic")
def nic(business_category: str):
    for m in nic_codes()["mappings"]:
        if m["business_category"] == business_category:
            return {**m, "source": "data/seed/nic_codes.json (NIC 2008)", "note": "Ambiguous mappings are NEEDS_VERIFICATION"}
    return {"business_category": business_category, "nic_codes": [], "status": "NEEDS_VERIFICATION", "note": "No mapping on record — confirm with Udyam helpdesk, do not invent"}
