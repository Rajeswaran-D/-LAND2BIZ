from ..loan.router import MARGIN_PCT, LOAN_PCT


def calculate_project_cost(margin_capital: float) -> float:
    """
    Project Cost = Margin Capital / margin share (SIH baseline: 10% from data).
    """
    if margin_capital < 0:
        raise ValueError("Margin capital cannot be negative")
    if margin_capital == 0:
        return 0.0
    return margin_capital / MARGIN_PCT


def calculate_loan_amount(project_cost: float) -> float:
    """
    Loan Amount = loan share * Project Cost (SIH baseline: 90% from data),
    capped at the routed scheme max_loan.
    """
    if project_cost < 0:
        raise ValueError("Project cost cannot be negative")
    if project_cost == 0:
        return 0.0
    from ..loan.router import route_loan_scheme
    raw = project_cost * LOAN_PCT
    scheme = route_loan_scheme(project_cost)
    if scheme and scheme.get("max_loan") is not None:
        return min(raw, float(scheme["max_loan"]))
    return raw
