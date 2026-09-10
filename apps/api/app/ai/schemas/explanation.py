from pydantic import BaseModel, Field
from typing import List, Dict, Any

class RiskAssessmentSchema(BaseModel):
    data_supported_risks: List[Dict[str, Any]] = Field(default_factory=list, description="Risks verified by hard data (regulatory buffers, road access, distance)")
    ai_inferred_risks: List[Dict[str, Any]] = Field(default_factory=list, description="Risks inferred by reasoning (seasonality, market transition, tech adoption)")
    overall_risk_rating: str = Field(default="MODERATE", description="LOW, MODERATE, HIGH, or CRITICAL")
    mitigation_checklist: List[str] = Field(default_factory=list)

class FinancialExplanationSchema(BaseModel):
    summary: str = Field(..., description="Plain-language explanation of financial numbers")
    capital_efficiency_notes: str = Field(..., description="Explanation of CAPEX/OPEX efficiency")
    loan_coverage_explanation: str = Field(..., description="Explanation of bank loan vs margin capital")
    sensitivity_warnings: List[str] = Field(default_factory=list)

class SchemeExplanationSchema(BaseModel):
    scheme_name: str = Field(..., description="Name of matched scheme")
    why_matched: str = Field(..., description="Explanation of why project meets eligibility")
    subsidy_explanation: str = Field(..., description="Plain language breakdown of subsidy / margin money")
    application_steps: List[str] = Field(default_factory=list)

class WhatIfExplanationSchema(BaseModel):
    scenario_name: str = Field(default="Sensitivity Scenario Analysis", description="Description of input change (e.g. 20% demand reduction)")
    impact_summary: str = Field(default="Impact on project margins, EMI coverage, and overall financial viability.", description="Impact on profit, EMI coverage, and break-even")
    viability_changed: bool = Field(default=False, description="True if business shifts from viable to high risk")
    key_risks_heightened: List[str] = Field(default_factory=list)
    mitigation_steps: List[str] = Field(default_factory=list)
