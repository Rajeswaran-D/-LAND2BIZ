import json
from .system_rules import SYSTEM_PROMPT_RULES

def build_market_gap_prompt(context: dict) -> str:
    return f"""{SYSTEM_PROMPT_RULES}

TASK: Synthesize local market gaps and unserved business niches from the following location evidence.

LOCATION EVIDENCE CONTEXT:
{json.dumps(context, indent=2)}

INSTRUCTIONS:
- Analyze district baseline, census population, ODOP primary product, and mapped competitor counts.
- Identify specific unserved business niches (e.g. cold storage, farm produce aggregation, agri-inputs, EV/fuel charging).
- If mapped competitor count is zero, state that zero mapped POIs does NOT mean zero ground competition exists, and provide inferred unmapped presence.
- Return structured JSON matching MarketGapSynthesisSchema format.
"""
