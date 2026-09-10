from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from .api.routes import ground_truth, dpr, intelligence, schemes, decision, data_health, places

app = FastAPI(title="LAND2BIZ API", version="0.2.0")

from .core.exceptions import Land2BizException, land2biz_exception_handler
app.add_exception_handler(Land2BizException, land2biz_exception_handler)

app.include_router(ground_truth.router, prefix="/api/v1/ground-truth", tags=["M21"])
app.include_router(dpr.router, prefix="/api/v1/dpr", tags=["M14"])
app.include_router(intelligence.router, prefix="/api/v1/intelligence", tags=["M1-M4"])
app.include_router(schemes.router, prefix="/api/v1/schemes", tags=["M9"])
app.include_router(decision.router, prefix="/api/v1/decision", tags=["M5-M12"])
app.include_router(places.router, prefix="/api/v1/places", tags=["Places"])
app.include_router(data_health.router, prefix="/data", tags=["health"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "land2biz-api", "version": "0.2.0"}

class CapitalRequest(BaseModel):
    margin_capital: float

@app.post("/api/v1/finance/project-cost")
def get_project_cost(request: CapitalRequest):
    from .core.exceptions import Land2BizException
    from .engines.finance.project_cost import calculate_project_cost, calculate_loan_amount
    from .engines.loan.router import route_loan_scheme, out_of_range
    from .engines.loan.emi import calculate_emi, repayment_schedule

    if request.margin_capital is None or request.margin_capital < 0:
        raise Land2BizException("Capital must be a non-negative number", module="M7", layer="API", error_type="VALIDATION_ERROR")

    cost = calculate_project_cost(request.margin_capital)
    loan = calculate_loan_amount(cost)
    scheme = route_loan_scheme(cost)

    if scheme is None:
        return {
            "project_cost": cost,
            "loan_amount": loan,
            "scheme": None,
            "out_of_range": out_of_range(),
            "emi": 0.0,
            "confidence": "NEEDS_VERIFICATION",
        }

    mora = int(scheme.get("moratorium_months", 0))
    tenure = int(scheme.get("tenure_years", 0))
    rate = float(scheme.get("interest_rate", 0))
    emi = calculate_emi(loan, rate, tenure, mora)
    sched = repayment_schedule(loan, rate, tenure, mora)

    return {
        "project_cost": cost,
        "loan_amount": loan,
        "scheme": scheme,
        "emi": emi,
        "moratorium_months": mora,
        "moratorium_note": "Interest accrues during moratorium; EMI computed on accrued balance over remaining tenure.",
        "total_interest": sched["total_interest"],
        "total_payable": sched["total_payable"],
        "repayment_schedule": sched["schedule"],
        "confidence": "VERIFIED",
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
