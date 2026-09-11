'use client';

import React, { useState, useEffect } from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { apiClient } from '@/lib/apiClient';
import { Wallet, Calculator, Gift, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';

interface DynamicFinanceCalculatorProps {
  initialCapital: number;
  selectedCandidate?: any;
}

export const DynamicFinanceCalculator: React.FC<DynamicFinanceCalculatorProps> = ({
  initialCapital,
  selectedCandidate,
}) => {
  const [capital, setCapital] = useState<number>(initialCapital > 0 ? initialCapital : 150000);

  const [backendData, setBackendData] = useState<{
    project_cost?: number;
    loan_amount?: number;
    emi?: number;
    scheme?: any;
    moratorium_months?: number;
    total_interest?: number;
    total_payable?: number;
    out_of_range?: any;
    confidence?: string;
  } | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>('');

  // Extract selected business budget norms if available
  const businessTitle = selectedCandidate?.title || selectedCandidate?.business;
  const minCost = selectedCandidate?.capitalMin || selectedCandidate?.capital_min_inr || 1500000;
  const maxCost = selectedCandidate?.capitalMax || selectedCandidate?.capital_max_inr || 2500000;
  const typCost = (minCost + maxCost) / 2;
  const minMargin = Math.round(minCost * 0.10);
  const typMargin = Math.round(typCost * 0.10);
  const maxMargin = Math.round(maxCost * 0.10);

  useEffect(() => {
    if (initialCapital > 0) {
      setCapital(initialCapital);
    }
  }, [initialCapital]);

  useEffect(() => {
    let isMounted = true;
    const fetchFinance = async () => {
      if (capital <= 0) return;
      setIsLoadingApi(true);
      setApiError('');
      try {
        const data = await apiClient('/api/v1/finance/project-cost', {
          method: 'POST',
          body: JSON.stringify({ margin_capital: capital }),
        });
        if (isMounted && data) {
          setBackendData(data);
        }
      } catch (err: any) {
        if (isMounted) { setBackendData(null); setApiError(err?.message || 'Backend unreachable'); }
      } finally {
        if (isMounted) setIsLoadingApi(false);
      }
    };

    const timer = setTimeout(fetchFinance, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [capital]);

  const hasBackend = !!backendData && !apiError;
  const projectCost = backendData?.project_cost ?? 0;
  const loanAmount = backendData?.loan_amount ?? 0;
  const emi = backendData?.emi ?? 0;
  const scheme = backendData?.scheme;
  const ratePct = scheme?.interest_rate_percent ?? (scheme ? scheme.interest_rate * 100 : 0);
  const tenure = scheme?.tenure_years ?? 0;
  const mora = backendData?.moratorium_months ?? scheme?.moratorium_months ?? 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fmtL = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${Math.round(n / 1000)}k`);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 lg:p-8 mb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calculator className="w-3.5 h-3.5" /> Instant Money Calculator
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Easy Bank Loan & Monthly EMI Calculator
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Calculated automatically based on your actual capital and selected business budget. Move the slider to test different amounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isLoadingApi && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
          <EvidenceBadge status={hasBackend ? 'VERIFIED' : 'DATA_UNAVAILABLE'} />
        </div>
      </div>

      {/* Selected Business Choice Synced Budget Banner */}
      {businessTitle && (
        <div className="mb-6 p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-700/60 shadow-md space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-extrabold text-indigo-200 uppercase tracking-wider">Synced Business Choice:</span>
              <span className="text-sm font-black text-white">{businessTitle}</span>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-0.5 rounded-full">
              Evaluated Budget: {fmtL(minCost)} – {fmtL(maxCost)}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-300 font-medium">
              Preset budget targets for <strong>{businessTitle}</strong> (10% Margin Money):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCapital(minMargin)}
                className={`px-3 py-1 rounded-lg font-bold border transition-all ${
                  Math.abs(capital - minMargin) < 5000
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Min Budget ({fmtL(minMargin)})
              </button>
              <button
                type="button"
                onClick={() => setCapital(typMargin)}
                className={`px-3 py-1 rounded-lg font-bold border transition-all ${
                  Math.abs(capital - typMargin) < 5000
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Typical Budget ({fmtL(typMargin)})
              </button>
              <button
                type="button"
                onClick={() => setCapital(maxMargin)}
                className={`px-3 py-1 rounded-lg font-bold border transition-all ${
                  Math.abs(capital - maxMargin) < 5000
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Max Budget ({fmtL(maxMargin)})
              </button>
            </div>
          </div>
        </div>
      )}

      {apiError && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold">
          Backend unreachable ({apiError}). No invented EMI is shown — start the FastAPI server to compute from data/schemes/core_loan_rules.json.
        </div>
      )}
      {backendData?.out_of_range && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs font-semibold">
          {backendData.out_of_range.message} — {backendData.out_of_range.action}
        </div>
      )}

      {/* Interactive Capital Slider */}
      <div className="p-6 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-100 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-extrabold text-blue-950 uppercase tracking-wider flex items-center gap-2">
            <Wallet className="w-4 h-4 text-blue-600" />
            Adjust Your Available Money (Capital):
          </label>
          <div className="flex items-center gap-1 text-xl font-black text-blue-900 bg-white px-4 py-1.5 rounded-xl border border-blue-200 shadow-sm">
            <span>₹</span>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(Math.max(10000, Number(e.target.value)))}
              className="w-36 font-black text-blue-900 outline-none bg-transparent"
            />
          </div>
        </div>

        <input
          type="range"
          min="25000"
          max="1000000"
          step="25000"
          value={capital}
          onChange={(e) => setCapital(Number(e.target.value))}
          className="w-full h-2.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        <div className="flex justify-between text-[11px] font-bold text-blue-700">
          <span>₹25,000</span>
          <span>₹2.5 Lakhs</span>
          <span>₹5.0 Lakhs</span>
          <span>₹10.0 Lakhs</span>
        </div>
      </div>

      {/* 4 Clean Result Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Total Project Cost
          </span>
          <div className="text-xl font-black text-white">{formatCurrency(projectCost)}</div>
          <span className="text-[10px] text-slate-400 block">Based on 10% owner money</span>
        </div>

        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
          <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">
            Your Available Money
          </span>
          <div className="text-xl font-black text-blue-900">{formatCurrency(capital)}</div>
          <span className="text-[10px] text-blue-700 block">10% Margin Money Contribution</span>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
            Bank Loan Needed
          </span>
          <div className="text-xl font-black text-amber-900">{formatCurrency(loanAmount)}</div>
          <span className="text-[10px] text-amber-800 block">90% Funded by Partner Bank</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
            Monthly Loan EMI
          </span>
          <div className="text-xl font-black text-emerald-900">{hasBackend ? `${formatCurrency(emi)} / mo` : '—'}</div>
          <span className="text-[10px] text-emerald-800 block">
            {scheme ? `${scheme.name} · ${ratePct}% · ${tenure}y · ${mora}m moratorium` : 'Routed from backend scheme data'}
          </span>
        </div>
      </div>

      {hasBackend && backendData?.total_interest !== undefined && (
        <p className="text-[11px] text-gray-500 mb-6">Total interest {formatCurrency(backendData.total_interest)} · Total payable {formatCurrency(backendData.total_payable || 0)} · Interest accrues during moratorium, EMI on accrued balance.</p>
      )}

      {/* Scheme-subsidy note: matched amounts come from /api/v1/schemes/match, never hardcoded here */}
      <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-900 uppercase block">
              Subsidy eligibility
            </span>
            <span className="text-base font-extrabold text-emerald-950">
              Matched after scheme check — see scheme cards below
            </span>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-white px-3.5 py-1.5 rounded-xl border border-emerald-200 shadow-sm self-start sm:self-auto">
          Verified slabs · bank-adjusted
        </span>
      </div>
    </div>
  );
};
