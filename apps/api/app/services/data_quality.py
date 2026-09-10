"""Data quality engine: schema/dupe/range/hierarchy checks. Flags, never silently repairs."""
from __future__ import annotations
import json, os
from ..core.provenance import now_iso

def _load(path: str):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def check_districts(path: str) -> dict:
    d = _load(path)
    recs = d.get("districts", [])
    seen, dupes, invalid, missing = set(), 0, [], 0
    for r in recs:
        name = r.get("name")
        if name in seen:
            dupes += 1
        seen.add(name)
        for f in ("area_km2", "population_2011", "density_2011"):
            if r.get(f) is None:
                missing += 1
            elif not isinstance(r[f], (int, float)) or r[f] <= 0:
                invalid.append({"district": name, "field": f, "value": r.get(f)})
    return {"dataset": "tamilnadu_districts", "records": len(recs), "valid": len(recs) - len(invalid),
            "invalid": len(invalid), "duplicates": dupes, "missing": missing,
            "invalid_details": invalid, "checked_at": now_iso()}

def check_odop(district_path: str, odop_path: str) -> dict:
    districts = {d["name"] for d in _load(district_path).get("districts", [])}
    odop = _load(odop_path).get("districts", {})
    missing, extra = [n for n in districts if n not in odop], [n for n in odop if n not in districts]
    return {"dataset": "tamilnadu_odop", "records": len(odop), "valid": len(odop) - len(extra),
            "invalid": len(extra), "duplicates": 0, "missing": len(missing),
            "missing_districts": missing, "extra_districts": extra, "checked_at": now_iso()}

def check_schemes(path: str) -> dict:
    d = _load(path)
    schemes = d.get("schemes", [])
    invalid, urls = [], []
    for s in schemes:
        if not s.get("id") or not s.get("source_url", "").startswith("http"):
            invalid.append(s.get("id"))
        urls.append(s.get("source_url"))
    return {"dataset": "support_schemes", "records": len(schemes), "valid": len(schemes) - len(invalid),
            "invalid": len(invalid), "duplicates": len(urls) - len(set(urls)), "missing": 0,
            "invalid_ids": invalid, "checked_at": now_iso(),
            "stale_warning": "MUDRA/PMEGP/PMFME rules change; re-verify against official portals per effective dates"}

def check_cost_templates(path: str) -> dict:
    d = _load(path)
    bad = [t["id"] for t in d.get("templates", []) if not (t.get("capital_min_inr", 0) < t.get("capital_max_inr", 0))]
    non_est = [t["id"] for t in d.get("templates", []) if t.get("confidence") != "ESTIMATED"]
    return {"dataset": "msme_cost_templates", "records": len(d.get("templates", [])), "valid": len(d.get("templates", [])) - len(bad),
            "invalid": len(bad), "duplicates": 0, "missing": 0, "invalid_ids": bad,
            "non_estimated_ids": non_est, "checked_at": now_iso()}

def run_all(data_dir: str) -> dict:
    reports = [
        check_districts(os.path.join(data_dir, "tamilnadu", "districts.json")),
        check_odop(os.path.join(data_dir, "tamilnadu", "districts.json"), os.path.join(data_dir, "tamilnadu", "odop_products.json")),
        check_schemes(os.path.join(data_dir, "schemes", "support_schemes.json")),
        check_cost_templates(os.path.join(data_dir, "business-templates", "msme_cost_templates.json")),
    ]
    return {"reports": reports, "generated_at": now_iso(),
            "rule": "Flag questionable data; never silently repair."}
