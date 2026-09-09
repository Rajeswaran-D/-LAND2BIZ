def calculate_project_cost(margin_capital: float) -> float:
    """
    Project Cost = Margin Capital / 10%
    """
    if margin_capital < 0:
        raise ValueError("Margin capital cannot be negative")
    return margin_capital / 0.10

def calculate_loan_amount(project_cost: float) -> float:
    """
    Loan Amount = 90% * Project Cost
    """
    if project_cost < 0:
        raise ValueError("Project cost cannot be negative")
    return project_cost * 0.90
