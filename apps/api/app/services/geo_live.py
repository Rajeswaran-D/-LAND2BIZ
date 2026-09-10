import json
import logging
import math
import os
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from ..core.provenance import now_iso, unavailable

logger = logging.getLogger(__name__)

# ─── Overpass (OSM) ───────────────────────────────────────────────────────────
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.nchc.org.tw/api/interpreter",
]
NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_TIMEOUT_S = 15   # Python socket timeout — must be > Overpass query timeout (10s)
OVERPASS_QUERY_TIMEOUT_S = 10
NOMINATIM_REQUEST_GAP_S = 1.05  # usage policy: max ~1 request/second

# Latency controls: mirror circuit-breaker + result caching (see batch_counts)
OVERPASS_MIRROR_COOLDOWN_S = 300   # skip a mirror that just failed for this long
COUNTS_CACHE_TTL_S = 600           # successful counts cached per rounded location
COUNTS_NEGATIVE_TTL_S = 60         # all-sources-failed results cached briefly
DISK_CACHE_TTL_S = 1800            # disk cache lives longer (survives restarts)
GOOGLE_RATE_LIMIT_COOLDOWN_S = 60  # skip Google after a 429 for this long
NOMINATIM_RATE_LIMIT_COOLDOWN_S = 60
_counts_cache: dict[tuple, tuple[float, dict, list[str]]] = {}
_inflight: dict[tuple, threading.Event] = {}
_cache_lock = threading.Lock()
_mirror_cooldown: dict[str, float] = {}
_google_cooldown_until: float = 0.0
_nominatim_cooldown_until: float = 0.0
_nominatim_last_request: float = 0.0
_nominatim_pace_lock = threading.Lock()

# Disk cache: survives dev-server restarts so quota-funded data is not lost.
from pathlib import Path
_CACHE_PATH = Path(__file__).resolve().parents[2] / ".cache" / "geo_counts.json"


def _disk_load() -> dict:
    try:
        return json.loads(_CACHE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _disk_save(store: dict) -> None:
    try:
        _CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
        _CACHE_PATH.write_text(json.dumps(store), encoding="utf-8")
    except Exception as e:
        logger.warning(f"geo disk cache write failed: {e}")

# Fallback: OSM category keyword search (used when Overpass and Google are unreachable).
# Kept minimal — Nominatim public API is heavily rate-limited.
NOMINATIM_KEYWORDS: dict[str, list[str]] = {
    "school":       ["school"],
    "hospital":     ["hospital", "pharmacy"],
    "bank":         ["bank"],
    "market":       ["supermarket", "grocery"],
    "cold_storage": ["cold storage"],
    "dairy":        ["dairy"],
    "fuel_ev":      ["fuel station"],
}

# ─── Google Places API ────────────────────────────────────────────────────────
PLACES_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"
PLACES_TEXT_URL   = "https://places.googleapis.com/v1/places:searchText"
PLACES_TIMEOUT_S  = 10

# Maps internal category keys → Google Places includedTypes
PLACES_TYPE_MAP: dict[str, list[str]] = {
    "school":       ["school", "secondary_school", "primary_school"],
    "hospital":     ["hospital", "pharmacy", "doctor"],
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
    global _google_cooldown_until
    if time.time() < _google_cooldown_until:
        raise RuntimeError("Google Places cooling down after rate limit (429)")

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
    try:
        with urllib.request.urlopen(req, timeout=PLACES_TIMEOUT_S) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        if e.code == 429:
            _google_cooldown_until = time.time() + GOOGLE_RATE_LIMIT_COOLDOWN_S
            raise RuntimeError("Google Places rate-limited (429) — cooling down")
        raise
    return data.get("places", [])


def batch_counts_google(lat: float, lon: float, radius_m: int, keys: list[str]) -> tuple[dict, list[str]]:
    api_key = _places_api_key()
    if not api_key:
        return {}, list(keys)

    stamp = now_iso()
    out: dict = {}
    failed: list[str] = []
    amenity_keys = [k for k in keys if k not in ("road_km", "water") and k in PLACES_TYPE_MAP]
    failed.extend(k for k in keys if k not in amenity_keys)

    def _count_key(key: str):
        types = PLACES_TYPE_MAP[key]
        r = CATEGORY_CATCHMENT_M.get(key, radius_m)
        try:
            places = _places_nearby(lat, lon, r, types)
        except Exception as e:
            logger.warning(f"Google Places failed for key={key}: {e}")
            return key, None
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
        bucket = {
            "mapped_count": len(places),
            "records": records[:50],
            "catchment_radius_m": r,
            "truncated": len(places) >= 20,
            "status": "VERIFIED",
            "meaning": f"Count from Google Places API (New) within {r}m catchment.",
            "retrieved_at": stamp,
        }
        logger.info(f"Google Places [{key}]: {len(places)} results within {r}m")
        return key, bucket

    with ThreadPoolExecutor(max_workers=min(len(amenity_keys), 4) or 1) as ex:
        for key, bucket in ex.map(_count_key, amenity_keys):
            if bucket is None:
                failed.append(key)
            else:
                out[key] = bucket

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
    query = f"[out:json][timeout:{OVERPASS_QUERY_TIMEOUT_S}];({union});out center tags;"
    payload = urllib.parse.urlencode({"data": query}).encode()
    stamp = now_iso()
    last_error = None

    # Circuit-breaker: skip mirrors that failed recently, attempt the rest in parallel.
    cutoff = time.time()
    live_mirrors = [u for u in OVERPASS_URLS if _mirror_cooldown.get(u, 0) <= cutoff]
    if not live_mirrors:
        logger.info("All Overpass mirrors in cooldown — skipping Overpass this round")
        return {}, list(keys)

    def _try_mirror(base: str) -> dict:
        return _post_overpass(base, payload)

    ex = ThreadPoolExecutor(max_workers=len(live_mirrors))
    futures = {ex.submit(_try_mirror, base): base for base in live_mirrors}
    try:
        for fut in as_completed(futures):
            base = futures[fut]
            try:
                data = fut.result()
            except Exception as e:
                last_error = str(e)
                _mirror_cooldown[base] = time.time() + OVERPASS_MIRROR_COOLDOWN_S
                logger.warning(f"Overpass mirror {base} failed: {e}")
                continue
            for u in live_mirrors:
                _mirror_cooldown.pop(u, None)
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
    finally:
        ex.shutdown(wait=False, cancel_futures=True)

    logger.error(f"All Overpass mirrors failed. Last error: {last_error}")
    return {}, list(keys)


# ─── Nominatim fallback (approximate OSM POI counts) ─────────────────────────
def _search_nominatim_raw(q: str, lat: float, lon: float, radius_m: int) -> list[dict]:
    # Cross-thread pacing: never exceed ~1 request/second across ALL threads.
    global _nominatim_last_request
    with _nominatim_pace_lock:
        wait = NOMINATIM_REQUEST_GAP_S - (time.time() - _nominatim_last_request)
        if wait > 0:
            time.sleep(wait)
        _nominatim_last_request = time.time()

    dlat = radius_m / 111_320.0
    dlon = radius_m / (111_320.0 * max(0.2, math.cos(math.radians(lat))))
    params = urllib.parse.urlencode({
        "q": q,
        "viewbox": f"{lon - dlon},{lat + dlat},{lon + dlon},{lat - dlat}",
        "bounded": 1,
        "format": "jsonv2",
        "limit": 50,
    })
    req = urllib.request.Request(
        f"{NOMINATIM_SEARCH_URL}?{params}",
        headers={"User-Agent": "LAND2BIZ/1.0 (SIH hackathon)"}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _search_nominatim(q: str, lat: float, lon: float, radius_m: int) -> list[dict]:
    """Keyword search with retry/backoff + per-keyword disk cache (30 min)."""
    global _nominatim_cooldown_until
    if time.time() < _nominatim_cooldown_until:
        raise RuntimeError("Nominatim cooling down after rate limit (429)")

    cache_key = json.dumps(["nominatim", round(lat, 2), round(lon, 2), q])
    disk = _disk_load().get(cache_key)
    if disk and disk.get("expires", 0) > time.time() and isinstance(disk.get("results"), list):
        return disk["results"]

    last_err: Exception | None = None
    for attempt in range(3):
        try:
            results = _search_nominatim_raw(q, lat, lon, radius_m)
            store = _disk_load()
            store[cache_key] = {"expires": time.time() + DISK_CACHE_TTL_S, "results": results}
            _disk_save(store)
            return results
        except urllib.error.HTTPError as e:
            last_err = e
            logger.warning(f"Nominatim HTTP {e.code} for '{q}' (attempt {attempt + 1})")
            if e.code in (401, 403):
                raise
            if e.code == 429:
                time.sleep(2 * (attempt + 1))  # 429s are transient — back off and retry
        except Exception as e:
            last_err = e
            logger.warning(f"Nominatim error for '{q}' (attempt {attempt + 1}): {e}")
            time.sleep(1)
    if isinstance(last_err, urllib.error.HTTPError) and last_err.code == 429:
        _nominatim_cooldown_until = time.time() + NOMINATIM_RATE_LIMIT_COOLDOWN_S
    raise last_err if last_err else RuntimeError("Nominatim search failed")


def batch_counts_nominatim(lat: float, lon: float, radius_m: int, keys: list[str]) -> tuple[dict, list[str]]:
    """
    Fallback POI counts from OSM Nominatim bounded keyword search when both
    Google Places and Overpass are unreachable. Approximate: keyword-indexed,
    capped at 50 results per keyword, so zero does NOT mean zero exist.
    """
    stamp = now_iso()
    out: dict = {}
    failed: list[str] = []

    for key in keys:
        words = NOMINATIM_KEYWORDS.get(key)
        if not words:
            failed.append(key)
            continue

        r = CATEGORY_CATCHMENT_M.get(key, radius_m)
        records: list[dict] = []
        seen: set = set()
        try:
            for w in words:
                for el in _search_nominatim(w, lat, lon, r):
                    oid = el.get("osm_id")
                    if oid in seen:
                        continue
                    seen.add(oid)
                    try:
                        plat, plng = float(el.get("lat")), float(el.get("lon"))
                    except (TypeError, ValueError):
                        continue
                    records.append({
                        "osm_id": f"nominatim/{oid}",
                        "name": el.get("name", ""),
                        "lat": plat, "lng": plng,
                        "distance_m": round(haversine_m(lat, lon, plat, plng)),
                        "category": el.get("category") or el.get("class"),
                        "retrieved_at": stamp,
                    })
        except Exception as e:
            logger.warning(f"Nominatim fallback failed for key={key}: {e}")
            failed.append(key)
            continue

        out[key] = {
            "mapped_count": len(records),
            "records": records[:50],
            "catchment_radius_m": r,
            "truncated": len(records) >= 50,
            "status": "ESTIMATED",
            "meaning": f"Approximate count of OSM-mapped '{key}' objects via Nominatim keyword search within {r}m (fallback source — not exhaustive; zero does NOT mean zero exist).",
            "source": "OpenStreetMap Nominatim (fallback keyword search)",
            "retrieved_at": stamp,
        }
        logger.info(f"Nominatim fallback [{key}]: {len(records)} results within {r}m")

    return out, failed


# ─── Unified batch_counts: Google Places + Overpass with Deduplication ────────
def _disk_key(lat: float, lon: float, radius_m: int, keys: list[str]) -> str:
    return json.dumps([round(lat, 3), round(lon, 3), radius_m, sorted(keys)])


def batch_counts(lat: float, lon: float, radius_m: int, keys: list[str]) -> tuple[dict, list[str]]:
    # Location rounded to ~110m — same neighbourhood reuses the cached counts.
    cache_key = (round(lat, 3), round(lon, 3), radius_m, tuple(sorted(keys)))
    with _cache_lock:
        cached = _counts_cache.get(cache_key)
        if cached and cached[0] > time.time():
            logger.info(f"batch_counts cache hit for {cache_key}")
            return cached[1], cached[2]
        evt = _inflight.get(cache_key)
        if evt is not None:
            is_owner = False
        else:
            evt = threading.Event()
            _inflight[cache_key] = evt
            is_owner = True

    if not is_owner:
        # Another thread is already computing this exact request — share its result.
        evt.wait(timeout=90)
        with _cache_lock:
            cached = _counts_cache.get(cache_key)
        if cached and cached[0] > time.time():
            return cached[1], cached[2]
        return _compute_counts(lat, lon, radius_m, keys, cache_key)

    try:
        # Memory miss — try the disk cache (survives server restarts) before
        # spending external-API quota.
        disk = _disk_load().get(_disk_key(lat, lon, radius_m, keys))
        if disk and disk.get("expires", 0) > time.time() and isinstance(disk.get("merged"), dict):
            with _cache_lock:
                _counts_cache[cache_key] = (disk["expires"], disk["merged"], disk.get("failed", []))
            logger.info("batch_counts disk-cache hit")
            return disk["merged"], disk.get("failed", [])
        return _compute_counts(lat, lon, radius_m, keys, cache_key)
    finally:
        with _cache_lock:
            done = _inflight.pop(cache_key, None)
        if done:
            done.set()


def _compute_counts(lat: float, lon: float, radius_m: int, keys: list[str], cache_key: tuple) -> tuple[dict, list[str]]:
    stamp = now_iso()

    # Step 1: Try Google Places for amenity keys
    g_out, g_failed = batch_counts_google(lat, lon, radius_m, keys)

    # Step 2: Try Overpass for all requested keys
    o_out, o_failed = batch_counts_overpass(lat, lon, radius_m, keys)

    # Step 3: Nominatim keyword fallback for keys neither source could provide
    missing = [k for k in keys if k not in g_out and k not in o_out]
    n_out: dict = {}
    if missing:
        n_out, _ = batch_counts_nominatim(lat, lon, radius_m, missing)

    merged: dict = {}
    for k in keys:
        g_data = g_out.get(k)
        o_data = o_out.get(k)
        n_data = n_out.get(k)
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
        elif n_data:
            merged[k] = n_data
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

    final_failed = [k for k in keys if k not in g_out and k not in o_out and k not in n_out]
    ttl = COUNTS_CACHE_TTL_S if not final_failed else COUNTS_NEGATIVE_TTL_S
    with _cache_lock:
        _counts_cache[cache_key] = (time.time() + ttl, merged, final_failed)

    if len(final_failed) < len(keys):
        # Persist results that contain real data (even partial) so restarts /
        # quota exhaustion don't lose them.
        disk = _disk_load()
        disk[_disk_key(lat, lon, radius_m, keys)] = {
            "expires": time.time() + DISK_CACHE_TTL_S,
            "merged": merged,
            "failed": final_failed,
        }
        _disk_save(disk)
    elif len(final_failed) == len(keys):
        # Total live failure (e.g., quota exhausted) — serve the last known good
        # counts rather than "Data Unavailable" everywhere.
        disk = _disk_load()
        stale = disk.get(_disk_key(lat, lon, radius_m, keys))
        if stale and isinstance(stale.get("merged"), dict):
            logger.warning("All live sources failed — serving stale cached counts")
            return stale["merged"], stale.get("failed", [])

    return merged, final_failed


# ─── Startup warmup ───────────────────────────────────────────────────────────
def warmup_external_sources() -> None:
    """
    Probe Overpass mirrors once at startup (background thread) so the first
    real user request doesn't pay for dead-mirror timeouts: failures put the
    mirrors straight into their cooldown.
    """
    def _probe():
        try:
            batch_counts_overpass(11.0168, 76.9558, 2000, ["bank"])
            logger.info("Overpass warmup probe finished")
        except Exception as e:
            logger.warning(f"Overpass warmup probe error: {e}")

    threading.Thread(target=_probe, daemon=True, name="geo-warmup").start()


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


def site_intelligence(lat: float, lon: float, counts: dict | None = None, failed: list[str] | None = None) -> dict:
    keys = list(NETWORKS.keys())
    if counts is None:
        counts, failed = batch_counts(lat, lon, 5000, keys)
    else:
        failed = failed if failed is not None else []

    road = _num(counts.get("road_km")) or 0
    water = _num(counts.get("water")) or 0
    road_score = min(100, road * 2) if "road_km" not in failed and _num(counts.get("road_km")) is not None else None
    amen_vals = [_num(counts.get(k)) for k in ("school", "hospital", "bank", "market")]
    amenity_total = sum(v for v in amen_vals if v is not None)
    amenity_score = min(100, amenity_total * 3) if any(v is not None for v in amen_vals) else None

    # Blend only the components we actually have — never silently score a
    # missing component as 0 (that produced misleading scores like 3/100).
    parts = [s for s in (road_score, amenity_score) if s is not None]
    site_score = round(sum(parts) / len(parts)) if parts else None

    # Sparse mapped data (rural OSM / keyword fallback): very few mapped objects
    # cannot support a confident score — flag it instead of showing a bare low number.
    sparse = amenity_total < 5
    score_status = "NEEDS_VERIFICATION" if sparse else None

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
    if any(isinstance(c, dict) and str(c.get("source", "")).startswith("OpenStreetMap Nominatim") for c in counts.values()):
        used_sources.append("OpenStreetMap Nominatim — approximate POI keyword search (fallback)")

    bucket_statuses = [c.get("status") for c in counts.values() if isinstance(c, dict)]
    status = "DATA_UNAVAILABLE" if failed == keys else ("ESTIMATED" if "ESTIMATED" in bucket_statuses else "VERIFIED")
    if site_score is not None and score_status:
        status = score_status  # sparse-data scores must not read as confident

    notice = None
    if time.time() < _google_cooldown_until:
        notice = "Google Places quota exhausted — showing OpenStreetMap (OSM) approximate counts."
    if sparse and site_score is not None:
        notice = ((notice + " " if notice else "") +
                  f"Only {amenity_total} amenity businesses are mapped in this catchment — mapped coverage is low, so the site score is indicative only, not a ranking.")
    if status == "DATA_UNAVAILABLE":
        notice = ((notice + " " if notice else "") +
                  "All live sources currently unreachable — no live counts available for this location.")

    return {
        "lat": lat, "lon": lon, "catchment_radii_m": CATEGORY_CATCHMENT_M,
        "counts": counts, "failed_networks": failed,
        "road_score":    {"value": road_score,    "formula": "min(100, mapped_major_road_segments * 2)",              "status": "DATA_UNAVAILABLE" if road_score is None else status},
        "amenity_score": {"value": amenity_score, "formula": "min(100, (schools+hospitals+banks+retail) * 3)",        "status": "DATA_UNAVAILABLE" if amenity_score is None else status},
        "site_score":    {"value": site_score,    "formula": "0.5*road + 0.5*amenity",                               "status": "DATA_UNAVAILABLE" if site_score is None else status},
        "regulatory_flags": flags,
        "confidence": status,
        "notice": notice,
        "sources": used_sources or ["No external data source reachable"],
        "note": "Business counts from Google Places (registered businesses) + OSM with spatial deduplication (<50m).",
    }


def market_snapshot(lat: float, lon: float, counts: dict | None = None, failed: list[str] | None = None) -> dict:
    cats = ["market", "cold_storage", "dairy", "fuel_ev", "bank"]
    if counts is None:
        counts, failed = batch_counts(lat, lon, 5000, cats)
        failed = failed or []
    else:
        # Counts were already fetched (e.g., shared with site_intelligence).
        failed = [k for k in cats if k in (failed or []) or not isinstance(counts.get(k), dict) or counts[k].get("mapped_count") is None]
    cold  = _num(counts.get("cold_storage"))
    dairy = _num(counts.get("dairy"))
    gaps  = []
    if cold == 0:
        gaps.append({"niche": "Cold-chain / preservation", "signal": "No cold-chain businesses found within catchment — potential gap", "confidence": "NEEDS_VERIFICATION"})
    if dairy == 0:
        gaps.append({"niche": "Dairy collection", "signal": "No dairy outlets found within catchment — potential gap", "confidence": "NEEDS_VERIFICATION"})
    bucket_statuses = [c.get("status") for c in counts.values() if isinstance(c, dict)]
    status = "DATA_UNAVAILABLE" if failed == cats else ("ESTIMATED" if "ESTIMATED" in bucket_statuses else "VERIFIED")

    notice = None
    if time.time() < _google_cooldown_until:
        notice = "Google Places quota exhausted — showing OpenStreetMap (OSM) approximate counts."
    if status == "DATA_UNAVAILABLE":
        notice = ((notice + " " if notice else "") +
                  "All live sources currently unreachable — no live counts available for this location.")

    return {
        "lat": lat, "lon": lon, "catchment_radii_m": CATEGORY_CATCHMENT_M,
        "counts": counts, "failed": failed,
        "gaps": gaps,
        "confidence": status,
        "notice": notice,
        "sources": ["Google Places API (New)", "OpenStreetMap Overpass API (deduplicated)",
                    "OpenStreetMap Nominatim (approximate fallback)"],
        "note": "Deduplicated counts from Google Places + OSM. Zero does NOT mean zero exist — verify on ground.",
    }
