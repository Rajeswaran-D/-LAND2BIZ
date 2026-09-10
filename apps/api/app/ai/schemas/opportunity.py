from pydantic import BaseModel, Field
from typing import List, Optional

class EvidenceItem(BaseModel):
    claim: str = Field(..., description="Fact or observation supporting recommendation")
    source_type: str = Field(..., description="OBSERVED, CALCULATED, INFERRED, USER_PROVIDED, or AI_GENERATED_HYPOTHESIS")
    source_reference: str = Field(..., description="Source dataset name, URL, or calculation formula")
    confidence: float = Field(default=0.7, description="Confidence rating between 0.0 and 1.0")

class BusinessOpportunitySchema(BaseModel):
    business_type: str = Field(..., description="Standardized category key (e.g. cold_storage, agri_retail, food_processing)")
    title: str = Field(..., description="Human-readable business title")
    description: str = Field(..., description="Detailed description of business model and local setup")
    why_this_location: List[str] = Field(default_factory=list, description="Specific location-backed evidence reasons")
    target_customers: List[str] = Field(default_factory=list, description="Primary customer demographics within 5-10km catchment")
    demand_drivers: List[str] = Field(default_factory=list, description="Local demand drivers (agricultural produce, schools, road traffic, etc.)")
    competition_level: str = Field(default="MODERATE", description="LOW, MODERATE, HIGH, or UNDERSERVED")
    market_gap: str = Field(..., description="Specific supply-demand mismatch identified in catchment")
    unregistered_competition_notes: str = Field(..., description="Assessment of potential unmapped/unregistered local competition")
    site_fit_score: float = Field(default=70.0, description="Site fit score (0-100)")
    demand_score: float = Field(default=70.0, description="Demand score (0-100)")
    competition_score: float = Field(default=70.0, description="Competition score (0-100, higher means less saturated)")
    financial_score: float = Field(default=70.0, description="Financial feasibility score (0-100)")
    risk_score: float = Field(default=30.0, description="Risk score (0-100, lower is better)")
    overall_score: float = Field(default=75.0, description="Synthesized evidence-backed overall score (0-100)")
    estimated_project_cost: float = Field(..., description="Calculated typical CAPEX in INR")
    estimated_monthly_revenue: float = Field(..., description="Estimated monthly revenue in INR")
    estimated_monthly_operating_cost: float = Field(..., description="Estimated monthly OPEX in INR")
    estimated_break_even_months: float = Field(..., description="Estimated break-even payback in months")
    risks: List[str] = Field(default_factory=list, description="Specific risk factors (regulatory, seasonal, capital)")
    evidence: List[EvidenceItem] = Field(default_factory=list, description="Traceable evidence items supporting recommendation")
    confidence: float = Field(default=0.75, description="Overall confidence level (0.0 to 1.0)")
