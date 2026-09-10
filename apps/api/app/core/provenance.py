"""Canonical Evidence Schema + Provenance Envelope Helpers. Enforces Section 5 & Section 6 rules."""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Any, Optional

STATUSES = (
    "VERIFIED",
    "ESTIMATED",
    "USER_PROVIDED",
    "DERIVED",
    "ASSUMED",
    "NEEDS_VERIFICATION",
    "DATA_UNAVAILABLE",
    "SOURCE_UNVERIFIED",
    "SOURCE_CONFLICT",
    "STALE",
    "VERIFIED_BASELINE",  # Alias for backward compatibility with Census 2011
)

EVIDENCE_CLASSES = ("CLASS A", "CLASS B", "CLASS C", "CLASS D", "CLASS E", "CLASS F")
LEGAL_STATUSES = ("LEGAL_USE_VERIFIED", "LEGAL_USE_RESTRICTED", "LEGAL_USE_UNVERIFIED", "LEGAL_USE_NOT_PERMITTED")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def canonical_evidence(
    value: Any,
    unit: str | None = None,
    data_type: str | None = "float",
    source_id: str | None = None,
    source_name: str | None = None,
    organization: str | None = None,
    official_url: str | None = None,
    source_type: str | None = "OFFICIAL_DATASET",
    authority_level: str | None = "LEVEL 1",
    document_title: str | None = None,
    document_url: str | None = None,
    document_version: str | None = "1.0",
    publication_date: str | None = None,
    effective_from: str | None = None,
    effective_to: str | None = None,
    table: str | None = None,
    section: str | None = None,
    page: str | None = None,
    field: str | None = None,
    record_id: str | None = None,
    raw_reference: str | None = None,
    country: str | None = "India",
    state: str | None = "Tamil Nadu",
    district: str | None = None,
    block: str | None = None,
    village: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    radius_km: float | None = None,
    geographic_level: str | None = "district",
    data_period: str | None = "2026",
    freshness_status: str | None = "CURRENT",
    status: str = "VERIFIED",
    evidence_class: str = "CLASS A",
    confidence: int = 100,
    data_completeness: int = 100,
    raw_value: Any = None,
    transformation: str | None = None,
    formula: str | None = None,
    assumptions: list[str] | None = None,
    derived_from: list[str] | None = None,
    access_method: str | None = "Public Open Dataset",
    license: str | None = "Government Open Data License",
    permitted_use: str | None = "Public decision support analysis",
    commercial_use: str | None = "PERMITTED",
    storage_allowed: bool = True,
    caching_allowed: bool = True,
    attribution_required: bool = True,
    legal_status: str = "LEGAL_USE_VERIFIED",
    verification_date: str | None = "2026-09-10",
    limitations: list[str] | None = None,
    modules: list[str] | None = None,
    used_in_calculation: bool = True,
    metrics_affected: list[str] | None = None,
) -> dict:
    assert status in STATUSES, f"bad status {status}"
    assert evidence_class in EVIDENCE_CLASSES, f"bad evidence_class {evidence_class}"
    assert legal_status in LEGAL_STATUSES, f"bad legal_status {legal_status}"

    return {
        "value": value,
        "unit": unit,
        "data_type": data_type,
        "source": {
            "source_id": source_id,
            "source_name": source_name,
            "organization": organization,
            "official_url": official_url or document_url or "",
            "source_type": source_type,
            "authority_level": authority_level,
        },
        "evidence": {
            "document_title": document_title,
            "document_url": document_url or official_url or "",
            "document_version": document_version,
            "publication_date": publication_date,
            "effective_from": effective_from,
            "effective_to": effective_to,
            "table": table,
            "section": section,
            "page": page,
            "field": field,
            "record_id": record_id,
            "raw_reference": raw_reference,
        },
        "geography": {
            "country": country,
            "state": state,
            "district": district,
            "block": block,
            "village": village,
            "lat": lat,
            "lng": lng,
            "radius_km": radius_km,
            "geographic_level": geographic_level,
        },
        "time": {
            "data_period": data_period,
            "retrieved_at": now_iso(),
            "freshness_status": freshness_status,
        },
        "classification": {
            "status": status,
            "evidence_class": evidence_class,
            "confidence": max(0, min(100, confidence)),
            "data_completeness": max(0, min(100, data_completeness)),
        },
        "method": {
            "raw_value": raw_value if raw_value is not None else value,
            "transformation": transformation,
            "formula": formula,
            "assumptions": assumptions or [],
            "derived_from": derived_from or [],
        },
        "legal": {
            "access_method": access_method,
            "license": license,
            "permitted_use": permitted_use,
            "commercial_use": commercial_use,
            "storage_allowed": storage_allowed,
            "caching_allowed": caching_allowed,
            "attribution_required": attribution_required,
            "legal_status": legal_status,
            "verification_date": verification_date,
        },
        "limitations": limitations or [],
        "engine_usage": {
            "modules": modules or [],
            "used_in_calculation": used_in_calculation,
            "metrics_affected": metrics_affected or [],
        },
    }


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
