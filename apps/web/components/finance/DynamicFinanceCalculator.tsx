'use client';

import React, { useState, useEffect } from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { apiClient } from '@/lib/apiClient';
import { Wallet, Calculator, Gift, RefreshCw } from 'lucide-react';

interface DynamicFinanceCalculatorProps {
  initialCapital: number;
}

export const DynamicFinanceCalculator: React.FC<DynamicFinanceCalculatorProps> = ({
  initialCapital,
}) => {
  const [capital, setCapital] = useState<number>(initialCapital > 0 ? initialCapital : 150000);
  const [interestRate] = useState<number>(7.5);
  const [tenureYears] = useState<number>(7);

  const [backendData, setBackendData] = useState<{
    project_cost?: number;
    loan_amount?: number;
    emi?: number;
  } | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);

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
      try {
        const data = await apiClient('/api/v1/finance/project-cost', {
          method: 'POST',
          body: JSON.stringify({ margin_capital: capital }),
        });
        if (isMounted && data) {
          setBackendData(data);
        }
      } catch (err) {
        console.log('Using client-side financial calculation fallback');
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

  const projectCost = backendData?.project_cost || capital / 0.10;
  const loanAmount = backendData?.loan_amount || projectCost * 0.90;
  const govtSubsidy = Math.min(projectCost * 0.35, 1000000);

  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const computedEmi =
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : loanAmount / totalMonths;

  const emi = backendData?.emi && backendData.emi > 0 ? backendData.emi : Math.round(computedEmi);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
            Calculated automatically based on your actual capital. Move the slider to test different amounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isLoadingApi && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />}
          <EvidenceBadge status="VERIFIED" />
        </div>
      </div>

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
          min="50000"
          max="5000000"
          step="50000"
          value={capital}
          onChange={(e) => setCapital(Number(e.target.value))}
          className="w-full h-2.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        <div className="flex justify-between text-[11px] font-bold text-blue-700">
          <span>₹50,000</span>
          <span>₹10 Lakhs</span>
          <span>₹25 Lakhs</span>
          <span>₹50 Lakhs</span>
        </div>
      </div>

      {/* 4 Clean Result Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            🏗️ Total Project Cost
          </span>
          <div className="text-xl font-black text-white">{formatCurrency(projectCost)}</div>
          <span className="text-[10px] text-slate-400 block">Based on 10% owner money</span>
        </div>

        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
          <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">
            💰 Your Available Money
          </span>
          <div className="text-xl font-black text-blue-900">{formatCurrency(capital)}</div>
          <span className="text-[10px] text-blue-700 block">10% Margin Money Contribution</span>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
            🏦 Bank Loan Needed
          </span>
          <div className="text-xl font-black text-amber-900">{formatCurrency(loanAmount)}</div>
          <span className="text-[10px] text-amber-800 block">90% Funded by Partner Bank</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
            🗓️ Monthly Loan EMI
          </span>
          <div className="text-xl font-black text-emerald-900">{formatCurrency(emi)} / mo</div>
          <span className="text-[10px] text-emerald-800 block">
            {interestRate}% rate over {tenureYears} years
          </span>
        </div>
      </div>

      {/* Govt Subsidy Banner */}
      <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-900 uppercase block">
              Govt Subsidy Discount (PMFME Scheme)
            </span>
            <span className="text-base font-extrabold text-emerald-950">
              Estimated Subsidy Money Back: {formatCurrency(govtSubsidy)}
            </span>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-white px-3.5 py-1.5 rounded-xl border border-emerald-200 shadow-sm self-start sm:self-auto">
          35% Credit Subsidy
        </span>
      </div>
    </div>
  );
};
