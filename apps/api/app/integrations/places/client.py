import os
import json
import urllib.request
import urllib.parse
from pathlib import Path
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Load .env relative to this file's project root (apps/api/.env)
_env_path = Path(__file__).resolve().parents[4] / "apps" / "api" / ".env"
if not _env_path.exists():
    # Fallback: two levels up from integrations/places → app → api root
    _env_path = Path(__file__).resolve().parents[3] / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

PLACES_NEW_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"
PLACES_NEW_TEXT_URL = "https://places.googleapis.com/v1/places:searchText"
GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"


class GooglePlacesClient:
    def __init__(self, api_key: Optional[str] = None):
        self._custom_key = api_key

    @property
    def api_key(self) -> str:
        return self._custom_key or os.getenv("GOOGLE_PLACES_API_KEY", "")

    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    def search_nearby(
        self,
        lat: float,
        lng: float,
        radius_m: float = 2000.0,
        included_types: Optional[List[str]] = None,
        max_result_count: int = 20
    ) -> Dict[str, Any]:
        """
        Uses Google Places API (New) searchNearby endpoint.
        """
        if not self.is_configured():
            return {
                "status": "DISABLED",
                "error": "Google Places API key is not configured in .env",
                "places": []
            }

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.userRatingCount,places.location,places.nationalPhoneNumber"
        }

        payload: Dict[str, Any] = {
            "maxResultCount": min(max_result_count, 20),
            "locationRestriction": {
                "circle": {
                    "center": {
                        "latitude": lat,
                        "longitude": lng
                    },
                    "radius": float(radius_m)
                }
            }
        }
        if included_types:
            payload["includedTypes"] = included_types

        try:
            req = urllib.request.Request(
                PLACES_NEW_NEARBY_URL,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                places = data.get("places", [])
                return {
                    "status": "SUCCESS",
                    "count": len(places),
                    "places": [self._format_place_new(p) for p in places]
                }
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            return {
                "status": "API_ERROR",
                "code": e.code,
                "error": f"Google Places API error ({e.code}): {err_body}",
                "places": []
            }
        except Exception as e:
            return {
                "status": "ERROR",
                "error": str(e),
                "places": []
            }

    def search_text(
        self,
        query: str,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        radius_m: float = 5000.0
    ) -> Dict[str, Any]:
        """
        Uses Google Places API (New) searchText endpoint.
        """
        if not self.is_configured():
            return {
                "status": "DISABLED",
                "error": "Google Places API key is not configured",
                "places": []
            }

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.types,places.rating,places.userRatingCount,places.location"
        }

        payload: Dict[str, Any] = {"textQuery": query}
        if lat is not None and lng is not None:
            payload["locationBias"] = {
                "circle": {
                    "center": {"latitude": lat, "longitude": lng},
                    "radius": float(radius_m)
                }
            }

        try:
            req = urllib.request.Request(
                PLACES_NEW_TEXT_URL,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                places = data.get("places", [])
                return {
                    "status": "SUCCESS",
                    "count": len(places),
                    "places": [self._format_place_new(p) for p in places]
                }
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            return {
                "status": "API_ERROR",
                "code": e.code,
                "error": err_body,
                "places": []
            }
        except Exception as e:
            return {
                "status": "ERROR",
                "error": str(e),
                "places": []
            }

    def _format_place_new(self, raw: dict) -> dict:
        disp_name = raw.get("displayName", {})
        name = disp_name.get("text", "") if isinstance(disp_name, dict) else str(disp_name)
        loc = raw.get("location", {})
        return {
            "place_id": raw.get("id"),
            "name": name,
            "address": raw.get("formattedAddress", ""),
            "types": raw.get("types", []),
            "rating": raw.get("rating"),
            "user_rating_count": raw.get("userRatingCount"),
            "lat": loc.get("latitude"),
            "lng": loc.get("longitude"),
            "phone": raw.get("nationalPhoneNumber", ""),
            "source": "Google Places API (New)"
        }
