import json
import os

def load_schemes():
    filepath = os.path.join(os.path.dirname(__file__), '../../../../../data/schemes/core_loan_rules.json')
    with open(filepath, 'r') as f:
        return json.load(f)['schemes']

def route_loan_scheme(project_cost: float) -> dict:
    schemes = load_schemes()
    for scheme in schemes:
        min_cost = scheme.get('min_project_cost', 0)
        max_cost = scheme.get('max_project_cost', float('inf'))
        if min_cost <= project_cost <= max_cost:
            return scheme
    return None
