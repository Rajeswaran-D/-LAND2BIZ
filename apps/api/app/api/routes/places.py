from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from ...integrations.places import GooglePlacesClient

router = APIRouter()
client = GooglePlacesClient()

@router.get("/status")
def get_places_status():
    configured = client.is_configured()
    return {
        "status": "CONFIGURED" if configured else "NOT_CONFIGURED",
        "api_key_present": configured,
        "note": "Google Places API key registered in backend environment."
    }

@router.get("/nearby")
def get_nearby_places(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: float = Query(2000.0, description="Radius in meters"),
    types: Optional[str] = Query(None, description="Comma-separated place types e.g. restaurant,store")
):
    type_list = [t.strip() for t in types.split(",")] if types else None
    res = client.search_nearby(lat=lat, lng=lng, radius_m=radius, included_types=type_list)
    return res

@router.get("/search")
def search_places(
    query: str = Query(..., description="Text query e.g. Cold storage in Madurai"),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius: float = Query(5000.0)
):
    res = client.search_text(query=query, lat=lat, lng=lng, radius_m=radius)
    return res
