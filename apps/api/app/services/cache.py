"""Tiny file cache for external calls: query hash + original timestamp preserved."""
from __future__ import annotations
import hashlib, json, os, time
from ..core.provenance import now_iso

def _path(cache_dir: str, key: str) -> str:
    return os.path.join(cache_dir, hashlib.sha256(key.encode()).hexdigest() + ".json")

def get(cache_dir: str, key: str, max_age_s: int = 86400) -> dict | None:
    p = _path(cache_dir, key)
    if not os.path.exists(p):
        return None
    try:
        with open(p, encoding="utf-8") as f:
            entry = json.load(f)
        if time.time() - entry.get("cached_at_epoch", 0) > max_age_s:
            return {"stale": True, **entry}
        return entry
    except Exception:
        return None

def put(cache_dir: str, key: str, payload: dict, source: str, version: str = "1.0") -> dict:
    os.makedirs(cache_dir, exist_ok=True)
    entry = {"query_key": key, "source": source, "version": version,
             "retrieved_at": now_iso(), "cached_at_epoch": time.time(), "payload": payload}
    with open(_path(cache_dir, key), "w", encoding="utf-8") as f:
        json.dump(entry, f)
    return entry
