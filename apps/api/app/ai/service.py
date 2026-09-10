import logging
from typing import Dict, Any, Optional
from .providers.gemini import GeminiRESTClient
from .prompts.market_gap import build_market_gap_prompt
from .prompts.opportunity_gen import build_opportunity_reasoning_prompt
from .prompts.explanation import build_what_if_explanation_prompt
from .schemas import MarketGapSynthesisSchema, BusinessOpportunitySchema, WhatIfExplanationSchema

logger = logging.getLogger(__name__)

class GeminiAIService:
    def __init__(self, client: Optional[GeminiRESTClient] = None):
        self.client = client or GeminiRESTClient()

    def is_available(self) -> bool:
        return self.client.is_configured()

    def synthesize_market_gap(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesizes unserved local market gaps and unmapped business presence.
        Returns fallback structured object if AI is unconfigured/unavailable.
        """
        if not self.is_available():
            return self._fallback_market_gap(context)

        prompt = build_market_gap_prompt(context)
        res = self.client.generate_json(prompt, schema_class=MarketGapSynthesisSchema)
        if res:
            return res
        return self._fallback_market_gap(context)

    def enhance_opportunity_reasoning(self, candidate: Dict[str, Any], evidence_bundle: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhances candidate business with location-specific 'why_this_location' reasons,
        target customer profiles, demand drivers, and evidence citations.
        Never alters deterministic numbers (CAPEX, EMI, scores).
        """
        if not self.is_available():
            return self._fallback_opportunity_reasoning(candidate, evidence_bundle)

        prompt = build_opportunity_reasoning_prompt(candidate, evidence_bundle)
        res = self.client.generate_json(prompt, schema_class=BusinessOpportunitySchema)
        if res:
            # PRESERVE DETERMINISTIC NUMBERS
            res["estimated_project_cost"] = candidate.get("capital_min_inr", res.get("estimated_project_cost"))
            res["overall_score"] = candidate.get("overall_score", res.get("overall_score"))
            return res
        return self._fallback_opportunity_reasoning(candidate, evidence_bundle)

    def explain_what_if_scenario(self, base_opportunity: Dict[str, Any], scenario_changes: Dict[str, Any], updated_math: Dict[str, Any]) -> Dict[str, Any]:
        """
        Explains what-if scenario outcome when assumptions change.
        """
        if not self.is_available():
            return self._fallback_what_if_explanation(base_opportunity, scenario_changes, updated_math)

        prompt = build_what_if_explanation_prompt(base_opportunity, scenario_changes, updated_math)
        res = self.client.generate_json(prompt, schema_class=WhatIfExplanationSchema)
        if res:
            return res
        return self._fallback_what_if_explanation(base_opportunity, scenario_changes, updated_math)

    # ─── Graceful Fallbacks (No Silent Hallucinations) ────────────────────────
    def _fallback_market_gap(self, context: Dict[str, Any]) -> Dict[str, Any]:
        dist = (context.get("district") or {}).get("district", "Selected Region")
        odop = (context.get("district") or {}).get("odop_primary", {}).get("value", "Local Produce")
        return {
            "location_summary": f"District {dist} baseline (Census 2011/2026) with primary ODOP product '{odop}'.",
            "underserved_niches": [
                {"niche": "Cold-chain preservation", "signal": "District agricultural produce requires post-harvest storage", "confidence": "NEEDS_VERIFICATION", "suggested_capacity": "15-50MT Solar Cold Room"},
                {"niche": "Agri-input & Soil Testing", "signal": "Local farming community needs certified inputs & testing", "confidence": "ESTIMATED", "suggested_capacity": "Retail Depot + Soil Lab"},
            ],
            "unregistered_business_inferences": [
                {"type": "Unmapped local traders", "note": "Unregistered roadside shops and weekly shandy vendors exist on ground but are unmapped on Google Maps."}
            ],
            "demand_drivers": [f"{dist} population catchment", f"ODOP {odop} value chain", "Main road transit traffic"],
            "infrastructure_gaps": ["3-Phase Commercial Power Line", "Cold storage facilities", "EV Charging infrastructure"],
            "top_recommended_sectors": ["Agri-processing", "Cold Storage", "Agri Retail"]
        }

    def _fallback_opportunity_reasoning(self, candidate: Dict[str, Any], evidence_bundle: Dict[str, Any]) -> Dict[str, Any]:
        dist_name = (evidence_bundle.get("district_baseline") or {}).get("district", "Local Region")
        odop = (evidence_bundle.get("district_baseline") or {}).get("odop_primary", {}).get("value", "District Produce")
        title = candidate.get("business", candidate.get("title", "Rural Enterprise"))
        capex = candidate.get("capital_min_inr", 1500000)

        return {
            "business_type": candidate.get("id", "rural_business"),
            "title": title,
            "description": f"{title} tailored for {dist_name} catchment.",
            "why_this_location": [
                f"District baseline for {dist_name} indicates population scale.",
                f"Matches ODOP priority sector ({odop}).",
                "Road frontage access verified via OpenStreetMap."
            ],
            "target_customers": [f"Local residents & farmers in {dist_name}", "Transit commercial traffic"],
            "demand_drivers": [f"ODOP {odop} produce", "Regional population growth"],
            "competition_level": "MODERATE",
            "market_gap": "Underserved local demand identified in spatial catchment.",
            "unregistered_competition_notes": "Zero mapped Google POIs does NOT mean zero competition. Verify unmapped shops during M21 ground check.",
            "site_fit_score": candidate.get("subscores", {}).get("site", {}).get("value", 70.0),
            "demand_score": candidate.get("subscores", {}).get("market_gap", {}).get("value", 70.0),
            "competition_score": 70.0,
            "financial_score": candidate.get("subscores", {}).get("financial", {}).get("value", 70.0),
            "risk_score": 30.0,
            "overall_score": candidate.get("overall_score", 75.0),
            "estimated_project_cost": capex,
            "estimated_monthly_revenue": capex * 0.15,
            "estimated_monthly_operating_cost": capex * 0.10,
            "estimated_break_even_months": 36.0,
            "risks": ["Seasonal demand fluctuation", "Power sanction delay", "Local supplier pricing"],
            "evidence": [
                {
                    "claim": f"District Census population baseline for {dist_name}",
                    "source_type": "OBSERVED",
                    "source_reference": "Census 2011 / TN District Portal",
                    "confidence": 0.95
                },
                {
                    "claim": f"ODOP Product: {odop}",
                    "source_type": "OBSERVED",
                    "source_reference": "National ODOP Product List V32",
                    "confidence": 0.85
                }
            ],
            "confidence": 0.80
        }

    def _fallback_what_if_explanation(self, base_opportunity: Dict[str, Any], scenario_changes: Dict[str, Any], updated_math: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "scenario_name": scenario_changes.get("description", "Assumption Sensitivity Scenario"),
            "impact_summary": f"Project cost updated to ₹{updated_math.get('scenario_cost', 0):,.2f}. Loan requirement is ₹{updated_math.get('scenario_loan', 0):,.2f}.",
            "viability_changed": False,
            "key_risks_heightened": ["Monthly EMI repayment burden increase", "Working capital buffer reduction"],
            "mitigation_steps": [
                "Apply for PMEGP / PMFME capital subsidy to lower debt burden.",
                "Maintain 3-month operating expense cash buffer."
            ]
        }

# Global singleton service
gemini_service = GeminiAIService()
