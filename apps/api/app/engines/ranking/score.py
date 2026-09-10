"""Deterministic M5 ranking + M10/M11/M12: explainable score, confidence, completeness, evidence. No AI inside."""
from __future__ import annotations
from ...core.provenance import now_iso

WEIGHTS = {"site": 0.25, "market_gap": 0.25, "financial": 0.20, "competition_inv": 0.15, "govt": 0.15}
FORMULA = "0.25*site + 0.25*market_gap + 0.20*financial + 0.15*(100-competition_density) + 0.15*govt_support"

def _clamp(v: float) -> float:
    return max(0.0, min(100.0, float(v)))

def calculate_data_completeness(subs: dict) -> int:
    """
    Calculate Data Completeness Score (0-100) based on presence of verified input signals.
    Independent of opportunity_score and confidence_score.
    """
    total_required = 5
    present = 0
    for k in ("site", "market_gap", "financial", "competition_density", "govt"):
        sub = subs.get(k, {})
        val = sub.get("value")
        status = sub.get("status")
        if val is not None and status in ("VERIFIED", "VERIFIED_BASELINE", "ESTIMATED"):
            present += 1
    return round((present / total_required) * 100)

def rank(services: dict) -> dict:
    """services: {name: {score 0-100|None, status, source, confidence, note}}.
    Missing input -> DATA_INCOMPLETE: candidate cannot be scored; listed as INSUFFICIENT DATA."""
    ranked, incomplete = [], []
    for name, s in services.items():
        subs = s.get("subscores", {})
        missing = [k for k in ("site", "market_gap", "financial", "competition_density", "govt") if subs.get(k, {}).get("value") is None]
        completeness = calculate_data_completeness(subs)

        if missing:
            incomplete.append({
                "business": name,
                "status": "DATA_INCOMPLETE",
                "missing_inputs": missing,
                "data_completeness_score": completeness,
                "impact": "No overall score emitted for this candidate; confidence withheld",
                "verification_required": "Supply: " + ", ".join(missing),
            })
            continue

        site = _clamp(subs["site"]["value"])
        gap = _clamp(subs["market_gap"]["value"])
        fin = _clamp(subs["financial"]["value"])
        comp = _clamp(subs["competition_density"]["value"])
        govt = _clamp(subs["govt"]["value"])

        overall = round(
            WEIGHTS["site"] * site +
            WEIGHTS["market_gap"] * gap +
            WEIGHTS["financial"] * fin +
            WEIGHTS["competition_inv"] * (100 - comp) +
            WEIGHTS["govt"] * govt,
            1
        )
        confs = [subs[k].get("confidence", 50) for k in ("site", "market_gap", "financial", "competition_density", "govt")]
        confidence = round(sum(confs) / len(confs))

        ranked.append({
            "business": name,
            "overall_score": overall,
            "opportunity_score": overall,
            "confidence_score": confidence,
            "data_completeness_score": completeness,
            "subscores": {k: subs[k] for k in ("site", "market_gap", "financial", "competition_density", "govt")},
            "formula": FORMULA,
            "weights": WEIGHTS,
            "status": "SCORED",
            "computed_at": now_iso(),
        })

    ranked.sort(key=lambda r: r["overall_score"], reverse=True)
    return {
        "ranking": ranked,
        "incomplete": incomplete,
        "formula": FORMULA,
        "weights": WEIGHTS,
        "computed_at": now_iso()
    }

def final_status(best: dict | None, ground_checks_done: bool) -> str:
    if not best:
        return "INSUFFICIENT DATA"
    if best.get("confidence_score", best.get("confidence", 0)) < 40:
        return "INSUFFICIENT DATA"
    if not ground_checks_done:
        return "PROMISING — NEEDS VERIFICATION" if best["overall_score"] >= 60 else "HIGH RISK"
    if best["overall_score"] >= 75 and best.get("confidence_score", 0) >= 70:
        return "STRONG PRELIMINARY OPPORTUNITY"
    if best["overall_score"] >= 60:
        return "PROMISING — NEEDS VERIFICATION"
    return "NOT RECOMMENDED UNDER CURRENT INPUTS"
