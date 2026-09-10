# Proposed Data Sources Governance (`data/PROPOSED_SOURCES.md`)

This document tracks external data sources that have been discussed in earlier architecture reviews or project discussions, but are **NOT** part of the current approved LAND2BIZ decision engine build.

In accordance with LAND2BIZ Source Governance (§4 & §44), these sources are **PROPOSED ONLY**. They **MUST NOT** be automatically integrated into calculations or production code without explicit, written project-owner approval.

---

## Unapproved / Proposed Source Registry

| Proposed Source | Official Authority / URL | Coverage & Granularity | Technical / Legal Requirements | Limitations & Risks | Why Project Owner Approval is Required |
|---|---|---|---|---|---|
| **GST / GSTN Business Transaction Data** | GSTN (Goods and Services Tax Network) | Business-level turnover, filing status, tax tier | Requires statutory GSP/ASP API credentials, GSTIN consent OTP architecture. | Sensitive private financial data. Subject to strict privacy laws & non-disclosure. | Private transaction data cannot be accessed without explicit user consent and legal GSP integration. |
| **Periodic Labour Force Survey (PLFS)** | MoSPI / NSSO (`mospi.gov.in`) | State & District urban/rural employment & unemployment rates | Annual / quarterly MoSPI statistical tables. | Sample survey data; does not provide village or plot-level employment status. | Statistical proxy only; requires owner decision on whether employment proxies fit decision scoring. |
| **VIIRS Nighttime Lights Data** | NOAA / NASA Earthdata (`earthdata.nasa.gov`) | Satellite radiance at 15 arc-second (~500m) resolution | Earthdata login, NetCDF/GeoTIFF raster processing pipeline. | Proxy for economic activity, NOT proof of local commercial demand or business profitability. | Satellite proxy data can easily mislead rural analysis if used as direct demand evidence. |
| **TRAI Telecom Density Data** | Telecom Regulatory Authority of India (`trai.gov.in`) | Service-area (Telecom Circle) mobile/broadband subscriber density | Monthly TRAI press release tables. | Circle-level data (e.g. all of Tamil Nadu); zero subdistrict or village resolution. | Too coarse (State level) to influence local 5km catchment scoring without misrepresenting precision. |
| **Private Commercial Business Directories** | Various Third-Party Vendors | Scraped company listings, phone numbers, trade names | Commercial licensing agreements, proprietary API keys. | High rate of stale records, duplicate listings, missing coordinates, unverified status. | Unverified commercial data violates Level 1–4 source hierarchy rules. |
| **Web-Scraped Social Media Data** | Social Media Platforms / Web Scraping | Post counts, check-ins, mentions, ratings | Scraping bots, API tokens, TOS compliance review. | Highly biased towards urban tech users; near-zero coverage for rural land decisions. | Scraping violates platform terms of service and introduces high demographic bias. |

---

## Governance Rules for Proposed Sources

1. **Strict Exclusion from Calculations:** No backend code in `apps/api/app/` shall import, read, or execute queries against any dataset listed in this file unless it is formally moved to `data/source_registry.json` and `data/legal_source_registry.json` after explicit owner sign-off.
2. **Evaluation Protocol:** To propose adding a new source:
   - Verify official domain and publication authority.
   - Document geographic scope, data period, and API cost.
   - Verify whether licensing permits commercial decision support.
   - Present a pull request adding the entry to this document for project-owner review.
