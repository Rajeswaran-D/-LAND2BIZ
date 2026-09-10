'use client';

import React, { useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Sliders, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

export const WhatIfScenarioSimulator: React.FC = () => {
  const [scenarioCapital, setScenarioCapital] = useState<number>(200000);
  const [riskPreference, setRiskPreference] = useState<string>('Medium Risk');
  const [resultData, setResultData] = useState<{
    scenario_cost?: number;
    scenario_loan?: number;
    confidence?: string;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const handleRecalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);

    try {
      const data = await apiClient('/api/v1/what-if', {
        method: 'POST',
        body: JSON.stringify({ margin_capital: scenarioCapital }),
      });
      if (data) {
        setResultData(data);
      }
    } catch (err) {
      setResultData(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 lg:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5" /> Test Different Savings Amounts
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Try A Different Investment Amount
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Type your own savings amount to see how big a business you can build and how much bank loan you will need.
          </p>
        </div>

        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
          Instant Calculation
        </span>
      </div>

      <form onSubmit={handleRecalculate} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Capital Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Your Own Savings (₹)
            </label>
            <input
              type="number"
              min="50000"
              step="50000"
              value={scenarioCapital}
              onChange={(e) => setScenarioCapital(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Risk Preference */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Business Safety Preference
            </label>
            <select
              value={riskPreference}
              onChange={(e) => setRiskPreference(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="Low Risk">Safe & Low Risk (Steady Return)</option>
              <option value="Medium Risk">Medium Risk (Balanced Growth)</option>
              <option value="High Risk">High Risk (Maximum Profit)</option>
            </select>
          </div>

          {/* Recalculate Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isCalculating}
              className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Calculate New Numbers
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Recalculated Scenario Result Box */}
      {!resultData && !isCalculating && (
        <p className="mt-6 text-xs text-gray-500">Run the backend calculation to see SIH-baseline numbers. Nothing is shown until the backend responds.</p>
      )}
      {resultData && (
        <div className="mt-6 p-4 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-2 text-purple-900 font-bold">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>New Calculated Numbers:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-purple-950 font-semibold pt-1">
            <div>
              <span className="text-[10px] text-purple-700 uppercase block">Your Own Money:</span>
              <span className="text-sm font-extrabold">{formatCurrency(scenarioCapital)}</span>
            </div>

            <div>
              <span className="text-[10px] text-purple-700 uppercase block">Total Project Cost:</span>
              <span className="text-sm font-extrabold">
                {resultData.scenario_cost !== undefined ? formatCurrency(resultData.scenario_cost) : '—'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-purple-700 uppercase block">Bank Loan Needed:</span>
              <span className="text-sm font-extrabold">
                {resultData.scenario_loan !== undefined ? formatCurrency(resultData.scenario_loan) : '—'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
