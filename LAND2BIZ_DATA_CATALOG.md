# LAND2BIZ — STANDARDIZED DATA CATALOG

**Catalog Version:** 2.0 (Master Audit Standard)  
**Last Verified:** September 10, 2026  
**Governance Standard:** Single source of truth backed by `data/source_registry.json`, `data/legal_source_registry.json`, and `data/catalog/datasets.json`.

---

Dataset: Census of India 2011 Tamil Nadu District Baseline
Source: Office of the Registrar General & Census Commissioner, India / Government of Tamil Nadu
Organization: Ministry of Home Affairs / Government of Tamil Nadu
Official URL: https://censusindia.gov.in/
Official document/API: District Census Handbooks (DCHB) Tamil Nadu 2011 / TN District Portal
Authority level: LEVEL 1
Evidence class: CLASS A
Legal status: LEGAL_USE_VERIFIED
License/terms: Public Domain / Government Open Data Commons
Attribution: Source: Office of the Registrar General & Census Commissioner, India
Data period: 2011
Publication date: 2011-03-31
Last verified: 2026-09-10
Geographic granularity: district
Update frequency: Decennial

Raw fields: population_2011, area_km2, density_2011, headquarters
Normalized fields: population_2011 (VERIFIED_BASELINE), population_estimate_2026 (ESTIMATED), density_estimate_2026

Transformation: decadal_growth_estimate_2026 = pop_2011 * (1 + 0.156)^(years_since_2011 / 10). Decadal rate 15.6% from Census A-02 table.

Used by modules: M1, M4, M5, M11

Used in calculations: Catchment Population Baseline, Decadal Population Projection 2026, Market Gap Expected Supply

Known limitations: Historical 2011 baseline. Post-2019 split districts are administrative-derived.

Confidence: 95% (Census Handbook Row Lookup)

Verification status: TRUSTED_FOR_CALCULATION

---------------------------------------------------------------

Dataset: National ODOP Product List V32 (Tamil Nadu)
Source: One District One Product (ODOP) Initiative
Organization: DPIIT / Ministry of Food Processing Industries, Government of India
Official URL: https://odop.mofpi.gov.in/
Official document/API: ODOP Product List V32 (August 2025 Release PDF)
Authority level: LEVEL 1
Evidence class: CLASS A
Legal status: LEGAL_USE_VERIFIED
License/terms: Official Government Release
Attribution: Source: One District One Product (ODOP) Initiative, MoFPI / DPIIT
Data period: 2025-08-19
Publication date: 2025-08-19
Last verified: 2026-09-10
Geographic granularity: district
Update frequency: Per release

Raw fields: District, Primary Product, Secondary Product, Sector
Normalized fields: odop_primary, odop_secondary, odop_sector

Transformation: Direct row lookup matching district name in Tamil Nadu rows 961-1015.

Used by modules: M1, M5, M9

Used in calculations: Government Support Potential Subscore, District Economic Profile Evidence

Known limitations: Product assignment list only; does not guarantee demand or profitability.

Confidence: 85% (Official Release PDF Row Lookup)

Verification status: TRUSTED_FOR_CALCULATION

---------------------------------------------------------------

Dataset: Household Consumption Expenditure Survey 2022-23 (Tamil Nadu Baseline)
Source: National Sample Survey (NSS 79th Round)
Organization: National Sample Survey Office (NSSO), MoSPI, Government of India
Official URL: https://mospi.gov.in/
Official document/API: MoSPI HCES 2022-23 NSS 79th Round Survey Report
Authority level: LEVEL 1
Evidence class: CLASS A
Legal status: LEGAL_USE_VERIFIED
License/terms: Official Public Statistics
Attribution: Source: National Sample Survey (NSS), MoSPI, Government of India
Data period: 2022-2023
Publication date: 2024-02-24
Last verified: 2026-09-10
Geographic granularity: state
Update frequency: Per survey round

Raw fields: Rural MPCE INR (5310), Urban MPCE INR (8310), Food Share %, Transport Share %
Normalized fields: rural_mpce_inr, urban_mpce_inr, household_monthly_spend_est_inr, regional_demand_signal

Transformation: Regional Demand Index = (mpce * sector_share / 100) * (catchment_pop / 5) / 100000.

Used by modules: M3, M4, M5

Used in calculations: Regional Demand Index, Catchment Expenditure Potential

Known limitations: State rural/urban average baseline only — MUST NOT be presented as exact village spending.

Confidence: 65% (State MPCE Statistical Average Baseline)

Verification status: SOURCE_VERIFIED_BUT_LIMITED

---------------------------------------------------------------

Dataset: National Industrial Classification 2008 Activity Directory
Source: National Industrial Classification (NIC 2008)
Organization: Ministry of Statistics and Programme Implementation (MoSPI)
Official URL: https://nicfinder.mospi.gov.in/
Official document/API: NIC 2008 Official 5-Digit Industrial Activity Classification Directory
Authority level: LEVEL 1
Evidence class: CLASS A
Legal status: LEGAL_USE_VERIFIED
License/terms: Official Industrial Standard
Attribution: Source: Ministry of Statistics and Programme Implementation (MoSPI)
Data period: 2008
Publication date: 2008-01-01
Last verified: 2026-09-10
Geographic granularity: national
Update frequency: Per revision

Raw fields: NIC Code, Description, Sub-class
Normalized fields: nic_code, nic_description, business_category

Transformation: Exact business category to 5-digit NIC code mapping via data/seed/nic_codes.json.

Used by modules: M12, M14

Used in calculations: DPR Classification, Udyam Registration Assistance Mapping

Known limitations: Ambiguous category mappings default to NEEDS_VERIFICATION.

Confidence: 90% (Official Standard Code Lookup)

Verification status: TRUSTED_FOR_CALCULATION

---------------------------------------------------------------

Dataset: SIH 2026 LAND2BIZ Core Financing Rules
Source: SIH 2026 Problem Specification Brief
Organization: Smart India Hackathon 2026 / Ministry of MSME Baseline Rules
Official URL: N/A (Project Specification Brief)
Official document/API: SIH 2026 Core Loan & Financing Specification
Authority level: LEVEL 2
Evidence class: CLASS B
Legal status: LEGAL_USE_VERIFIED
License/terms: Project Specification Rule
Attribution: Source: SIH 2026 LAND2BIZ Problem Specification
Data period: 2026
Publication date: 2026-01-01
Last verified: 2026-09-10
Geographic granularity: national
Update frequency: Per hackathon release

Raw fields: beneficiary_contribution_pct (10%), loan_pct (90%), max_loan, interest_rate, tenure_years, moratorium_months
Normalized fields: margin_capital, project_cost, loan_amount, scheme_routed, emi

Transformation: Project Cost = Capital / 0.10; Loan = min(Project Cost * 0.90, Scheme Cap); EMI = reducing balance with moratorium interest accrual.

Used by modules: M6, M7, M8

Used in calculations: Project Cost Calculation, Loan Cap Routing, Reducing Balance EMI Schedule

Known limitations: Baseline project caps: Rs 1.25L Micro (@6.5%), Rs 45L Term (@8.0%). Over Rs 50L requires manual review.

Confidence: 100% (Deterministic Mathematical Formula)

Verification status: TRUSTED_FOR_CALCULATION

---------------------------------------------------------------

Dataset: Central & State Support Schemes Matrix
Source: Official Scheme Notifications (PMEGP, PMFME, MUDRA, Stand-Up India, AIF, ACABC)
Organization: MoMSME, MoFPI, DFS, DA&FW, KVIC, MANAGE
Official URL: https://www.myscheme.gov.in/
Official document/API: Official Scheme Guidelines & Circulars
Authority level: LEVEL 2
Evidence class: CLASS B
Legal status: LEGAL_USE_VERIFIED
License/terms: Official Government Scheme Guidelines
Attribution: Source: Ministry of MSME / MoFPI / DFS / DA&FW / KVIC
Data period: 2020-2026
Publication date: 2023-12-07
Last verified: 2026-09-10
Geographic granularity: national
Update frequency: Per circular / notification

Raw fields: Scheme ID, Subsidy %, Max Subsidy INR, Eligible Categories, Margin Matrix
Normalized fields: scheme_id, estimated_subsidy_inr, subsidy_pct, confidence

Transformation: Match business category, location, and project cost against scheme criteria matrices.

Used by modules: M5, M9

Used in calculations: Government Support Potential Subscore, Indicative Subsidy Calculation

Known limitations: Indicative matching only. Final sanction rests with implementing bank/agency.

Confidence: 80% (Official Scheme Guideline Matrix Matching)

Verification status: TRUSTED_FOR_CALCULATION

---------------------------------------------------------------

Dataset: NABARD / MSME Micro Enterprise Cost & Feasibility Templates
Source: NABARD Model Bankable Projects / MSME Profiles
Organization: National Bank for Agriculture and Rural Development (NABARD) / MoMSME
Official URL: https://www.nabard.org/
Official document/API: NABARD Model Project Profiles & MSME Cost Guidelines
Authority level: LEVEL 3
Evidence class: CLASS C
Legal status: LEGAL_USE_VERIFIED
License/terms: Institutional Model Profiles
Attribution: Source: National Bank for Agriculture and Rural Development (NABARD)
Data period: 2024-2026
Publication date: 2024-01-01
Last verified: 2026-09-10
Geographic granularity: national
Update frequency: Per publication

Raw fields: Template ID, Capital Min INR, Capital Max INR, Monthly Net INR, Category
Normalized fields: capital_min_inr, capital_max_inr, monthly_net_inr, payback_years, financial_score

Transformation: Payback = Project Cost / (Monthly Net * 12); Feasibility Score = 100 - (Payback/7)*100.

Used by modules: M6, M10

Used in calculations: Financial Feasibility Subscore, Payback Period, Repayment Burden Ratio

Known limitations: ESTIMATED cost ranges. Requires physical local vendor quotations.

Confidence: 45% (NABARD Model Profile Range Baseline)

Verification status: ESTIMATED_USE_ONLY

---------------------------------------------------------------

Dataset: OpenStreetMap Live Overpass Geographic Features API
Source: OpenStreetMap Database
Organization: OpenStreetMap Contributors
Official URL: https://www.openstreetmap.org/
Official document/API: Overpass QL API (overpass-api.de, overpass.kumi.systems, overpass.nchc.org.tw)
Authority level: LEVEL 4
Evidence class: CLASS D
Legal status: LEGAL_USE_VERIFIED
License/terms: Open Data Commons Open Database License (ODbL)
Attribution: Map data © OpenStreetMap contributors (ODbL)
Data period: live-at-query
Publication date: 2026-09-10
Last verified: 2026-09-10
Geographic granularity: coordinate_radius
Update frequency: Continuous community updates

Raw fields: osm_id, name, lat, lng, tags, distance_m
Normalized fields: mapped_count, records, catchment_radius_m, road_score, amenity_score

Transformation: Overpass QL query -> classify tags -> Haversine distance -> spatial deduplication with Google Places.

Used by modules: M1, M3, M4

Used in calculations: Road Accessibility Score, Amenity Density Score, Mapped Competition Count

Known limitations: Mapped features only — NOT total ground truth. Mapped count = 0 does NOT mean zero exist.

Confidence: 60% (Live Spatial Query Matching)

Verification status: SOURCE_VERIFIED_BUT_LIMITED

---------------------------------------------------------------

Dataset: Google Places API (New) searchNearby Web Service
Source: Google Maps Platform
Organization: Google LLC
Official URL: https://places.googleapis.com/
Official document/API: Google Places API (New) searchNearby Web Service
Authority level: LEVEL 5
Evidence class: CLASS D
Legal status: LEGAL_USE_RESTRICTED
License/terms: Google Cloud API Terms of Service
Attribution: Powered by Google Places API
Data period: live-at-query
Publication date: 2026-09-10
Last verified: 2026-09-10
Geographic granularity: coordinate_radius
Update frequency: Continuous commercial updates

Raw fields: place_id, displayName, location, types, rating
Normalized fields: google_mapped_count, deduplicated_observed_count, records

Transformation: Places API searchNearby -> extract Place IDs -> spatial deduplicate with OSM (<50m).

Used by modules: M1, M3

Used in calculations: Registered Commercial Amenity Count, Observed Supply Mapping

Known limitations: Requires active GCP key with Places API (New) enabled. Prohibits caching non-Place ID content.

Confidence: 0% (when key returns 403), 75% (when live)

Verification status: DATA_UNAVAILABLE
