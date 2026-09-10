"""Source-conflict engine: never silently pick a winner."""
from __future__ import annotations
from ..core.provenance import now_iso

AUTHORITY_RANK = {"LEVEL 1": 1, "LEVEL 2": 2, "LEVEL 3": 3, "LEVEL 4": 4, "LEVEL 5": 5, "LEVEL 6": 6}

def conflict(source_a: str, value_a, source_b: str, value_b, geography: str, period: str,
             level_a: str = "LEVEL 4", level_b: str = "LEVEL 4") -> dict:
    ra, rb = AUTHORITY_RANK.get(level_a, 9), AUTHORITY_RANK.get(level_b, 9)
    auto = None
    if ra != rb and abs(ra - rb) >= 2 and level_a in ("LEVEL 1", "LEVEL 2") or level_b in ("LEVEL 1", "LEVEL 2"):
        auto = source_a if ra < rb else source_b
    return {"status": "SOURCE_CONFLICT" if auto is None else "RESOLVED_BY_HIERARCHY",
            "source_a": source_a, "value_a": value_a, "source_b": source_b, "value_b": value_b,
            "geography": geography, "comparison_period": period,
            "resolution_rule": "Official government source wins only with >=2-level gap; otherwise NEEDS_VERIFICATION",
            "resolved_to": auto, "verification_required": None if auto else "Human ground check decides",
            "detected_at": now_iso()}
