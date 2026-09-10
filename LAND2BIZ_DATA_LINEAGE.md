# LAND2BIZ — DATA LINEAGE GRAPH & TRACEABILITY MAP

```
========================================================================================================================
                                      LAND2BIZ END-TO-END DATA LINEAGE ARCHITECTURE
========================================================================================================================
```

## 1. Legal Compliance & Governance Gate

```
data/legal_source_registry.json (25 Approved Sources)
  │ [Legal Governance Gate: Authority Levels 1-6]
  │ (Compliance: Public domain, Open Data ODbL, Google API Terms, Scheme Notifications)
  │
  ├──► Level 1 Official Government Datasets (Census 2011, HCES 2022-23, ODOP V32, NIC 2008)
  ├──► Level 2 Statutory & Scheme Guidelines (SIH 2026, PMFME, PMEGP, MUDRA, SUPI, AIF, ACABC, R1-R6)
  ├──► Level 3 Institutional Models (NABARD, RBI)
  ├──► Level 4/5 Open & Commercial Geo Data (OSM Overpass, Nominatim, Google Places API)
  └──► Proposed Unapproved Sources -> Logged in data/PROPOSED_SOURCES.md (Strictly Excluded)
```

---

## 2. Demographic & Regional Demand Lineage

```
Census of India 2011 / TN District Portal (data/tamilnadu/districts.json v1.0)
  │ [Level 1 Official Baseline]
  ├───────────────────────────────────────────────► District Baseline Record (38 TN Districts)
  │                                                   │ (population_2011: VERIFIED_BASELINE)
  │                                                   ▼
  │                                                 Decadal Growth Formula: pop_2011 * (1 + 0.156)^(years / 10)
  │                                                   │
  │                                                   ▼
  │                                                 2026 Population Estimate (population_estimate_2026: ESTIMATED)
  │                                                   │
  │                                                   ▼
  │                                                 Catchment Population Baseline
  │                                                   │
  │                                                   ▼
MoSPI HCES 2022-23 (data/normalized/hces_consumption_baseline.json)
  │ [Level 1 NSS Survey Baseline]
  └───────────────────────────────────────────────► Regional Demand Signal (Rural MPCE Rs 5,310 / Urban Rs 8,310)
                                                      │
                                                      ▼
                                                    Site Intelligence & Recommendation Pipeline (M1 / M5)
```

---

## 3. Spatial Supply & Multi-Radius Catchment Lineage

```
Google Places API (New) (searchNearby HTTP) ───[Primary]───┐
  │ [Level 5 Commercial Geo Data]                          │
  │ (Place IDs & coordinates)                              │
  │                                                        ▼
  │                                                 Spatial-Name Entity Deduplication Engine (haversine < 50m)
  │                                                 Formula: Deduplicated Supply = Google + OSM (dedup matched)
  │                                                        ▲
  │                                                        │
OpenStreetMap Overpass API (Live Mirrors) ───[Fallback]───┘
  │ [Level 4 Open Geo Data]
  │ (road_km, water, mapped amenity fallback)
  │
  ▼
Category Dynamic Catchment Radii (app/services/geo_live.py)
  ├─► Grocery / Dairy: 1,000m (1km)
  ├─► Fuel & EV Charging: 2,000m (2km)
  ├─► Market / School / Bank: 3,000m (3km)
  ├─► Hospital / Agri Depot: 5,000m (5km)
  └─► Cold Storage / Food Processing: 10,000m (10km)
  │
  ▼
Site & Market Intelligence Services (app/services/geo_live.py)
  │
  ├───────────────────────────────────────────────► Site Subscore (site: 0.25 weight)
  │
  ├───────────────────────────────────────────────► Competition Density Subscore (competition_inv: 0.15 weight)
  │
  └───────────────────────────────────────────────► Market Gap Engine (app/engines/ranking/market_gap.py)
                                                      │ (Official MoSPI / NABARD / NDDB Benchmarks)
                                                      ▼
                                                    Formula: Gap = (Expected Units - Observed Deduplicated) / Expected
                                                    (Unbenchmarked category -> NEEDS_VERIFICATION & Score Withheld)
```

---

## 4. Financial Feasibility & Loan Engine Lineage

```
SIH 2026 Problem Brief (data/schemes/core_loan_rules.json v1.0)
  │ [Level 2 Project Rule Baseline]
  ├───────────────────────────────────────────────► Core Financial Ratios (Margin 10% / Loan 90%)
  │                                                   │
  │                                                   ▼
  │                                                 Project Cost Engine (app/engines/finance/project_cost.py)
  │                                                   │
  │                                                   ▼
  │                                                 Loan Scheme Router (app/engines/loan/router.py)
  │                                                 - Micro Loan (Cost <= Rs 1.4L): Cap Rs 1.25L @ 6.5%, 3y + 3m mor.
  │                                                 - Term Loan (Cost <= Rs 50L): Cap Rs 45L @ 8.0%, 7y + 6m mor.
  │                                                   │
  │                                                   ▼
  │                                                 EMI Engine (app/engines/loan/emi.py)
  │                                                   │
  │                                                   ▼
  └───────────────────────────────────────────────► Financial Line Item Provenance Origin Tagging
                                                      - Project Cost: DERIVED
                                                      - Monthly Net Typical: SOURCE_BASED / USER_PROVIDED
                                                      - EMI & Loan Amount: SOURCE_BASED

NABARD Model Projects (data/business-templates/msme_cost_templates.json v1.0)
  │ [Level 3 Institutional Model]
  └───────────────────────────────────────────────► Feasibility Assessment (app/engines/risk/assess.py)
                                                      Formula: Payback = Project Cost / (Monthly Net * 12)
                                                      Status: ESTIMATED range (Requires local quote verification)
```

---

## 5. Decision Scoring & Three-Metric Output Lineage

```
Decision & Evidence Engine (app/api/routes/decision.py)
  │
  ├───────────────────────────────────────────────► Overall Opportunity Score (M5 Ranking)
  │                                                   Formula: 0.25*site + 0.25*gap + 0.20*financial + 0.15*(100-comp) + 0.15*govt
  │
  ├───────────────────────────────────────────────► Confidence Score (0-100)
  │                                                   Formula: Average confidence of subscores (based on source authority & freshness)
  │
  ├───────────────────────────────────────────────► Data Completeness Score (0-100)
  │                                                   Formula: (Present Verified Subscores / Total Required 5) * 100
  │
  ├───────────────────────────────────────────────► Recommendation Status (final_status())
  │                                                   - "PROMISING — NEEDS VERIFICATION" (Score >= 60, Ground checks pending)
  │                                                   - "STRONG PRELIMINARY OPPORTUNITY" (Score >= 75, Ground checks done)
  │                                                   - "INSUFFICIENT DATA" (Missing inputs / Low confidence)
  │
  ▼
M21 Ground Truth Checklists (data/seed/ground_truth_checklists.json)
  │ [Level 1 Mandatory Ground Verification]
  │ (Physical site visit, road width check, local competitor check, document verification)
  │ Note: User interactive tickbox only — NEVER auto-completed by system.
  │
  ▼
Gemini AI Narrative Layer (app/ai/providers/gemini.py)
  │ [Level 6 Explanation Only]
  └───────────────────────────────────────────────► Multilingual Summary & Narrative Explanation
                                                      (Strict Rule: AI MUST NOT alter any calculated number)
```
