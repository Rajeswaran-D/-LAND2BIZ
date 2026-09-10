import json
from .system_rules import SYSTEM_PROMPT_RULES

def build_opportunity_reasoning_prompt(candidate: dict, evidence_bundle: dict) -> str:
    return f"""{SYSTEM_PROMPT_RULES}

TASK: Generate location-backed reasoning, target customer profiles, demand drivers, and evidence citations for the candidate business.

CANDIDATE BUSINESS TEMPLATE & SCORES:
{json.dumps(candidate, indent=2)}

LOCATION EVIDENCE BUNDLE:
{json.dumps(evidence_bundle, indent=2)}

INSTRUCTIONS:
- Explain why this specific candidate fits THIS location ("why_this_location"). Cite specific evidence items (e.g. Census 2011 population, ODOP product, road score, nearby mapped shop counts).
- Outline target customer demographics within 5-10km catchment.
- Note any potential unmapped/unregistered local competition that might exist on the ground.
- Return structured JSON matching BusinessOpportunitySchema format.
"""
