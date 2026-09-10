from fastapi import APIRouter
import os, time
from ...core.data_loader import DATA_DIR, source_registry
from ...services.data_quality import run_all

router = APIRouter()

@router.get("/health")
def data_health():
    reg = source_registry()
    live = []
    counts = _counts()
    for s in reg["sources"]:
        ds = s.get("dataset", "")
        rel = (ds.split(" ")[0] if ds else "")
        full = os.path.join(DATA_DIR, rel) if rel else ""
        entry = {"source_id": s["source_id"], "status": s["status"],
                 "data_period": s.get("data_period"), "last_checked": s.get("last_checked"),
                 "authority_level": s.get("authority_level")}
        if rel and full and os.path.exists(full):
            st = os.stat(full)
            entry["records"] = counts.get(s["source_id"])
            entry["file_mtime"] = time.strftime("%Y-%m-%d", time.gmtime(st.st_mtime))
            entry["availability"] = "AVAILABLE"
        elif rel:
            entry["availability"] = "FILE_MISSING"
        else:
            entry["availability"] = "REFERENCE_ONLY"
        live.append(entry)
    return {
        "sources": live,
        "quality": run_all(DATA_DIR),
        "limitations": ["Census 2011 = historical baseline", "OSM = mapped market only",
                        "HCES/MSME-profiles/RBI = not yet normalized", "AI never overrides Levels 1-5"],
        "authority_hierarchy": reg["authority_hierarchy"],
    }

def _counts() -> dict:
    from ...core import data_loader as dl
    out = {}
    try:
        out["census_2011_tn"] = len(dl.tamilnadu_districts()["districts"])
    except Exception:
        out["census_2011_tn"] = None
    try:
        out["odop_v32"] = len(dl.tamilnadu_odop()["districts"])
    except Exception:
        out["odop_v32"] = None
    try:
        out["sih_brief_2026"] = len(dl.core_loan_rules()["schemes"])
    except Exception:
        out["sih_brief_2026"] = None
    for sid, fn in (("pmfme_mofpi", dl.support_schemes), ("pmegp_kvic", dl.support_schemes),
                    ("mudra_pmmy", dl.support_schemes), ("standup_india", dl.support_schemes),
                    ("aif_da", dl.support_schemes), ("acabc_manage_nabard", dl.support_schemes)):
        try:
            out[sid] = len(fn()["schemes"])
        except Exception:
            out[sid] = None
    for sid, fn, key in (("nic_2008", dl.nic_codes, "mappings"), ("nabard_project_docs", dl.cost_templates, "templates")):
        try:
            out[sid] = len(fn()[key])
        except Exception:
            out[sid] = None
    return out
