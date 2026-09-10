import json
import os
from functools import lru_cache

def find_repo_root(start: str) -> str:
    cur = os.path.abspath(start)
    while True:
        if os.path.isdir(os.path.join(cur, "data", "schemes")):
            return cur
        parent = os.path.dirname(cur)
        if parent == cur:
            raise FileNotFoundError("LAND2BIZ data/ directory not found")
        cur = parent

REPO_ROOT = os.environ.get("LAND2BIZ_ROOT") or find_repo_root(os.path.dirname(__file__))
DATA_DIR = os.path.join(REPO_ROOT, "data")

def _load(rel: str):
    path = os.path.join(DATA_DIR, rel)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@lru_cache(maxsize=None)
def core_loan_rules():
    return _load(os.path.join("schemes", "core_loan_rules.json"))

@lru_cache(maxsize=None)
def support_schemes():
    return _load(os.path.join("schemes", "support_schemes.json"))

@lru_cache(maxsize=None)
def cost_templates():
    return _load(os.path.join("business-templates", "msme_cost_templates.json"))

@lru_cache(maxsize=None)
def regulatory_rules():
    return _load(os.path.join("regulatory-rules", "screening_rules.json"))

@lru_cache(maxsize=None)
def nic_codes():
    return _load(os.path.join("seed", "nic_codes.json"))

@lru_cache(maxsize=None)
def ground_truth_checklists():
    return _load(os.path.join("seed", "ground_truth_checklists.json"))

@lru_cache(maxsize=None)
def tamilnadu_districts():
    return _load(os.path.join("tamilnadu", "districts.json"))

@lru_cache(maxsize=None)
def tamilnadu_odop():
    return _load(os.path.join("tamilnadu", "odop_products.json"))

@lru_cache(maxsize=None)
def source_registry():
    return _load("source_registry.json")
