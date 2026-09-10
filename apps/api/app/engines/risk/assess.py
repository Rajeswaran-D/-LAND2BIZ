"""M10 risk flags + M6 financial feasibility from cost-template ranges. Threshold-driven, no AI."""
from __future__ import annotations

def feasibility(project_cost: float, monthly_net_typical: float | None, loan_emi: float | None, revenue_origin: str = "SOURCE_BASED") -> dict:
    if monthly_net_typical is None:
        return {
            "value": None,
            "status": "NEEDS_VERIFICATION",
            "reason": "No supportable revenue baseline; revenue not invented",
            "method": "withhold score until local quotes confirm revenue",
            "provenance_origin": "NEEDS_VERIFICATION",
        }
    annual_net = monthly_net_typical * 12
    payback_yrs = (project_cost / annual_net) if annual_net > 0 else None
    if payback_yrs is None or payback_yrs <= 0:
        return {
            "value": None,
            "status": "NEEDS_VERIFICATION",
            "reason": "Payback not computable",
            "method": "project_cost / annual_net",
            "provenance_origin": "DERIVED",
        }
    score = max(0, min(100, round(100 - (payback_yrs / 7) * 100)))
    out = {
        "value": score,
        "status": "ESTIMATED",
        "method": "100 - (payback_years/7)*100 from template-typical net; template is ESTIMATED range",
        "payback_years_typical": round(payback_yrs, 1),
        "confidence": 45,
        "provenance_origin": revenue_origin,
        "line_item_origins": {
            "project_cost": "DERIVED",
            "monthly_net_typical": revenue_origin,
            "annual_net": "DERIVED",
            "payback_years": "DERIVED",
            "loan_emi": "SOURCE_BASED" if loan_emi else "NOT_APPLICABLE",
        }
    }
    if loan_emi:
        burden = (loan_emi / monthly_net_typical) if monthly_net_typical > 0 else None
        out["repayment_burden_ratio"] = round(burden, 2) if burden is not None else None
        if burden is not None and burden > 1.0:
            out["risk_flag"] = {
                "rule": "REPAY_BURDEN>100%",
                "flag": "Typical net does not cover EMI — HIGH repayment pressure",
                "status": "NEEDS_VERIFICATION",
                "provenance_origin": "DERIVED",
            }
    return out

def risk_flags(competition_mapped: int | None, burden_ratio: float | None, regulatory_open: int) -> list:
    flags = []
    if competition_mapped is None:
        flags.append({"rule": "COMP_UNKNOWN", "flag": "Competition unknown (OSM query failed) — treat density as unknown", "status": "DATA_UNAVAILABLE"})
    elif competition_mapped >= 8:
        flags.append({"rule": "COMP>=8", "flag": "High mapped competition density", "status": "ESTIMATED"})
    if burden_ratio is not None and burden_ratio > 0.4:
        flags.append({"rule": "BURDEN>40%", "flag": f"EMI is {round(burden_ratio*100)}% of typical net — repayment pressure", "status": "ESTIMATED"})
    if regulatory_open > 0:
        flags.append({"rule": "REG_OPEN", "flag": f"{regulatory_open} regulatory item(s) need verification (R1-R6)", "status": "NEEDS_VERIFICATION"})
    return flags
