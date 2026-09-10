"""Decision API: deterministic analysis -> score -> evidence. AI explanation consumes this, never modifies it."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

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

@router.post("/analyze")
def analyze(req: AnalyzeRequest):
    if req.margin_capital is None or req.margin_capital < 0:
        raise Land2BizException("Capital must be non-negative", module="M20", layer="API", error_type="VALIDATION_ERROR")
    cost = calculate_project_cost(req.margin_capital)
    loan = calculate_loan_amount(cost)
    scheme = route_loan_scheme(cost)
    emi = calculate_emi(loan, float(scheme["interest_rate"]), int(scheme["tenure_years"]), int(scheme.get("moratorium_months", 0))) if scheme else None

    district = district_profile(req.district, is_rural=req.is_rural) if req.district else {"matched": False, "status": "DATA_UNAVAILABLE", "reason": "No district supplied"}
    site = site_intelligence(req.lat, req.lon) if req.lat is not None and req.lon is not None else {"status": "DATA_UNAVAILABLE", "reason": "No GPS supplied — live OSM counts unavailable"}
    market = market_snapshot(req.lat, req.lon) if req.lat is not None and req.lon is not None else {"status": "DATA_UNAVAILABLE", "reason": "No GPS supplied"}

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
            "site": {"value": site_val, "status": (site.get("site_score") or {}).get("status", site.get("status", "DATA_UNAVAILABLE")), "source": "Google Places + OSM Overpass (deduplicated)", "confidence": 60 if site_val is not None else 0},
            "market_gap": {"value": gap_info.get("value"), "status": gap_info.get("status"), "source": gap_info.get("benchmark_source", "OSM/Google mapped + MoSPI/NABARD benchmark"), "confidence": gap_info.get("confidence", 0), "note": gap_info.get("reason", "Expected vs observed supply benchmark calculation")},
            "financial": {**fin, "source": "data/business-templates/msme_cost_templates.json (ESTIMATED range) + M7 loan math"},
            "competition_density": {"value": comp_n, "status": "VERIFIED" if comp_n is not None else "DATA_UNAVAILABLE", "source": "Google Places + OSM deduplicated within catchment", "confidence": 55 if comp_n is not None else 0, "note": "Deduplicated mapped count only, not total ground supply"},
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
        "risks": risk_flags(mapped_retail, None, reg["open_items"]),
        "ground_checks_required": "M21 user verification mandatory; never auto-completed",
    }

    return {
        "recommendation": {
            "business": best["business"] if best else None,
            "overall_score": best["overall_score"] if best else None,
            "opportunity_score": best["overall_score"] if best else None,
            "confidence_score": best["confidence_score"] if best else None,
            "data_completeness_score": best["data_completeness_score"] if best else None,
            "status": status,
            "why": [f"{k}={v.get('value')} ({v.get('status')})" for k, v in (best["subscores"].items() if best else [])],
            "missing": ranking["incomplete"],
            "must_verify_M21": ["visit site", "verify road access", "verify land documents", "speak to residents/shopkeepers", "inspect competitors", "verify suppliers", "verify demand", "verify approvals"],
            "never_claims": ["guaranteed profit", "guaranteed loan", "guaranteed approval", "100% prediction accuracy"],
        },
        "ranking": ranking["ranking"],
        "evidence": evidence,
        "ai_contract": "AI may explain this object in words. AI must NOT change any number.",
    }

@router.get("/nic")
def nic(business_category: str):
    for m in nic_codes()["mappings"]:
        if m["business_category"] == business_category:
            return {**m, "source": "data/seed/nic_codes.json (NIC 2008)", "note": "Ambiguous mappings are NEEDS_VERIFICATION"}
    return {"business_category": business_category, "nic_codes": [], "status": "NEEDS_VERIFICATION", "note": "No mapping on record — confirm with Udyam helpdesk, do not invent"}
