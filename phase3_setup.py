import os
import json

base_dir = r'C:\Users\gmh08\OneDrive\Pictures\Desktop\SIH26\LAND2BIZ'
api_app_dir = os.path.join(base_dir, 'apps', 'api', 'app')

# 1. Update Domain Models
domain_py = os.path.join(api_app_dir, 'db', 'models', 'domain.py')
with open(domain_py, 'w') as f:
    f.write('''from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Boolean
from sqlalchemy.orm import relationship
from .base import Base
import datetime

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    scenarios = relationship("FinancialScenario", back_populates="user")
    checklists = relationship("VerificationChecklist", back_populates="user")

class FinancialScenario(Base):
    __tablename__ = 'financial_scenarios'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    capital = Column(Float)
    project_cost = Column(Float)
    loan_amount = Column(Float)
    scheme_id = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship("User", back_populates="scenarios")

class VerificationChecklist(Base):
    __tablename__ = 'verification_checklists'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    opportunity_id = Column(String)
    status = Column(String, default="not_started") # not_started, in_progress, verified
    items = Column(JSON) # e.g. {"visit_location": True, "verify_documents": False}
    user = relationship("User", back_populates="checklists")
''')

# 2. Add M21 - Ground Truth Verification Route
routes_dir = os.path.join(api_app_dir, 'api', 'routes')
os.makedirs(routes_dir, exist_ok=True)
m21_route = os.path.join(routes_dir, 'ground_truth.py')
with open(m21_route, 'w') as f:
    f.write('''from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict

router = APIRouter()

class ChecklistUpdate(BaseModel):
    items: Dict[str, bool]

# In-memory store for demo (since DB requires full setup)
DEMO_CHECKLISTS = {}

@router.get("/{opportunity_id}")
def get_checklist(opportunity_id: str):
    if opportunity_id not in DEMO_CHECKLISTS:
        DEMO_CHECKLISTS[opportunity_id] = {
            "status": "not_started",
            "items": {
                "visit_location": False,
                "talk_to_residents": False,
                "visit_competitors": False,
                "verify_land_docs": False,
                "search_google": False,
                "check_scheme_portal": False
            }
        }
    return DEMO_CHECKLISTS[opportunity_id]

@router.post("/{opportunity_id}/verify")
def verify_checklist(opportunity_id: str, update: ChecklistUpdate):
    if opportunity_id not in DEMO_CHECKLISTS:
        raise HTTPException(status_code=404, detail="Checklist not found")
    
    DEMO_CHECKLISTS[opportunity_id]["items"].update(update.items)
    
    all_verified = all(DEMO_CHECKLISTS[opportunity_id]["items"].values())
    DEMO_CHECKLISTS[opportunity_id]["status"] = "verified" if all_verified else "in_progress"
    
    return DEMO_CHECKLISTS[opportunity_id]
''')

# 3. Add M14 - DPR Generator Route
m14_route = os.path.join(routes_dir, 'dpr.py')
with open(m14_route, 'w') as f:
    f.write('''from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class DPRRequest(BaseModel):
    opportunity_id: str
    capital: float
    project_cost: float
    loan_amount: float

@router.post("/generate")
def generate_dpr(req: DPRRequest):
    # Mocking PDF generation for now, returning structure
    return {
        "status": "success",
        "message": "DPR PDF generated (simulated)",
        "download_url": "/api/v1/dpr/download/simulated.pdf",
        "data_used": req.dict(),
        "confidence": "VERIFIED"
    }
''')

# 4. Integrate into main.py
main_py = os.path.join(api_app_dir, 'main.py')
with open(main_py, 'w') as f:
    f.write('''from fastapi import FastAPI
from pydantic import BaseModel
from .api.routes import ground_truth, dpr

app = FastAPI(title="LAND2BIZ API", version="0.2.0")

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
''')

print("Phase 3 Setup Script Finished")
