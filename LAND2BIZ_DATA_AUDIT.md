# LAND2BIZ DATA AUDIT — real-data-first implementation

## 1. Verified: what is real and where it comes from

| Source | Dataset | Authority | Period | Use in engine |
|---|---|---|---|---|
| SIH 2026 brief | `data/schemes/core_loan_rules.json` (10/90, Micro/Term slabs) | LEVEL 2 (project rule; NBCFDC umbrella 7%/8% disclosed) | 2026 | M6/M7/M8 deterministic finance + EMI (reducing-balance, moratorium accrual) |
| NBCFDC FAQ | raw PDF (fetched 2026-09-10) | LEVEL 2 | 2024-11 | Umbrella rules, OBC + Rs 3L income cap |
| Census 2011 + TN portal | `data/tamilnadu/districts.json` (38 districts, area/pop/density) | LEVEL 1 | 2011 | District baseline; 2026 figure is **ESTIMATED** (growth-adjusted), never presented as Census |
| ODOP V32 | `data/tamilnadu/odop_products.json` (TN rows 961–1015) | LEVEL 1 | 2025-08-19 | Candidate generation / support potential, never demand proof |
| OSM + Overpass | live batched query, per-object records (osm_id/name/lat/lng/tags/distance/retrieved_at) | LEVEL 4 | live | M1/M3 mapped supply only — **never total ground truth** |
| Nominatim | reverse-geocode | LEVEL 4 | live | Location normalization only, never business proof |
| PMFME / PMEGP / MUDRA / Stand-Up / AIF / ACABC | `data/schemes/support_schemes.json` | LEVEL 2 | per-scheme | M9 deterministic scheme matching with versioned rules |
| NIC 2008 | `data/seed/nic_codes.json` | LEVEL 1 | 2008 | Udyam field mapping; ambiguous = NEEDS_VERIFICATION |
| NABARD / cold-chain refs | `data/business-templates/msme_cost_templates.json` (ranges only, ESTIMATED) | LEVEL 3 | varies | M6 baseline → feasibility, never final profit |
| Regulatory rules R1–R6 | `data/regulatory-rules/screening_rules.json` | project | — | PASS/FAIL/NEEDS_VERIFICATION; never "approval guaranteed" |
| M21 checklists | `data/seed/ground_truth_checklists.json` | project | — | user-marked only, never auto-completed |

## 2. Architecture built to comply with the 32-section spec

- `data/source_registry.json` — centralized source registry (§1): source_id, organization, official_url, type, coverage, period, refresh, fields, authority_level, limitations, last_checked, status. No URLs scattered in business logic.
- `data/PIPELINE.md` + dirs (`raw/`, `normalized/`, `processed/`, `sources/`, `schemas/`, `snapshots/`, `validation/`) — §3 ingestion pipeline.
- `data/schemas/` — JSON Schemas for provenance envelope, DATA_UNAVAILABLE envelope, source_registry entry.
- `data/SOURCES.md` — §25 source documentation, fully mapped to registry.
- `app/core/provenance.py` — provenance envelope + `unavailable()` helper (§3).
- `app/core/data_loader.py` — single loader for all versioned datasets.
- `app/services/data_quality.py` — §5 automated validation (schema/dupes/range/hierarchy), produces DATA QUALITY REPORT, flags never silently repairs.
- `app/services/cache.py` — §22 caching with original timestamp preserved.
- `app/services/conflicts.py` — §15 source-conflict engine, resolves only by documented authority hierarchy.
- `app/services/geo_live.py` — §2.2 OSM/Overpass batched query; failure → DATA_UNAVAILABLE, never fake; `mapped=0 ≠ none exist`.
- `app/engines/ranking/score.py` — §13 deterministic M5 formula (0.25/0.25/0.20/0.15/0.15), `DATA_INCOMPLETE` withholds score instead of substituting 50.
- `app/engines/ranking/market_gap.py` — §7 gap needs documented benchmark; without one → NEEDS_VERIFICATION.
- `app/engines/regulatory/screen.py` — §2.17 rule-based, PASS/FAIL/NEEDS_VERIFICATION only.
- `app/engines/risk/assess.py` — §10 financial feasibility withholds without revenue baseline.
- `app/engines/loan/{router,emi}.py` — §11/§12 deterministic; >max → `out_of_range` (manual review), never crash.
- `app/ai/providers/{base,gemini}.py` — §18 AI explains only; `guard()` asserts AI cannot mutate deterministic evidence and forces uncertainty language.
- `app/api/routes/decision.py` — §17 final recommendation: deterministic reasons + sources + estimates + missing + M21 checks + explicit never-claims; `ai_contract` field.
- `app/api/routes/data_health.py` — §27 `/data/health` endpoint: source availability + record counts + quality report.
- `app/api/routes/intelligence.py` — §6, §9, §21 site/market/district with honest envelopes.

## 3. Mock data removed (§20)

- `apps/web/lib/mockContracts.ts` — `MOCK_OPPORTUNITIES` emptied + throws if populated; no production component imports it.
- Removed from UI: Varanasi default pin, SH-78/18m road, 48,500 people, 15 fake competitors, 92/88 fixed scores, pre-ticked 5/5 ground checks, "₹75,000/mo" hardcoded profit promises.
- Removed hardcoded PMFME subsidy math from `DynamicFinanceCalculator` — subsidy now comes from M9 scheme match, not invented.
- Udyam card rewritten to say "Registration Assistance only — never completes registration".

## 4. Data provenance on every important value

Every externally-derived value returns the provenance envelope:
`{value, source, source_url, retrieved_at, data_period, geographic_scope, status, method, confidence}`.
Status ∈ `VERIFIED | ESTIMATED | NEEDS_VERIFICATION | DATA_UNAVAILABLE | VERIFIED_BASELINE`.

## 5. Reproducibility & audit trail (§23, §24)

Given same input + dataset version + rules version → identical numerical output. Every ranked score carries `{value, formula, inputs, sources, status, confidence}` evidence object. AI wording may vary; numbers must not.

## 6. Test results (§26)

- Backend: **34/34 passed** (`tests/unit/test_finance.py`, `tests/unit/test_real_data_first.py`, `tests/integration/test_api.py`).
- Frontend build: **passes** (Next.js production static pages compiled; TypeScript clean).
- Tests prove: Census 2011 labelled VERIFIED + 2026 estimate labelled ESTIMATED; unknown district → DATA_UNAVAILABLE not invented; OSM zero ≠ none exist; missing API → DATA_UNAVAILABLE; EMI deterministic; loan cap works; >max → null (manual review); scheme matching deterministic; NIC mapping source-backed; score deterministic; AI cannot modify score; ground checks cannot auto-complete; production code contains no mock fallback.

## 7. Known weaknesses / remaining verification

- Census 2011 is historical; 2026 estimate is growth-adjusted (ESTIMATED, ~55% confidence).
- OSM coverage varies by village — zero mapped is not zero real.
- ACABC/dairy slabs change by notification → NEEDS_VERIFICATION in DPR.
- HCES, MSME project profiles, RBI rates not yet normalized → no invented rates/baselines.
- `/data/health` should be wired to a persistence layer for refresh tracking (currently stat-based).
- Lint: pre-existing `setState-in-effect` patterns remain in untouched pages (not introduced by this work; the `any` types I introduced are fixed).
