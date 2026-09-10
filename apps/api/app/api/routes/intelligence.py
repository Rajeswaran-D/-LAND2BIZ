from fastapi import APIRouter, Query
from pydantic import BaseModel

from ...services.geo_live import site_intelligence, market_snapshot, reverse_geocode
from ...services.tamilnadu_data import district_profile
from ...core.exceptions import Land2BizException

router = APIRouter()


class GeoRequest(BaseModel):
    lat: float
    lon: float


@router.post("/site")
def site(req: GeoRequest):
    if not (-90 <= req.lat <= 90 and -180 <= req.lon <= 180):
        raise Land2BizException("Invalid coordinates", module="M1", layer="API", error_type="VALIDATION_ERROR")
    geo = reverse_geocode(req.lat, req.lon)
    intel = site_intelligence(req.lat, req.lon)
    profile = district_profile(geo.get("district", "")) if geo.get("district") else {"matched": False, "confidence": "DATA_UNAVAILABLE"}
    return {"geo": geo, "site": intel, "district_baseline": profile}


@router.post("/market")
def market(req: GeoRequest):
    if not (-90 <= req.lat <= 90 and -180 <= req.lon <= 180):
        raise Land2BizException("Invalid coordinates", module="M3", layer="API", error_type="VALIDATION_ERROR")
    snap = market_snapshot(req.lat, req.lon)
    return snap


@router.get("/district")
def district(name: str = Query(..., description="Tamil Nadu district name")):
    profile = district_profile(name)
    if not profile.get("matched"):
        raise Land2BizException(f"District '{name}' not matched", module="M1", layer="API", error_type="NOT_FOUND")
    return profile
