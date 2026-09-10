import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from app.main import app

client = TestClient(app)


def test_dpr_pdf_generation_endpoint():
    payload = {
        "opportunity_id": "OPP-TEST-2026",
        "opportunity_name": "Solar Powered Cold Storage Hub",
        "business_category": "cold_storage",
        "district": "Coimbatore",
        "land_type": "agricultural",
        "capital": 150000.0,
        "project_cost": 1500000.0,
        "loan_amount": 1350000.0,
        "interest_rate": 8.0,
        "tenure_years": 7,
        "moratorium_months": 6,
        "monthly_emi": 22867.78,
        "payback_years": 4.2,
        "repayment_burden_ratio": 0.35,
        "nic_code": "52101 (Refrigerated Warehousing)",
        "odop_product": "Textile Products & Food Processing",
    }
    response = client.post("/api/v1/dpr/generate", json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "attachment; filename=LAND2BIZ_DPR_OPP-TEST-2026.pdf" in response.headers["content-disposition"]

    pdf_bytes = response.content
    assert pdf_bytes.startswith(b"%PDF-"), "Response is not a valid PDF file"
    assert len(pdf_bytes) > 5000, f"PDF file size too small ({len(pdf_bytes)} bytes)"
