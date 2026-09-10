# Data Sources — Real-Data-First Registry (Single Source of Truth: `data/source_registry.json` & `data/legal_source_registry.json`)

Every important value in LAND2BIZ must trace to a registry source, a versioned dataset, or a deterministic calculation. Anything else is `DATA_UNAVAILABLE` — never an invented number.

Rule: do NOT scatter source URLs through business logic. Engines read versioned files in `data/`; the registry records authority, period, legal compliance, and limits.

## Authority & Evidence Quality Hierarchy (AI never overrides Levels 1–5 / Classes A–D)

| Class | Level | Source Authority Category | Allowed Usage in Engine |
|---|---|---|---|
| **Class A** | Level 1 | Official Government dataset (Census 2011, HCES 2022-23, ODOP, NIC 2008) | Primary Baseline Calculations |
| **Class B** | Level 2 | Official statutory / scheme guideline (PMEGP, PMFME, MUDRA, AIF, R1-R6) | Primary Scheme Routing & Regulatory Screening |
| **Class C** | Level 3 | Authoritative institutional source (NABARD, RBI) | Cost & Feasibility Baselines (`ESTIMATED` range) |
| **Class D** | Level 4/5 | Authoritative open / commercial geo data (OSM Overpass, Google Places) | Live Spatial Amenity & Competition Mapping |
| **Class E** | Level 6 | Approved secondary source | Contextual Evidence Only (Requires Owner Approval) |
| **Class F** | Level 7 | AI inference / LLM narrative | **EXPLANATION ONLY — NEVER numerical calculation** |

## Integrated & Approved Sources Catalog (`LAND2BIZ_DATA_CATALOG.md`)

See [`LAND2BIZ_DATA_CATALOG.md`](file:///c:/Users/gmh08/OneDrive/Pictures/Desktop/SIH26/LAND2BIZ/LAND2BIZ_DATA_CATALOG.md) for the complete 25-source data matrix.

| Source | Dataset / Endpoint | Period | Status | Legal Use Status |
|---|---|---|---|---|
| Census 2011 + TN District Portal | `data/tamilnadu/districts.json` v1.0 | 2011 (2026-est) | ACTIVE — Baseline 2011 VERIFIED; 2026 ESTIMATED | PERMITTED (Public Domain) |
| ODOP National List V32 | `data/tamilnadu/odop_products.json` v1.0 | 2025-08-19 | ACTIVE — Product list, never demand proof | PERMITTED (Official Release) |
| HCES 2022-23 (NSSO / MoSPI) | `data/normalized/hces_consumption_baseline.json` v1.0 | 2022-23 | ACTIVE — Regional Demand Signal baseline | PERMITTED (Public Statistics) |
| NIC 2008 (MoSPI) | `data/seed/nic_codes.json` v1.0 | 2008 | ACTIVE — 5-digit industrial activities | PERMITTED (Official Standard) |
| SIH 2026 Core Loan Rules | `data/schemes/core_loan_rules.json` v1.0 | 2026 | ACTIVE — 10% margin / 90% loan baseline ratios | PROJECT_RULE |
| PMFME (MoFPI) | `support_schemes.json → pmfme_individual` | 2020-2026 | ACTIVE — 35% subsidy, cap Rs 10L | PERMITTED (Govt Scheme) |
| PMEGP (MoMSME/KVIC) | `support_schemes.json → pmegp_micro` | O.M. 07.12.2023 | ACTIVE — 15-35% margin money matrix | PERMITTED (Govt Scheme) |
| MUDRA (PMMY) | `support_schemes.json → mudra_pmmy` | 2015- ; 24.10.2024 | ACTIVE — Shishu / Kishore / Tarun / Tarun Plus | PERMITTED (Govt Scheme) |
| Stand-Up India (DFS) | `support_schemes.json → standup_india` | From 2016 | ACTIVE — Rs 10L-1Cr SC/ST/Women greenfield | PERMITTED (Govt Scheme) |
| AIF (DA&FW) | `support_schemes.json → aif` | From 2020 | ACTIVE — 3% interest subvention up to Rs 2Cr | PERMITTED (Govt Scheme) |
| ACABC (MANAGE/NABARD) | `support_schemes.json → acabc` | From 2002 | ACTIVE — 36%/44% back-ended subsidy | PERMITTED (Govt Scheme) |
| NABARD Model Projects | `data/business-templates/msme_cost_templates.json` v1.0 | Varies | ACTIVE — Feasibility cost ranges (`ESTIMATED`) | PERMITTED (Institutional Model) |
| Regulatory Rules R1-R6 | `data/regulatory-rules/screening_rules.json` v1.0 | 2026 | ACTIVE — PASS/FAIL/NEEDS_VERIFICATION screen | STATUTORY_RULE_MATRIX |
| M21 Ground Checklists | `data/seed/ground_truth_checklists.json` v1.0 | 2026 | ACTIVE — User mandatory ground verification | USER_VERIFICATION |
| OSM Overpass (Live) | Live Overpass HTTP Query (`geo_live.py`) | Live-at-query | ACTIVE — Mapped objects only | PERMITTED (ODbL License) |
| Nominatim (Live) | Live Nominatim HTTP Query (`geo_live.py`) | Live-at-query | ACTIVE — Location normalization only | PERMITTED (Open Service) |
| Google Places API (New) | Live Google Places HTTP Query (`geo_live.py`) | Live-at-query | ACTIVE — Registered commercial places | PERMITTED (API Terms) |

## Proposed Sources Governance (`data/PROPOSED_SOURCES.md`)

Unapproved sources (GST/GSTN datasets, PLFS, VIIRS night lights, TRAI telecom density, scraped business directories, social media data) are documented in [`data/PROPOSED_SOURCES.md`](file:///c:/Users/gmh08/OneDrive/Pictures/Desktop/SIH26/LAND2BIZ/data/PROPOSED_SOURCES.md). They are strictly **EXCLUDED** from production calculations until project-owner sign-off.

## Provenance Envelope (Every External Value)

`{value, source, source_url, retrieved_at, data_period, geographic_scope, status, method, confidence, provenance_origin}` with status in `VERIFIED | ESTIMATED | NEEDS_VERIFICATION | DATA_UNAVAILABLE | VERIFIED_BASELINE` and `provenance_origin` in `USER_PROVIDED | SOURCE_BASED | DERIVED | ASSUMED`.

## Failure Contract

External failure → `DATA_UNAVAILABLE` with source, attempted query, timestamp, affected field, reason, impact, required verification. Scores withhold (`DATA_INCOMPLETE`) instead of substituting 50. OSM `mapped=0` never means "none exist".
