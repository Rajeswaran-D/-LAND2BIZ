from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from ...core.data_loader import support_schemes, cost_templates

router = APIRouter()


class MatchRequest(BaseModel):
    business_category: str
    project_cost: float
    district: Optional[str] = None
    is_rural: Optional[bool] = True
    is_special_category: Optional[bool] = False


@router.get("/list")
def scheme_list():
    return support_schemes()


@router.post("/match")
def match(req: MatchRequest):
    data = support_schemes()
    matches = []
    for s in data["schemes"]:
        if s["id"] == "pmfme_individual" and req.business_category in s.get("eligible_categories", []):
            subsidy = min(req.project_cost * s["subsidy_pct"] / 100.0, s["max_subsidy_inr"])
            matches.append({"scheme_id": s["id"], "name": s["name"], "estimated_subsidy_inr": round(subsidy), "confidence": "VERIFIED", "source_url": s["source_url"]})
        elif s["id"] == "pmegp_micro":
            cap = s["max_project_cost_manufacturing_inr"]
            if req.project_cost <= cap:
                key = ("special" if req.is_special_category else "general") + ("_rural" if req.is_rural else "_urban")
                pct = s["subsidy_matrix_pct"][key]
                matches.append({"scheme_id": s["id"], "name": s["name"], "subsidy_pct": pct, "estimated_subsidy_inr": round(req.project_cost * pct / 100.0), "confidence": "VERIFIED", "source_url": s["source_url"], "note": "Margin money held in TDR 3 years, adjusted after physical verification + Udyam."})
        elif s["id"] == "aif" and req.business_category in s.get("eligible_categories", []):
            matches.append({"scheme_id": s["id"], "name": s["name"], "benefit": "3% interest subvention up to Rs 2Cr for 7 years", "confidence": "VERIFIED", "source_url": s["source_url"]})
        elif s["id"] in ("acabc", "dairy_entrepreneurship"):
            matches.append({"scheme_id": s["id"], "name": s["name"], "confidence": "NEEDS_VERIFICATION", "note": s.get("subsidy_note") or s.get("note"), "source_url": s["source_url"]})
    return {"matches": matches, "disclaimer": "Indicative matches only. Final eligibility = bank + implementing agency."}


@router.get("/cost-templates")
def templates():
    return cost_templates()
