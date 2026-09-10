"""Provenance envelope + DATA_UNAVAILABLE helper. No invented values."""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Optional

STATUSES = ("VERIFIED", "ESTIMATED", "NEEDS_VERIFICATION", "DATA_UNAVAILABLE", "VERIFIED_BASELINE")

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def provenance(
    value: Any,
    source: str,
    source_url: str = "",
    data_period: str = "",
    geographic_scope: str = "",
    status: str = "VERIFIED",
    method: str = "",
    confidence: int = 100,
) -> dict:
    assert status in STATUSES, f"bad status {status}"
    return {
        "value": value,
        "source": source,
        "source_url": source_url,
        "retrieved_at": now_iso(),
        "data_period": data_period,
        "geographic_scope": geographic_scope,
        "status": status,
        "method": method,
        "confidence": max(0, min(100, confidence)),
    }

def unavailable(
    source: str,
    attempted_query: str,
    affected_field: str,
    reason: str,
    impact: str,
    verification_required: str,
    source_url: str = "",
) -> dict:
    return {
        "value": None,
        "source": source,
        "source_url": source_url,
        "retrieved_at": now_iso(),
        "status": "DATA_UNAVAILABLE",
        "attempted_query": attempted_query,
        "affected_field": affected_field,
        "reason": reason,
        "impact_on_analysis": impact,
        "verification_required": verification_required,
        "confidence": 0,
    }
