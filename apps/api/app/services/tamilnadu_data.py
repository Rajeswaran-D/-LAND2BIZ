import json
import os
from ..core.provenance import now_iso, provenance

TN_DIR = os.path.join(os.environ.get("LAND2BIZ_ROOT", ""), "data", "tamilnadu")
NORM_DIR = os.path.join(os.environ.get("LAND2BIZ_ROOT", ""), "data", "normalized")

def _repo_data_dir(subdir: str) -> str:
    cand_env = os.path.join(os.environ.get("LAND2BIZ_ROOT", ""), "data", subdir)
    if os.path.isdir(cand_env):
        return cand_env
    cur = os.path.abspath(os.path.dirname(__file__))
    while True:
        cand = os.path.join(cur, "data", subdir)
        if os.path.isdir(cand):
            return cand
        parent = os.path.dirname(cur)
        if parent == cur:
            raise FileNotFoundError(f"data/{subdir} not found")
        cur = parent

def _load_tn(name: str):
    with open(os.path.join(_repo_data_dir("tamilnadu"), name), encoding="utf-8") as f:
        return json.load(f)

def _load_norm(name: str):
    with open(os.path.join(_repo_data_dir("normalized"), name), encoding="utf-8") as f:
        return json.load(f)

_DISTRICTS = None
_ODOP = None
_HCES = None

def districts():
    global _DISTRICTS
    if _DISTRICTS is None:
        _DISTRICTS = _load_tn("districts.json")
    return _DISTRICTS

def odop():
    global _ODOP
    if _ODOP is None:
        _ODOP = _load_tn("odop_products.json")
    return _ODOP

def hces():
    global _HCES
    if _HCES is None:
        try:
            _HCES = _load_norm("hces_consumption_baseline.json")
        except Exception:
            _HCES = {}
    return _HCES

def _norm(s: str) -> str:
    return (s or "").strip().lower().replace("district", "").strip()

def find_district(name: str) -> dict | None:
    if not name:
        return None
    want = _norm(name)
    for d in districts()["districts"]:
        n = _norm(d["name"])
        if want == n or want in n or n in want:
            return d
    return None

def growth_adjusted_population(pop_2011: int, years_since_2011: float = 15.0) -> int:
    rate = districts()["state_decadal_growth_pct_2001_2011"] / 100.0
    return int(pop_2011 * (1 + rate) ** (years_since_2011 / 10.0))

def regional_demand_signal(district_name: str, is_rural: bool = True) -> dict:
    h = hces()
    if not h:
        return {"status": "DATA_UNAVAILABLE", "reason": "HCES baseline dataset missing"}
    mpce_data = h.get("tamil_nadu_mpce_2022_23", {})
    mpce_val = mpce_data.get("rural_mpce_inr" if is_rural else "urban_mpce_inr", 5310 if is_rural else 8310)
    hh_spend = h.get("monthly_expenditure_per_household_5person_est_inr", {})
    
    return {
        "status": "VERIFIED_STATISTICAL_BASELINE",
        "survey_period": h.get("data_period", "2022-23"),
        "source": h.get("organization", "NSSO / MoSPI"),
        "mpce_inr": mpce_val,
        "sector_shares_pct": h.get("expenditure_distribution_shares_pct", {}),
        "household_monthly_spend_est_inr": hh_spend,
        "geographic_scope": f"Tamil Nadu State {'Rural' if is_rural else 'Urban'} Baseline",
        "note": "Regional Demand Signal only — MUST NOT be presented as exact village spending.",
        "confidence": 65,
    }

def district_profile(name: str, is_rural: bool = True) -> dict:
    d = find_district(name)
    if not d:
        return {
            "matched": False,
            "status": "DATA_UNAVAILABLE",
            "source": "data/tamilnadu/districts.json",
            "attempted_query": f"district match '{name}' in 38 TN districts",
            "reason": "No district matched",
            "impact_on_analysis": "Population baseline + ODOP unavailable; site/market scoring incomplete",
            "verification_required": "Confirm district spelling or share GPS for reverse-geocode",
            "retrieved_at": now_iso(),
            "confidence": 0,
        }
    odop_map = odop()["districts"]
    odop_entry = odop_map.get(d["name"], {})
    pop_now = growth_adjusted_population(d["population_2011"])
    density_now = round(pop_now / d["area_km2"]) if d["area_km2"] else None
    demand_sig = regional_demand_signal(d["name"], is_rural=is_rural)

    return {
        "matched": True,
        "district": d["name"],
        "headquarters": d["headquarters"],
        "area_km2": d["area_km2"],
        "population_2011": provenance(
            d["population_2011"], "Office of the Registrar General & Census Commissioner / TN district portal",
            "https://censusindia.gov.in/", "2011", d["name"], "VERIFIED_BASELINE",
            "District Census Handbook value via data/tamilnadu/districts.json", 95),
        "density_2011": provenance(
            d["density_2011"], "Office of the Registrar General & Census Commissioner / TN district portal",
            "https://censusindia.gov.in/", "2011", d["name"], "VERIFIED_BASELINE", "persons per km2, 2011", 95),
        "population_estimate_2026": provenance(
            pop_now, "Derived estimate (NOT Census)",
            "https://censusindia.gov.in/nada/index.php/catalog/43366/study-description", "2026-est",
            d["name"], "ESTIMATED",
            "census_2011 * (1 + 0.156)^(15/10); TN decadal 15.6% 2001-2011", 55),
        "density_estimate_2026": provenance(
            density_now, "Derived estimate (NOT Census)", "", "2026-est",
            d["name"], "ESTIMATED", "estimate_2026 / area_km2", 50),
        "odop_primary": provenance(
            odop_entry.get("primary"), "National ODOP Product List V32",
            "https://www.indianembassyalgiers.gov.in/content/odop_product_list-Aug-2025.pdf", "2025-08-19",
            d["name"], "VERIFIED" if odop_entry.get("primary") else "DATA_UNAVAILABLE",
            "Direct row lookup", 85),
        "odop_sector": odop_entry.get("sector"),
        "odop_secondary": odop_entry.get("secondary"),
        "regional_demand_signal": demand_sig,
        "status": "VERIFIED_BASELINE",
        "sources": districts()["sources"] + [odop()["source_url"], "https://mospi.gov.in/ (HCES 2022-23)"],
        "label": "Baseline population (2011 Census VERIFIED; 2026 figure ESTIMATED). NOT live footfall — verify on ground.",
    }
