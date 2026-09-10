import json
from .system_rules import SYSTEM_PROMPT_RULES

def build_what_if_explanation_prompt(base_opportunity: dict, scenario_changes: dict, updated_math: dict) -> str:
    slim_opp = {
        "id": base_opportunity.get("id", "business_1"),
        "title": base_opportunity.get("title", base_opportunity.get("business", "Rural Enterprise")),
        "capital_min_inr": base_opportunity.get("capital_min_inr", 1500000),
        "overall_score": base_opportunity.get("overall_score", 75.0)
    }
    return f"""{SYSTEM_PROMPT_RULES}

TASK: Explain the what-if scenario outcome for the business opportunity when assumptions change.

BASE BUSINESS OPPORTUNITY SUMMARY:
{json.dumps(slim_opp, indent=2)}

ASSUMPTION SCENARIO CHANGES:
{json.dumps(scenario_changes, indent=2)}

RECALCULATED FINANCIAL MATH:
{json.dumps(updated_math, indent=2)}

INSTRUCTIONS:
- Explain how the assumption change impacts monthly net surplus, break-even payback, and loan repayment burden.
- Determine if overall business viability has changed (e.g. from viable to high risk).
- Provide practical mitigation steps for the user.
- Return structured JSON matching WhatIfExplanationSchema format.
"""
