def calculate_emi(principal: float, annual_rate: float, tenure_years: int) -> float:
    if principal <= 0 or annual_rate <= 0 or tenure_years <= 0:
        return 0.0
    monthly_rate = annual_rate / 12
    months = tenure_years * 12
    emi = principal * monthly_rate * ((1 + monthly_rate) ** months) / (((1 + monthly_rate) ** months) - 1)
    return round(emi, 2)
