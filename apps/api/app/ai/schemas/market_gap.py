from pydantic import BaseModel, Field
from typing import List, Dict, Any

class UnservedNiche(BaseModel):
    niche: str = Field(..., description="Name of the underserved business niche")
    signal: str = Field(..., description="Observed evidence or demographic signal indicating demand")
    confidence: str = Field(default="NEEDS_VERIFICATION", description="VERIFIED, ESTIMATED, or NEEDS_VERIFICATION")
    suggested_capacity: str = Field(..., description="Recommended initial scale or capacity")

class MarketGapSynthesisSchema(BaseModel):
    location_summary: str = Field(default="Location context synthesized from district & catchment evidence.", description="Summary of geographic & demographic context")
    underserved_niches: List[Any] = Field(default_factory=list)
    unregistered_business_inferences: List[Dict[str, Any]] = Field(default_factory=list, description="Inferred local unmapped business presence based on catchment")
    demand_drivers: List[str] = Field(default_factory=list)
    infrastructure_gaps: List[str] = Field(default_factory=list)
    top_recommended_sectors: List[str] = Field(default_factory=list)
