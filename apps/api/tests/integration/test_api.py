import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from fastapi.testclient import TestClient
from app.main import app as fastapi_app
from app.db.session import get_db
import app.db.models.domain
from app.db.models.base import Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test DB (SQLite in-memory)
engine = create_engine("sqlite:///./test.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

fastapi_app.dependency_overrides[get_db] = override_get_db

client = TestClient(fastapi_app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "land2biz-api", "version": "0.2.0"}

def test_finance_pipeline():
    response = client.post("/api/v1/finance/project-cost", json={"margin_capital": 10000})
    assert response.status_code == 200
    data = response.json()
    assert data["project_cost"] == 100000.0
    assert data["loan_amount"] == 90000.0
    assert data["scheme"]["id"] == "micro_finance_01"

def test_m21_checklist():
    opp_id = "test_opp_123"
    response = client.get(f"/api/v1/ground-truth/{opp_id}")
    assert response.status_code == 200
    assert response.json()["status"] == "not_started"
    
    verify_resp = client.post(f"/api/v1/ground-truth/{opp_id}/verify", json={
        "items": {"visit_location": True}
    })
    assert verify_resp.status_code == 200
    assert verify_resp.json()["status"] == "in_progress"

def test_m14_dpr():
    response = client.post("/api/v1/dpr/generate", json={
        "opportunity_id": "test",
        "capital": 10000,
        "project_cost": 100000,
        "loan_amount": 90000
    })
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")
