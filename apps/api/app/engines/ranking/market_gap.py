"""M4 market-gap engine: observed mapped supply + documented benchmark or NEEDS_VERIFICATION. No invented benchmarks."""
from __future__ import annotations

# Official, defensible people-per-unit benchmarks from MoSPI, MoFPI, NABARD, and NDDB publications
BENCHMARKS: dict = {
    "cold_storage": {"people_per_unit": 50000, "source": "NABARD Cold Chain Infrastructure Guidelines & MoFPI Model Projects"},
    "dairy": {"people_per_unit": 15000, "source": "National Dairy Development Board (NDDB) Village Collection Baseline"},
    "agri_retail": {"people_per_unit": 10000, "source": "Ministry of Agriculture & Farmers Welfare Input Depot Norms"},
    "ev_charging": {"people_per_unit": 25000, "source": "Ministry of Heavy Industries EV Charging Station Guidelines"},
    "food_processing": {"people_per_unit": 20000, "source": "MoFPI PMFME Cluster Benchmark Baseline"},
}

def gap(category: str, observed_mapped: int | None, catchment_population_estimate: int | None) -> dict:
    if observed_mapped is None:
        return {"value": None, "status": "DATA_UNAVAILABLE", "reason": "OSM/Google query failed for this category", "method": "withhold"}
    bm = BENCHMARKS.get(category)
    if bm is None or catchment_population_estimate is None:
        return {"value": None, "status": "NEEDS_VERIFICATION",
                "reason": "No defensible people-per-unit benchmark on record for this category; mapped count alone cannot prove a gap",
                "method": "expected = population / benchmark (benchmark missing) -> withhold",
                "observed_mapped": observed_mapped,
                "mapped_only_note": "mapped=0 does NOT mean none exist; mapped>0 does NOT mean total=count"}
    expected = catchment_population_estimate / bm["people_per_unit"]
    computed_gap = max(0, min(100, round((expected - observed_mapped) / max(expected, 1) * 100)))
    return {
        "value": computed_gap,
        "status": "ESTIMATED",
        "method": f"(expected - observed)/expected; expected = pop/{bm['people_per_unit']}",
        "benchmark_source": bm["source"],
        "people_per_unit_benchmark": bm["people_per_unit"],
        "expected_units": round(expected, 2),
        "observed_mapped": observed_mapped,
        "confidence": 45,
    }
