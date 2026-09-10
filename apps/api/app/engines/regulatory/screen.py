"""M2 rule-based regulatory screen (R1-R6). PASS/FAIL/NEEDS_VERIFICATION only. No approvals invented."""
from __future__ import annotations
from ...core.data_loader import regulatory_rules

def screen(land_type: str, business_category: str, answers: dict, osm_water_mapped: int | None = None) -> dict:
    rules = regulatory_rules()["rules"]
    results = []
    for r in rules:
        rid = r["id"]
        if rid == "R1_agri_to_commercial":
            hit = (land_type or "").lower() == "agricultural" and business_category in ("manufacturing", "cold_storage", "ev_charging", "processing", "food_processing", "dairy")
            ans = (answers.get("na_conversion") or "unsure").lower()
            status = "PASS" if ans == "yes" else ("FAIL" if ans == "no" else "NEEDS_VERIFICATION")
            results.append({"rule": rid, "triggered": hit, "status": status if hit else "PASS", "flag": r["flag"], "ask": r["ask_user"]})
        elif rid == "R2_water_body":
            ans = (answers.get("eco_zone") or "unsure").lower()
            triggered = (osm_water_mapped or 0) > 0 or ans == "no"
            status = "PASS" if ans == "yes" and not (osm_water_mapped or 0) else ("FAIL" if ans == "no" else "NEEDS_VERIFICATION")
            results.append({"rule": rid, "triggered": triggered, "status": status if triggered else ("PASS" if ans == "yes" else "NEEDS_VERIFICATION"), "flag": r["flag"], "ask": r["ask_user"]})
        elif rid == "R3_road_frontage":
            ans = (answers.get("road_frontage") or "unsure").lower()
            status = "PASS" if ans == "yes" else ("FAIL" if ans == "no" else "NEEDS_VERIFICATION")
            results.append({"rule": rid, "triggered": ans != "yes", "status": status, "flag": r["flag"], "ask": r["ask_user"]})
        elif rid == "R4_power_water":
            ans = (answers.get("utility_access") or "unsure").lower()
            status = "PASS" if ans == "yes" else ("FAIL" if ans == "no" else "NEEDS_VERIFICATION")
            results.append({"rule": rid, "triggered": ans != "yes", "status": status, "flag": r["flag"], "ask": r["ask_user"]})
        elif rid == "R5_local_noc":
            ans = (answers.get("local_noc") or "unsure").lower()
            status = "PASS" if ans == "yes" else ("FAIL" if ans == "no" else "NEEDS_VERIFICATION")
            results.append({"rule": rid, "triggered": True, "status": status, "flag": r["flag"], "ask": r["ask_user"]})
        elif rid == "R6_food_safety":
            needs = business_category in ("food_processing", "dairy", "flour_spice_mill", "cold_storage_processing")
            results.append({"rule": rid, "triggered": needs, "status": "NEEDS_VERIFICATION" if needs else "PASS", "flag": r["flag"], "ask": r["ask_user"]})
    open_items = sum(1 for x in results if x["status"] != "PASS")
    overall = "PASS" if open_items == 0 else ("FAIL" if any(x["status"] == "FAIL" for x in results) else "NEEDS_VERIFICATION")
    return {
        "results": results, "open_items": open_items, "overall": overall,
        "disclaimer": regulatory_rules()["disclaimer"],
        "note": "Preliminary screen only. Never 'Government approval guaranteed'.",
    }
