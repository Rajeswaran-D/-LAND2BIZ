from fastapi import FastAPI
from pydantic import BaseModel
from .api.routes import ground_truth, dpr

app = FastAPI(title="LAND2BIZ API", version="0.2.0")

from .core.exceptions import Land2BizException, land2biz_exception_handler
app.add_exception_handler(Land2BizException, land2biz_exception_handler)

app.include_router(ground_truth.router, prefix="/api/v1/ground-truth", tags=["M21"])
app.include_router(dpr.router, prefix="/api/v1/dpr", tags=["M14"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "land2biz-api", "version": "0.2.0"}

class CapitalRequest(BaseModel):
    margin_capital: float

@app.post("/api/v1/finance/project-cost")
def get_project_cost(request: CapitalRequest):
    from .engines.finance.project_cost import calculate_project_cost, calculate_loan_amount
    from .engines.loan.router import route_loan_scheme
    from .engines.loan.emi import calculate_emi
    
    cost = calculate_project_cost(request.margin_capital)
    loan = calculate_loan_amount(cost)
    scheme = route_loan_scheme(cost)
    
    emi = 0.0
    if scheme:
        emi = calculate_emi(loan, scheme.get("interest_rate", 0), scheme.get("tenure_years", 0))

    return {
        "project_cost": cost,
        "loan_amount": loan,
        "scheme": scheme,
        "emi": emi,
        "confidence": "VERIFIED"
    }

@app.post("/api/v1/what-if")
def what_if_scenario(request: CapitalRequest):
    # M13 Implementation
    from .engines.finance.project_cost import calculate_project_cost, calculate_loan_amount
    cost = calculate_project_cost(request.margin_capital)
    loan = calculate_loan_amount(cost)
    return {
        "scenario_cost": cost,
        "scenario_loan": loan,
        "confidence": "ESTIMATED"
    }
