import json
import logging
import math
import os
import urllib.parse
import urllib.request
from ..core.provenance import now_iso, unavailable

logger = logging.getLogger(__name__)

# ─── Overpass (OSM) ───────────────────────────────────────────────────────────
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.nchc.org.tw/api/interpreter",
]
NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
OVERPASS_TIMEOUT_S = 30   # Python socket timeout — must be > Overpass query timeout (25s)

# ─── Google Places API ────────────────────────────────────────────────────────
PLACES_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"
PLACES_TEXT_URL   = "https://places.googleapis.com/v1/places:searchText"
PLACES_TIMEOUT_S  = 10

# Maps internal category keys → Google Places includedTypes
PLACES_TYPE_MAP: dict[str, list[str]] = {
    "school":       ["school", "secondary_school", "primary_school"],
    "hospital":     ["hospital", "pharmacy", "doctor", "health"],
    "bank":         ["bank", "atm"],
    "market":       ["supermarket", "grocery_store", "convenience_store", "shopping_mall", "market"],
    "cold_storage": ["storage"],          # best approximation available
    "dairy":        ["food_store"],       # closest match
    "fuel_ev":      ["gas_station", "electric_vehicle_charging_station"],
}

# Category-specific dynamic catchment radii (metres)
CATEGORY_CATCHMENT_M: dict[str, int] = {
    "market": 3000,
    "grocery": 1000,
    "dairy": 1000,
    "school": 3000,
    "hospital": 5000,
    "bank": 3000,
    "fuel_ev": 2000,
    "cold_storage": 10000,
    "food_processing": 10000,
    "agri_depot": 5000,
    "road_km": 5000,
    "water": 5000,
}

NETWORKS = {
    "road_km":      ('way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"](around:{r},{lat},{lon});', "road segments"),
    "water":        ('node["natural"="water"](around:{r},{lat},{lon});way["natural"="water"](around:{r},{lat},{lon});relation["natural"="water"](around:{r},{lat},{lon});', "water bodies"),
    "school":       ('node["amenity"="school"](around:{r},{lat},{lon});', "schools"),
    "hospital":     ('node["amenity"~"^(hospital|clinic|pharmacy)$"](around:{r},{lat},{lon});', "health facilities"),
    "bank":         ('node["amenity"="bank"](around:{r},{lat},{lon});', "banks"),
    "market":       ('node["shop"~"^(supermarket|convenience|grocery|mall|marketplace)$"](around:{r},{lat},{lon});way["shop"~"^(supermarket|convenience|grocery|mall|marketplace)$"](around:{r},{lat},{lon});', "retail outlets"),
    "cold_storage": ('node["shop"="frozen_food"](around:{r},{lat},{lon});node["industrial"="cold_storage"](around:{r},{lat},{lon});way["industrial"="cold_storage"](around:{r},{lat},{lon});', "cold-chain-mapped"),
    "dairy":        ('node["shop"="dairy"](around:{r},{lat},{lon});', "dairy outlets"),
    "fuel_ev":      ('node["amenity"="fuel"](around:{r},{lat},{lon});node["amenity"="charging"](around:{r},{lat},{lon});', "fuel/charging"),
}


# ─── Distance helper ──────────────────────────────────────────────────────────
def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 999999.0
    r = 6371000.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2)**2
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ─── Spatial Entity Deduplication ─────────────────────────────────────────────
def deduplicate_spatial_entities(google_recs: list[dict], osm_recs: list[dict], max_distance_m: float = 50.0) -> tuple[int, list[dict]]:
    """
    Deduplicate Google Places and OSM records using spatial proximity (<50m) and normalized name similarity.
    NEVER does raw Google count + OSM count = total businesses without entity matching.
    """
    merged = []
    osm_matched_ids = set()

    for g in google_recs:
        g_lat, g_lng = g.get("lat"), g.get("lng")
        g_name = (g.get("name") or "").strip().lower()
        match_found = False
        for o in osm_recs:
            if o.get("osm_id") in osm_matched_ids:
                continue
            o_lat, o_lng = o.get("lat"), o.get("lng")
            o_name = (o.get("name") or "").strip().lower()
            dist = haversine_m(g_lat, g_lng, o_lat, o_lng)

            # Match criteria: within 50m spatial radius or identical name within 200m
            if dist <= max_distance_m or (g_name and o_name and g_name == o_name and dist <= 200.0):
                osm_matched_ids.add(o.get("osm_id"))
                merged.append({
                    "entity_id": f"dedup_{g.get('place_id')}_{o.get('osm_id')}",
                    "name": g.get("name") or o.get("name"),
                    "lat": g_lat or o_lat,
                    "lng": g_lng or o_lng,
                    "distance_m": min(g.get("distance_m", 9999), o.get("distance_m", 9999)) if isinstance(g.get("distance_m"), (int, float)) else o.get("distance_m"),
                    "source": "Deduplicated (Google Places + OpenStreetMap)",
                    "provenance": ["Google Places API (New)", "OpenStreetMap Overpass API"],
                    "google_place_id": g.get("place_id"),
                    "osm_id": o.get("osm_id"),
                    "retrieved_at": g.get("retrieved_at") or o.get("retrieved_at"),
                })
                match_found = True
                break
        if not match_found:
            merged.append({
                "entity_id": f"google_{g.get('place_id')}",
                "name": g.get("name"),
                "lat": g_lat, "lng": g_lng,
                "source": "Google Places API (New)",
                "provenance": ["Google Places API (New)"],
                "google_place_id": g.get("place_id"),
                "retrieved_at": g.get("retrieved_at"),
            })

    for o in osm_recs:
        if o.get("osm_id") not in osm_matched_ids:
            merged.append({
                "entity_id": f"osm_{o.get('osm_id')}",
                "name": o.get("name"),
                "lat": o.get("lat"), "lng": o.get("lng"),
                "distance_m": o.get("distance_m"),
                "source": "OpenStreetMap Overpass API",
                "provenance": ["OpenStreetMap Overpass API"],
                "osm_id": o.get("osm_id"),
                "retrieved_at": o.get("retrieved_at"),
            })

    return len(merged), merged


# ─── Google Places helpers ────────────────────────────────────────────────────
def _places_api_key() -> str:
    return os.getenv("GOOGLE_PLACES_API_KEY", "") or os.getenv("GOOGLE_MAPS_API_KEY", "")


def _places_nearby(lat: float, lon: float, radius_m: float, included_types: list[str]) -> list[dict]:
    api_key = _places_api_key()
    if not api_key:
        raise RuntimeError("GOOGLE_PLACES_API_KEY not configured")

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.types,places.location,places.rating",
    }
    payload = json.dumps({
        "includedTypes": included_types[:50],
        "maxResultCount": 20,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lon},
                "radius": float(min(radius_m, 50000)),
            }
        },
    }).encode("utf-8")

    req = urllib.request.Request(PLACES_NEARBY_URL, data=payload, headers=headers)
    with urllib.request.urlopen(req, timeout=PLACES_TIMEOUT_S) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data.get("places", [])


def batch_counts_google(lat: float, lon: float, radius_m: int, keys: list[str]) -> tuple[dict, list[str]]:
    api_key = _places_api_key()
    if not api_key:
        return {}, list(keys)

    stamp = now_iso()
    out: dict = {}
    failed: list[str] = []

    for key in keys:
        if key in ("road_km", "water"):
            failed.append(key)
            continue

        types = PLACES_TYPE_MAP.get(key)
        if not types:
            failed.append(key)
            continue

        r = CATEGORY_CATCHMENT_M.get(key, radius_m)
        try:
            places = _places_nearby(lat, lon, r, types)
            records = []
            for p in places:
                loc = p.get("location", {})
                disp = p.get("displayName", {})
                plat, plng = loc.get("latitude"), loc.get("longitude")
                records.append({
                    "place_id": p.get("id"),
                    "name": disp.get("text", "") if isinstance(disp, dict) else str(disp),
                    "lat": plat,
                    "lng": plng,
                    "distance_m": round(haversine_m(lat, lon, plat, plng)),
                    "types": p.get("types", []),
                    "retrieved_at": stamp,
                })
            out[key] = {
                "mapped_count": len(places),
                "records": records[:50],
                "catchment_radius_m": r,
                "truncated": len(places) >= 20,
                "status": "VERIFIED",
                "meaning": f"Count from Google Places API (New) within {r}m catchment.",
                "retrieved_at": stamp,
            }
            logger.info(f"Google Places [{key}]: {len(places)} results within {r}m")
        except Exception as e:
            logger.warning(f"Google Places failed for key={key}: {e}")
            failed.append(key)

    return out, failed


# ─── Overpass helpers ─────────────────────────────────────────────────────────
def _post_overpass(url: str, data: bytes) -> dict:
    req = urllib.request.Request(url, data=data, headers={"User-Agent": "LAND2BIZ/1.0 (SIH hackathon)"})
    with urllib.request.urlopen(req, timeout=OVERPASS_TIMEOUT_S) as resp:
        return json.loads(resp.read().decode("utf-8"))


def batch_counts_overpass(lat: float, lon: float, radius_m: int, keys: list[str]) -> tuple[dict, list[str]]:
    union_parts = []
    for k in keys:
        if k in NETWORKS:
            r = CATEGORY_CATCHMENT_M.get(k, radius_m)
            union_parts.append(NETWORKS[k][0].format(r=r, lat=lat, lon=lon))
    union = "".join(union_parts)
    query = f"[out:json][timeout:25];({union});out center tags;"
    payload = urllib.parse.urlencode({"data": query}).encode()
    stamp = now_iso()
    last_error = None

    for base in OVERPASS_URLS:
        try:
            logger.info(f"Trying Overpass: {base}")
            data = _post_overpass(base, payload)
            counts: dict[str, int] = {k: 0 for k in keys}
            records: dict[str, list] = {k: [] for k in keys}
            for el in data.get("elements", []):
                tags = el.get("tags", {})
                cat = _classify(tags)
                if cat in counts:
                    counts[cat] += 1
                    records[cat].append(_record_osm(el, tags, lat, lon, stamp))
            out = {}
            for k in keys:
                r = CATEGORY_CATCHMENT_M.get(k, radius_m)
                out[k] = {
                    "mapped_count": counts[k],
                    "records": records[k][:50],
                    "catchment_radius_m": r,
                    "truncated": len(records[k]) > 50,
                    "status": "VERIFIED",
                    "meaning": f"Count of OSM-mapped objects only within {r}m catchment — NOT total real-world businesses.",
                    "retrieved_at": stamp,
                }
            logger.info(f"Overpass success from {base}: {counts}")
            return out, []
        except Exception as e:
            last_error = str(e)
            logger.warning(f"Overpass mirror {base} failed: {e}")
            continue

    logger.error(f"All Overpass mirrors failed. Last error: {last_error}")
    return {}, list(keys)


# ─── Unified batch_counts: Google Places + Overpass with Deduplication ────────
def batch_counts(lat: float, lon: float, radius_m: int, keys: list[str]) -> tuple[dict, list[str]]:
    stamp = now_iso()

    # Step 1: Try Google Places for amenity keys
    g_out, g_failed = batch_counts_google(lat, lon, radius_m, keys)

    # Step 2: Try Overpass for all requested keys
    o_out, o_failed = batch_counts_overpass(lat, lon, radius_m, keys)

    merged: dict = {}
    for k in keys:
        g_data = g_out.get(k)
        o_data = o_out.get(k)
        r = CATEGORY_CATCHMENT_M.get(k, radius_m)

        if g_data and o_data and g_data.get("status") == "VERIFIED" and o_data.get("status") == "VERIFIED":
            g_recs = g_data.get("records", [])
            o_recs = o_data.get("records", [])
            dedup_count, dedup_recs = deduplicate_spatial_entities(g_recs, o_recs)
            merged[k] = {
                "mapped_count": dedup_count,
                "google_mapped_count": len(g_recs),
                "osm_mapped_count": len(o_recs),
                "deduplicated_observed_count": dedup_count,
                "records": dedup_recs[:50],
                "catchment_radius_m": r,
                "status": "VERIFIED",
                "meaning": f"Deduplicated observed supply from Google Places ({len(g_recs)}) + OSM ({len(o_recs)}) within {r}m.",
                "retrieved_at": stamp,
                "deduplication": "Spatial proximity (<50m) & normalized name matching applied. No raw summation.",
            }
        elif g_data and g_data.get("status") == "VERIFIED":
            merged[k] = g_data
        elif o_data and o_data.get("status") == "VERIFIED":
            merged[k] = o_data
        else:
            merged[k] = unavailable(
                "Google Places API + OpenStreetMap Overpass",
                f"lat={lat} lon={lon} catchment={r}m",
                k,
                "Both Google Places and Overpass failed for this category",
                "Category excluded from scoring",
                "Check API key or network connectivity",
                "https://places.googleapis.com/",
            )

    final_failed = [k for k in keys if k not in g_out and k in o_failed]
    return merged, final_failed


# ─── Shared helpers ───────────────────────────────────────────────────────────
def _record_osm(el: dict, tags: dict, lat: float, lon: float, stamp: str) -> dict:
    plat = el.get("lat", el.get("center", {}).get("lat"))
    plon = el.get("lon", el.get("center", {}).get("lon"))
    dist = None
    if plat is not None and plon is not None:
        dist = round(haversine_m(lat, lon, plat, plon))
    return {
        "osm_id": f"{el.get('type')}/{el.get('id')}",
        "name": tags.get("name", ""),
        "lat": plat, "lng": plon,
        "tags": {k: tags[k] for k in ("amenity", "shop", "industrial", "highway", "natural", "building") if k in tags},
        "distance_m": dist,
        "retrieved_at": stamp,
    }


def _classify(tags: dict) -> str | None:
    hw, amen, shop, ind, nat = tags.get("highway"), tags.get("amenity"), tags.get("shop"), tags.get("industrial"), tags.get("natural")
    bldg = tags.get("building")

    # Exclude non-commercial residential/civic buildings from retail counts unless explicitly tagged
    if bldg in ("house", "residential", "apartments", "civic", "government") and not shop and amen not in ("school", "hospital", "clinic", "pharmacy", "bank"):
        return None

    if hw in ("motorway", "trunk", "primary", "secondary", "tertiary"):
        return "road_km"
    if nat == "water":
        return "water"
    if amen == "school":
        return "school"
    if amen in ("hospital", "clinic", "pharmacy"):
        return "hospital"
    if amen == "bank":
        return "bank"
    if shop in ("supermarket", "convenience", "grocery", "mall", "marketplace"):
        return "market"
    if shop == "frozen_food" or ind == "cold_storage":
        return "cold_storage"
    if shop == "dairy":
        return "dairy"
    if amen in ("fuel", "charging"):
        return "fuel_ev"
    return None


# ─── Reverse geocode ──────────────────────────────────────────────────────────
def reverse_geocode(lat: float, lon: float) -> dict:
    params = urllib.parse.urlencode({"lat": lat, "lon": lon, "format": "jsonv2", "zoom": 10})
    req = urllib.request.Request(
        f"{NOMINATIM_URL}?{params}",
        headers={"User-Agent": "LAND2BIZ/1.0 (SIH hackathon)"}
    )
    stamp = now_iso()
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        addr = data.get("address", {})
        return {
            "district": addr.get("county") or addr.get("state_district") or addr.get("city_district") or "",
            "state": addr.get("state") or "",
            "display_name": data.get("display_name", ""),
            "query": {"lat": lat, "lon": lon},
            "retrieved_at": stamp,
            "status": "VERIFIED",
            "source": "OpenStreetMap Nominatim reverse-geocode",
            "source_url": "https://nominatim.openstreetmap.org/",
            "note": "Location normalization only — never proof of business existence.",
        }
    except Exception as e:
        return unavailable(
            "OpenStreetMap Nominatim", f"reverse lat={lat} lon={lon}", "district/state",
            str(e) or "request failed",
            "District baseline cannot auto-match; user must pick district",
            "Enter Tamil Nadu district manually",
            "https://nominatim.openstreetmap.org/"
        )


# ─── Public API ───────────────────────────────────────────────────────────────
def _num(bucket: dict) -> int | None:
    v = (bucket or {}).get("mapped_count")
    return v if isinstance(v, int) else None


def site_intelligence(lat: float, lon: float) -> dict:
    keys = list(NETWORKS.keys())
    counts, failed = batch_counts(lat, lon, 5000, keys)

    road = _num(counts.get("road_km")) or 0
    water = _num(counts.get("water") or {}) or 0
    road_score = min(100, road * 2) if "road_km" not in failed else None
    amen_vals = [_num(counts.get(k)) for k in ("school", "hospital", "bank", "market")]
    amenity_score = min(100, sum(v for v in amen_vals if v is not None) * 3) if any(v is not None for v in amen_vals) else None
    site_score = round(0.5 * (road_score or 0) + 0.5 * (amenity_score or 0)) if (road_score is not None or amenity_score is not None) else None

    flags = []
    if water > 0:
        flags.append({"rule": "R2_water_body", "flag": "Water body within 5km — confirm clearance with revenue authority.", "confidence": "VERIFIED"})
    flags.append({"rule": "R5_local_noc", "flag": "Gram Panchayat / Municipal NOC required for commercial setup.", "confidence": "VERIFIED"})

    has_google = bool(_places_api_key())
    used_sources = []
    if has_google:
        used_sources.append("Google Places API (New) — live query")
    if any(k in ("road_km", "water") for k in keys) or not has_google:
        used_sources.append("OpenStreetMap Overpass API (live query)")

    status = "DATA_UNAVAILABLE" if failed == keys else ("VERIFIED" if not failed else "ESTIMATED")
    return {
        "lat": lat, "lon": lon, "catchment_radii_m": CATEGORY_CATCHMENT_M,
        "counts": counts, "failed_networks": failed,
        "road_score":    {"value": road_score,    "formula": "min(100, mapped_major_road_segments * 2)",              "status": "DATA_UNAVAILABLE" if road_score is None else status},
        "amenity_score": {"value": amenity_score, "formula": "min(100, (schools+hospitals+banks+retail) * 3)",        "status": "DATA_UNAVAILABLE" if amenity_score is None else status},
        "site_score":    {"value": site_score,    "formula": "0.5*road + 0.5*amenity",                               "status": "DATA_UNAVAILABLE" if site_score is None else status},
        "regulatory_flags": flags,
        "confidence": status,
        "sources": used_sources or ["No external data source reachable"],
        "note": "Business counts from Google Places (registered businesses) + OSM with spatial deduplication (<50m).",
    }


def market_snapshot(lat: float, lon: float) -> dict:
    cats = ["market", "cold_storage", "dairy", "fuel_ev", "bank"]
    counts, failed = batch_counts(lat, lon, 5000, cats)
    cold  = _num(counts.get("cold_storage"))
    dairy = _num(counts.get("dairy"))
    gaps  = []
    if cold == 0:
        gaps.append({"niche": "Cold-chain / preservation", "signal": "No cold-chain businesses found within catchment — potential gap", "confidence": "NEEDS_VERIFICATION"})
    if dairy == 0:
        gaps.append({"niche": "Dairy collection", "signal": "No dairy outlets found within catchment — potential gap", "confidence": "NEEDS_VERIFICATION"})
    status = "DATA_UNAVAILABLE" if failed == cats else ("VERIFIED" if not failed else "ESTIMATED")
    return {
        "lat": lat, "lon": lon, "catchment_radii_m": CATEGORY_CATCHMENT_M,
        "counts": counts, "failed": failed,
        "gaps": gaps,
        "confidence": status,
        "sources": ["Google Places API (New)", "OpenStreetMap Overpass API (deduplicated)"],
        "note": "Deduplicated counts from Google Places + OSM. Zero does NOT mean zero exist — verify on ground.",
    }
