from ...core.data_loader import core_loan_rules

_rules = core_loan_rules()
MARGIN_PCT = float(_rules.get("beneficiary_contribution_pct", 10)) / 100.0
LOAN_PCT = float(_rules.get("loan_pct", 90)) / 100.0

def _schemes():
    return core_loan_rules()["schemes"]

def load_schemes():
    return _schemes()

def route_loan_scheme(project_cost: float) -> dict | None:
    for scheme in _schemes():
        min_cost = scheme.get("min_project_cost", 0)
        max_cost = scheme.get("max_project_cost", float("inf"))
        if min_cost <= project_cost <= max_cost:
            return scheme
    return None

def out_of_range():
    return core_loan_rules().get("out_of_range", {"message": "Outside standard scheme range — needs manual review"})
