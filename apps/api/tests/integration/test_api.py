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
    import uuid
    opp_id = f"test_opp_{uuid.uuid4().hex[:8]}"
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

def test_tn_district_profile():
    response = client.get("/api/v1/intelligence/district", params={"name": "Coimbatore"})
    assert response.status_code == 200
    data = response.json()
    assert data["matched"] is True
    assert data["district"] == "Coimbatore"
    assert data["population_2011"]["value"] == 3458045
    assert data["population_2011"]["status"] == "VERIFIED"
    assert data["population_2011"]["data_period"] == "2011"
    assert data["population_estimate_2026"]["status"] == "ESTIMATED"
    assert data["odop_primary"]["value"] == "Motor Pumps"

def test_schemes_list():
    response = client.get("/api/v1/schemes/list")
    assert response.status_code == 200
    ids = [s["id"] for s in response.json()["schemes"]]
    assert "pmfme_individual" in ids
    assert "pmegp_micro" in ids
    assert "mudra_pmmy" in ids

def test_scheme_match_pmfme():
    response = client.post("/api/v1/schemes/match", json={
        "business_category": "food_processing",
        "project_cost": 1000000,
        "is_rural": True,
        "is_special_category": True,
    })
    assert response.status_code == 200
    matches = {m["scheme_id"]: m for m in response.json()["matches"]}
    assert matches["pmfme_individual"]["estimated_subsidy_inr"] == 350000
    assert matches["pmegp_micro"]["subsidy_pct"] == 35

def test_cost_templates_are_ranges():
    response = client.get("/api/v1/schemes/cost-templates")
    assert response.status_code == 200
    for t in response.json()["templates"]:
        assert t["capital_min_inr"] < t["capital_max_inr"]
        assert t["confidence"] == "ESTIMATED"

def test_decision_analyze_withholds_score_without_gps():
    r = client.post("/api/v1/decision/analyze", json={"district": "Coimbatore", "margin_capital": 150000, "land_type": "agricultural"})
    assert r.status_code == 200
    body = r.json()
    assert body["recommendation"]["status"] in ("INSUFFICIENT DATA", "PROMISING — NEEDS VERIFICATION", "HIGH RISK", "NOT RECOMMENDED UNDER CURRENT INPUTS")
    assert body["ai_contract"].startswith("AI may explain")
    assert body["evidence"]["finance"]["project_cost"] == 1500000.0

def test_data_health_reports_sources():
    r = client.get("/data/health")
    assert r.status_code == 200
    ids = [s["source_id"] for s in r.json()["sources"]]
    assert "census_2011_tn" in ids and "osm_overpass" in ids
