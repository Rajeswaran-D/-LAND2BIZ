import pytest
import os
import sys

# Add app to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.engines.finance.project_cost import calculate_project_cost, calculate_loan_amount
from app.engines.loan.emi import calculate_emi
from app.engines.loan.router import route_loan_scheme

def test_project_cost():
    assert calculate_project_cost(14000) == pytest.approx(140000)
    
def test_loan_amount():
    # 90% of 140000 = 126000, capped at micro max_loan 125000 from data
    assert calculate_loan_amount(140000) == pytest.approx(125000)

def test_loan_amount_below_cap():
    assert calculate_loan_amount(100000) == pytest.approx(90000)

def test_scheme_routing_micro():
    scheme = route_loan_scheme(140000)
    assert scheme is not None
    assert scheme['id'] == 'micro_finance_01'

def test_scheme_routing_term():
    scheme = route_loan_scheme(500000)
    assert scheme is not None
    assert scheme['id'] == 'term_loan_01'

def test_emi_calculation():
    # Example: 100000 principal, 8% interest, 7 years, no moratorium
    emi = calculate_emi(100000, 0.08, 7)
    assert emi == 1558.62

def test_emi_moratorium_accrues():
    base = calculate_emi(100000, 0.08, 7, 0)
    with_mora = calculate_emi(100000, 0.08, 7, 6)
    assert with_mora > base

def test_out_of_range():
    from app.engines.loan.router import route_loan_scheme
    assert route_loan_scheme(6000000) is None
