# LAND2BIZ — Complete Implementation Guide (Module-Wise)
### How to actually build every part of this project, explained simply

---

## How to read this document

For every module, you'll find:
- **What it does** — in plain words
- **What goes in / what comes out**
- **How to actually build it** — step-by-step, in implementable terms
- **What makes it accurate**

Modules are grouped into 6 stages, matching the actual flow of the app from the user's first tap to the final downloadable document.

---

# STAGE 1: GETTING INFORMATION FROM THE USER

## M0 — User Input & Profile Module

**What it does:** This is the very first screen(s) the user sees. It collects the basic facts needed to run everything else: where their land/business is, how much money they have, what they want, and how much risk they're okay with.

**Inputs:** Nothing — this is where data starts.
**Outputs:** A structured user profile (JSON object) like:
```json
{
  "location": { "village": "...", "block": "...", "district": "...", "lat": 0, "lng": 0 },
  "capital": 100000,
  "land_type": "agricultural/residential/commercial/vacant",
  "goals": "steady income / growth / low-risk",
  "risk_preference": "low/medium/high",
  "business_preference": "optional — dairy/retail/etc or blank"
}
```

**How to build it:**
1. Build a simple multi-step form (React) — one question per screen works best for rural users on mobile.
2. Use a location picker: either let them type village/block/district (with autocomplete from a government village-code dataset), or drop a pin on a map (Google Maps Places Autocomplete widget).
3. For capital, use a plain number input with a rupee symbol — no jargon.
4. Store this as a single JSON object in your backend session — every other module reads from this same object, so keep the schema fixed early.
5. If you're doing voice input (M19), this is the screen where speech gets converted to these same fields.

**What makes it accurate:** Validate inputs immediately (capital must be a positive number, location must resolve to real coordinates) — catching bad input here prevents garbage data from flowing through the whole pipeline.

---

# STAGE 2: UNDERSTANDING THE LAND AND ITS SURROUNDINGS

## M1 — Site Intelligence Module

**What it does:** Looks at the actual physical location and figures out what kind of business activity the area can support — is it dense with people, well-connected by roads, near schools/hospitals, etc.

**Inputs:** Location coordinates from M0
**Outputs:** A site profile — population estimate nearby, distance to nearest market/town, road accessibility score, list of nearby institutions (schools, hospitals, bus stops)

**How to build it:**
1. Take the lat/lng from M0.
2. Call **Google Places API** (`nearbySearch`) within a 5–10 km radius to pull nearby institutions, markets, and settlements.
3. Call **Census 2011 data** (downloadable from data.gov.in) matched to the nearest village/block code for population figures — India's village-level census data is public and structured.
4. Use **OpenStreetMap's Overpass API** to check road density/type near the coordinates (this tells you if it's a highway-adjacent location or a remote one).
5. Combine these into a simple site score (e.g., weighted average of population density, road access, institution proximity) — write this as a plain formula, not an AI guess.
6. Optionally, pass the raw numbers to an LLM just to generate a one-paragraph human-readable summary — but the numbers themselves come from real data, never invented by the AI.

**What makes it accurate:** Every number here traces back to a real public dataset or live API call — nothing is guessed. Label the site score with its formula so it's explainable.

---

## M2 — Regulatory Feasibility Module

**What it does:** A basic safety filter — checks whether the land/location has obvious restrictions (e.g., too close to a water body, agricultural land where commercial activity isn't simple, etc.) before wasting time on financial analysis for something that isn't legally viable.

**Inputs:** Location + land type from M0
**Outputs:** A list of flags — e.g., "Near water body — additional clearance likely needed" or "No major flags detected — preliminary only"

**How to build it:**
1. Since there's no single clean open API for India-wide zoning data, build this as a **rule-based checklist**, not an AI model.
2. Example rules: if land_type = agricultural AND business_category = manufacturing → flag "land conversion may be required." If coordinates fall within X km of a mapped water body (checkable via OpenStreetMap water layer) → flag "coastal/water-body proximity — check local regulations."
3. Keep a small lookup table of these rules — expand it if you have time, but even 5–6 solid rules look far more credible than a vague AI paragraph.
4. Always end with the disclaimer: "This is a preliminary check only — final regulatory clearance rests with the concerned authority."

**What makes it accurate:** By keeping this 100% rule-based (if X then flag Y), there's no hallucination risk — you can show the judge the exact rule that triggered any flag.

---

# STAGE 3: UNDERSTANDING THE LOCAL MARKET

## M3 — Local Demand & Competition Module

**What it does:** Figures out what businesses already exist nearby, how many, and what that tells you about demand and competition.

**Inputs:** Location from M0, site data from M1
**Outputs:** List of nearby businesses by category with counts, e.g., "8 grocery stores, 6 restaurants, 4 dairy retailers within 5km"

**How to build it:**
1. Use **Google Places API** `nearbySearch` again, this time filtered by business type keywords (grocery, restaurant, dairy, etc.) relevant to the user's proposed sector or a general sweep.
2. Count and categorize results — this gives you real competitor density numbers, not estimates.
3. Cross-reference with per-capita spending indicators from NSSO consumption survey data (public dataset) to estimate purchasing power in that block/district.
4. Store this as structured counts + a purchasing power indicator per category.

**What makes it accurate:** Every count is a real number pulled from a live API call at the time of the query — this is the most "real-data-driven" part of your entire system, and worth emphasizing hard in your demo.

---

## M4 — Market Gap Analysis Module

**What it does:** Looks at the business counts from M3 and spots what's *missing* — the classic example: lots of grocery stores, zero packaged food producers.

**Inputs:** M3's business count data
**Outputs:** A ranked list of underserved niches, e.g., "Local packaged-food production — high potential gap"

**How to build it:**
1. Build a simple comparison logic: for a basket of common rural business categories, compare the local count against a "typical expected count" for a settlement of that population size (you can derive rough expected ratios from broader district-level averages).
2. Categories with counts significantly below expected ratio = flagged as gaps.
3. This is where you can layer in an LLM — feed it the structured gap data and ask it to explain *why* this gap matters and what opportunity it represents, in plain language. The LLM explains; your code decides what the gap actually is.

**What makes it accurate:** The gap detection itself is numeric/rule-based (a ratio comparison), so it's reproducible — the LLM only adds narrative on top of a number you already trust.

---

## M5 — Business Opportunity Generation Module

**What it does:** Takes everything so far (site quality, market gaps, competition) and produces a ranked shortlist of business ideas suited to this specific land and entrepreneur.

**Inputs:** M1 (site), M2 (regulatory flags), M3 (competition), M4 (gaps)
**Outputs:** A scored list like:
```
Food Processing — 91/100
Dairy — 87/100
Retail — 76/100
Poultry — 72/100
```

**How to build it:**
1. Define a fixed weighted scoring formula upfront — e.g.:
   `Overall Score = 0.25×Site Suitability + 0.25×Market Gap + 0.20×Financial Feasibility(placeholder until M6) + 0.15×(100−Competition Density) + 0.15×Government Support Potential`
2. Feed in the numeric outputs from M1–M4 for each candidate business category.
3. Generate the initial candidate list either from the user's own business preference (if given in M0) or from a fixed list of common rural business categories cross-checked against the gaps found in M4.
4. Rank by the final weighted score.

**What makes it accurate:** Because the formula and its weights are fixed and disclosed, this ranking is fully explainable — you can show the judge exactly why Food Processing scored 91 and Poultry scored 72, using real sub-numbers.

---

# STAGE 4: THE MONEY SIDE (Must be 100% Accurate — No AI Here)

## M6 — Financial Feasibility Calculator

**What it does:** For each shortlisted business, estimates how much it'll cost to start and run, and what it might earn.

**Inputs:** M0 (user's capital), M5 (shortlisted businesses)
**Outputs:** Investment breakdown per business — infrastructure cost, equipment cost, working capital, expected revenue, estimated break-even period

**How to build it:**
1. Build a **cost template per business category** — e.g., a small dairy unit typically needs X for cattle/equipment, Y for working capital, etc. Source these ranges from published MSME project cost reports (NABARD publishes model project reports for rural businesses — genuinely useful reference data).
2. Scale the template proportionally to the user's available capital/project cost from M7.
3. Revenue/break-even is calculated using simple formulas: `Break-even period = Fixed Costs / (Revenue per unit − Variable Cost per unit)`.

**What makes it accurate:** Use real NABARD/MSME model project report figures as your cost baseline instead of inventing numbers — this alone makes your financial section far more credible than a typical hackathon project.

---

## M7 — Loan & Scheme Router

**What it does:** This is the exact SIH-mandated calculator. Given the user's capital, it works out the total project cost, loan amount, and which government scheme applies.

**Inputs:** M0 (capital)
**Outputs:** Project Cost, Loan Amount, Selected Scheme

**How to build it (this is pure code, write it exactly like this):**
```python
def calculate_loan(capital):
    project_cost = capital / 0.10
    loan_amount = project_cost * 0.90

    if project_cost <= 140000:
        scheme = "Micro Finance Scheme"
        interest_rate = 6.5
        tenure_years = 3
        moratorium_months = 3
        max_loan = 125000
    elif project_cost <= 5000000:
        scheme = "Term Loan Scheme"
        interest_rate = 8.0
        tenure_years = 7
        moratorium_months = 6
        max_loan = 4500000
    else:
        scheme = "Outside standard scheme range — needs manual review"

    return {
        "project_cost": project_cost,
        "loan_amount": min(loan_amount, max_loan),
        "scheme": scheme,
        "interest_rate": interest_rate,
        "tenure_years": tenure_years,
        "moratorium_months": moratorium_months
    }
```
**What makes it accurate:** Zero AI involvement. This is testable — run it against every example in the official SIH document and confirm outputs match exactly.

---

## M8 — EMI & Repayment Generator

**What it does:** Once the loan amount, interest rate, and tenure are known, this works out the actual monthly/quarterly payment schedule, accounting for the moratorium (grace period).

**Inputs:** M7's output
**Outputs:** A full repayment table — quarter by quarter, how much principal and interest is paid

**How to build it:**
1. Use the standard reducing-balance EMI formula: `EMI = P × r × (1+r)^n / ((1+r)^n − 1)` where P = loan amount, r = quarterly interest rate, n = number of quarters.
2. Skip repayment during the moratorium period (interest may still accrue — decide and clearly state your assumption).
3. Generate a table: Quarter | Opening Balance | Interest | Principal | Closing Balance.
4. Display this as a simple line chart or table in the UI.

**What makes it accurate:** This is a globally standard financial formula — test it against a free online EMI calculator with the same inputs to confirm your numbers match exactly before the demo.

---

## M9 — Government Scheme Matching Module

**What it does:** Beyond the core loan, checks if the entrepreneur's profile matches any additional government schemes or subsidies (state-specific or sector-specific).

**Inputs:** M5 (business type), M7 (project cost)
**Outputs:** A short list of potentially relevant schemes with a short description each

**How to build it:**
1. Since hitting myScheme live isn't practical for a hackathon, manually build a small structured dataset (a JSON/CSV file) of 10–15 real, well-known schemes relevant to rural micro-business (e.g., PMEGP, Stand-Up India, state dairy subsidy schemes) with their eligibility criteria.
2. Write simple matching logic: if business_category matches AND project_cost falls in scheme's range → show as a match.
3. Clearly separate this from your core M7 calculation — this module is "additional support you might explore," not guaranteed eligibility.

**What makes it accurate:** Because it's a curated, real dataset (not scraped or hallucinated), every scheme name and rule you show is genuine — just label clearly that this list isn't exhaustive.

---

# STAGE 5: RISK, TRUST, AND EXPLAINABILITY

## M10 — Risk & Break-Even Analysis Module

**What it does:** Pulls together all the risk signals across the pipeline (demand uncertainty, competition, repayment pressure) into one place, and estimates when the business would start breaking even.

**Inputs:** M3 (market risk), M6 (financials), M8 (loan burden)
**Outputs:** A risk summary list + break-even timeline

**How to build it:**
1. Break-even timeline comes directly from M6's formula — no new math needed here, just surfacing it.
2. For risk flags, use simple thresholds: e.g., if competitor count > threshold → "High competition risk"; if repayment-to-revenue ratio > 40% → "High repayment pressure."
3. Optionally pass these flags to an LLM to generate a short, readable paragraph summarizing the risk picture — again, the LLM narrates, the thresholds decide.

**What makes it accurate:** Every risk flag is triggered by a specific numeric threshold you can point to — nothing is a vague AI impression.

---

## M11 — Explainable Ranking Module

**What it does:** Shows *why* a business scored what it scored, breaking the overall number into its parts (the same weights used in M5).

**Inputs:** All sub-scores computed across M1, M3, M5, M9, M10
**Outputs:** A breakdown table, e.g.:
```
Food Processing — 91/100
Site Suitability: 94
Local Demand: 88
Competition: 82
Market Gap: 93
Financial Feasibility: 86
Government Support: 90
Risk: 80
```

**How to build it:**
1. This isn't a new calculation — it's a UI/display layer that exposes the intermediate sub-scores you already computed in M5, instead of hiding them.
2. Store every sub-score alongside the final score as you compute it in M5, so this module just reads and displays them.

**What makes it accurate:** By definition — you're not calculating anything new, just showing your work. This is your strongest, cheapest-to-build trust feature.

---

## M12 — Evidence / Confidence Scoring Module

**What it does:** Tags every number in the app as either "Verified" (real data/deterministic math) or "Estimated" (AI-inferred or projected), so the user always knows what to trust fully.

**Inputs:** Data source metadata from every module
**Outputs:** A confidence tag attached to each displayed number/statement

**How to build it:**
1. As you build each module, tag its output type in your data structure: `{"value": ..., "confidence": "high"}` for API/Census/formula-based data, `{"value": ..., "confidence": "low"}` for AI-projected figures like future revenue.
2. In the UI, show a small colored badge (green = verified, amber = estimated) next to each figure.

**What makes it accurate:** This doesn't make numbers more accurate — it makes the *system* more honest, which is what judges and real users actually need.

---

## M13 — What-If Comparison Module

**What it does:** Lets the user change an input (like capital) and instantly see how the recommendations and finances change.

**Inputs:** Modified value from M0 (e.g., new capital amount)
**Outputs:** Re-run results from M6–M11 side-by-side with the original

**How to build it:**
1. This requires no new logic — just re-invoke your M6→M11 pipeline functions with the new parameter and display both result sets side by side.
2. Build this as an interactive slider in the UI (e.g., drag capital from ₹1L to ₹10L) with results updating live — this is a great live-demo moment.

**What makes it accurate:** Since it's just re-running your already-tested deterministic formulas, accuracy is inherited from M6–M8.

---

# STAGE 6: TURNING THE DECISION INTO ACTION

## M14 — DPR (Detailed Project Report) Generator

**What it does:** Auto-fills a standard Detailed Project Report document using everything the system has already calculated.

**Inputs:** M5, M6, M7, M8, M9 outputs
**Outputs:** A downloadable draft document (PDF/Word)

**How to build it:**
1. Create a DPR template (Word/PDF) with placeholder fields matching standard DPR structure (used by NABARD/banks): business overview, cost breakdown, financing plan, revenue projection, risk analysis.
2. Populate the template programmatically using a library (python-docx or a PDF-filling library) with your calculated values.
3. Add an AI-generated narrative section (business overview, market rationale) using the structured data as the prompt input — again, AI only writes prose around numbers you already trust.

**What makes it accurate:** Numbers are pulled directly from M6–M9's verified outputs, not regenerated by AI — the AI only writes surrounding sentences.

---

## M15 — Loan Application Draft Generator

**What it does:** Pre-fills a loan application form with the entrepreneur's details and the selected project's financials.

**Inputs:** M0, M7, M8
**Outputs:** A filled draft application (PDF/form)

**How to build it:** Same template-filling approach as M14, but using a standard loan application format. No AI narrative needed here — pure field-filling from verified data.

---

## M16 — Udyam Registration Draft Generator

**What it does:** Prepares the information needed for MSME/Udyam registration in advance, so the user isn't filling it from scratch.

**Inputs:** M0, M5
**Outputs:** A pre-filled Udyam registration data draft

**How to build it:** Map your existing user profile + business selection fields directly onto Udyam's known required fields (business name, category, investment, location, Aadhaar-linked details — flagged for user to fill manually since this is sensitive).

---

## M17 — Document Checklist & Gap Detector

**What it does:** Tells the user exactly what documents they still need before applying.

**Inputs:** M14, M15, M16 (what's been filled)
**Outputs:** A checklist — e.g., "✅ Business plan generated · ❌ Aadhaar copy needed · ❌ Land ownership proof needed"

**How to build it:** Maintain a static checklist per business/loan type (a simple lookup list of typically required documents), and mark items as filled/missing based on what data M0–M16 already has versus what's still blank.

---

## M18 — Step-by-Step Application Assistant

**What it does:** Walks the user through what to do next, one step at a time, in simple language.

**Inputs:** M17's checklist
**Outputs:** A guided sequence of instructions

**How to build it:** Build this as a simple conversational flow — each step reads from the checklist and tells the user what's next, ideally paired with the voice module (M19) for spoken guidance.

---

## M19 — Multilingual Voice Interface Module *(FUTURE ROADMAP — NOT IN CURRENT BUILD)*

**Status:** Deprioritized for the current implementation phase. Kept in the architecture as a planned future layer to show scalability thinking, but not being built or demoed right now. Text-based multilingual input (typed, not spoken) can still be supported via the LLM's language understanding if needed, without the speech-to-text/text-to-speech complexity.

**What it would do (for future reference):** Let the user speak instead of type, in their own language, at any point in the app — speech-to-text → language detection → multilingual LLM understanding → routed into M0's structured fields → spoken response via text-to-speech, with text fallback on low confidence.

---

## M21 — Ground-Truth Confidence Checklist Module

**What it does:** Once the user selects a specific business idea from the ranked list (M5/M11), this module generates a personalized checklist of real-world verification steps the user can do themselves — both physically on-site and virtually online — before committing money. This turns the system's estimates into something the user has personally double-checked, closing the trust gap between "AI told me" and "I confirmed it myself."

**Inputs:** M5 (selected business), M1 (site data), M3 (market data), M9 (matched schemes)
**Outputs:** An interactive checklist with checkboxes, grouped into two categories, that the user ticks off at their own pace

**How to build it:**
1. Build a rule-based checklist generator — for each business category, maintain a template of verification tasks (a lookup table, not AI-generated, so it's consistent and testable).
2. **Practical / on-ground checks** (physical, done in person):
   - Visit the proposed location at 2–3 different times of day and note actual footfall
   - Talk to at least 3–5 nearby shopkeepers or residents about whether this business is needed
   - Visit the nearest 2–3 competing businesses (if any) and observe their customer flow and pricing
   - Check physical land documents / ownership papers match what was entered in M0
   - Confirm road/transport access in person (not just via map data)
3. **Virtual / browser checks** (done online, from home):
   - Search the business category + local area name on Google/JustDial/IndiaMart to see if similar businesses are listed and how they're rated
   - Check supplier/raw-material availability and pricing online for the chosen business
   - Search the matched government scheme name (from M9) on its official portal to confirm current eligibility rules haven't changed
   - Look up the specific NIC business activity code needed for Udyam registration to confirm it matches the chosen business
   - Search recent local news/state government announcements for the sector (e.g., new subsidy, market development) that might affect the decision
4. Present this as a simple checklist UI — each item has a checkbox; once all (or most) items are checked, show a "Ground-Truth Verified ✅" badge on that business option, separate from the AI/data confidence score in M12.
5. This checklist output can also feed back into M12 — once a user marks physical verification as done, that specific business's demand confidence tag can be manually upgraded by the user themselves, with a note like "User-verified on [date]" rather than the system claiming it independently.

**What makes it accurate:** This module doesn't compute anything — it deliberately hands verification back to the human, which is the most honest way to close the gap between AI-estimated demand and real, current, on-the-ground truth. It also directly demonstrates to judges that the system knows the limits of its own data and designs the human into the loop rather than pretending to be fully autonomous.

---

## M20 — Decision Orchestration Engine

**What it does:** The invisible backbone that runs all modules in the right order and passes data between them.

**Inputs/Outputs:** Everything — it's the controller, not a feature.

**How to build it:**
1. Build this as a backend pipeline/workflow (a simple Python orchestration script, or a proper workflow tool if you want to look polished) that calls M1→M19 in sequence, passing each module's output as the next one's input.
2. Keep it modular — each module should be a clean function/service with defined input/output, so you can build and test them independently before wiring them together.
3. This is also where you enforce the Verified vs Advisory separation — the orchestrator should track which modules returned deterministic vs AI-assisted data and pass that tag through to M12.

---

# Where Key Data Actually Comes From (Real Sources, Not Guesses)

| Need | Real Source | Notes |
|---|---|---|
| Loan application form structure | NBCFDC / NSFDC / NSTFDC / state Channelizing Agency websites | Download real published loan application PDFs; replicate field structure once as a static template |
| Udyam registration fields | `udyamregistration.gov.in` | Publicly lists exact required fields (Aadhaar, PAN, business name, category, investment, turnover, NIC code) |
| Loan interest rate / tenure / moratorium rules | Scheme guideline documents published by NBCFDC/NSFDC/NSTFDC, cross-checked against RBI priority-sector-lending circulars | These are the umbrella rules the SIH brief's numbers are drawn from — cite the specific corporation's guideline as your source |
| Government schemes list (M9) | myScheme public scheme data, curated manually into a static dataset | Not live-queried for the hackathon build — a small accurate dataset beats an unreliable live scrape |
| NIC business activity codes | Ministry of Statistics NIC code directory (public) | Needed to match business category to Udyam's required classification |

---

# Fixing the Demand Accuracy Problem (Census 2011 Is Too Old on Its Own)

Census 2011 data is now over a decade old and should **never be used alone** as a live demand signal. Correct approach:

1. **Use Census only as a population baseline**, not as current demand truth.
2. **Growth-adjust it:** apply the relevant state's published decadal population growth rate to project a current estimate rather than using the raw 2011 number as-is.
3. **Cross-check against more current, real proxies:**
   - **Google Places API popularity/busy-times data** — a genuinely live footfall signal, not a static count
   - **TRAI district-wise mobile/internet subscriber density** — a modern, frequently updated economic-activity proxy
   - **Satellite night-time light intensity** (free VIIRS satellite data) — a well-established real-world proxy for local economic activity, and a strong technical differentiator if you have time to integrate it
   - **PLFS (Periodic Labour Force Survey)** and **state Economic Survey data** — both far more recent than Census, with sector-level employment/activity detail at district level
4. **If sources disagree sharply** (e.g., Census-projected population suggests high demand but night-light/mobile data suggests low activity), flag it explicitly as "data conflict — low confidence" in M12, rather than silently trusting one source.
5. **Label every Census-derived number clearly** in the UI as "baseline population (2011 Census, growth-adjusted)" — this is honest, and it reads as more credible to a judge than presenting stale data as current fact.
6. **M21 closes the final gap** — since no dataset is ever perfectly current, the Ground-Truth Confidence Checklist lets the actual user verify real, present-day demand on the ground before committing money, which is the most reliable "current status" check any system can offer.

---

# Build Priority (If Time Is Limited)

If you can't build all modules fully working, build in this order — this gives you a working, demoable, honest core:

1. **M0 → M7 → M8** (input + loan calculator + EMI) — this alone proves the SIH baseline requirement works and is 100% accurate.
2. **M1 + M3** using real Google Places/Census API calls (growth-adjusted, per above) — proves you're using real, current-as-possible data.
3. **M5 + M11 + M12** (ranking + explainability + confidence tags) — this is your differentiation and trust story.
4. **M21** (Ground-Truth Confidence Checklist) — cheap to build (it's a static checklist + checkboxes), but very high trust payoff and directly answers the "how do you know it's really true" question.
5. **M13** (what-if slider) — cheap, high-impact live demo feature.
6. **M14** (one DPR PDF, even simplified) — gives judges something tangible to hold.
7. Everything else (M2, M4, M9, M15–M18) can be shown as a working prototype for 1–2 and a designed/mocked roadmap slide for the rest — be upfront about this rather than faking it. M19 (voice) is explicitly roadmap-only for this phase.

---

*End of implementation guide.*
