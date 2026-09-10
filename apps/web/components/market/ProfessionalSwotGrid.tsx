'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { fetchDecisionAnalysis, DecisionAnalysisResponse } from '@/lib/apiClient';

export const ProfessionalSwotGrid: React.FC = () => {
  const [decision, setDecision] = useState<DecisionAnalysisResponse | null>(null);

  useEffect(() => {
    let live = true;
    let onboardingData: any = null;
    try {
      const saved = sessionStorage.getItem('land2biz_onboarding_data');
      if (saved) onboardingData = JSON.parse(saved);
    } catch (e) {}

    fetchDecisionAnalysis(onboardingData).then((d) => {
      if (live && d) setDecision(d);
    });
    return () => { live = false; };
  }, []);

  const district = decision?.evidence?.district_baseline;
  const synthesis = decision?.market_gap_synthesis;
  const niches = synthesis?.underserved_niches || [];
  const topCandidate = decision?.ranking?.[0];

  return (
    <div className="space-y-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> AI Location SWOT Matrix
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Location SWOT & Verification Matrix
          </h2>
        </div>
        <span className="text-xs text-gray-500 font-medium">Relative to {district?.district || 'Selected District'}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. STRENGTHS */}
        <div className="bg-white rounded-2xl border border-emerald-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm border-b border-emerald-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>1. Location Strengths</span>
          </div>

          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2 p-2.5 bg-emerald-50/60 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-bold">District Produce Priority:</strong>
                <span className="text-gray-700">
                  {district?.district || 'District'} primary ODOP produce: <strong>{district?.odop_primary?.value || 'Agricultural Cluster'}</strong> ({district?.odop_sector || 'Horticulture/Engineering'}).
                </span>
              </div>
            </li>

            <li className="flex items-start gap-2 p-2.5 bg-emerald-50/60 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-bold">Population Catchment Scale:</strong>
                <span className="text-gray-700">
                  {district?.district || 'District'} Census baseline: {(district?.population_2011?.value / 100000).toFixed(1)}L residents ({district?.density_2011?.value} people/sq.km).
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* 2. CHALLENGES & FIXES */}
        <div className="bg-white rounded-2xl border border-amber-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm border-b border-amber-100 pb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>2. Challenges & Mitigations</span>
          </div>

          <ul className="space-y-2.5 text-xs">
            <li className="p-2.5 bg-amber-50/60 rounded-lg space-y-1">
              <strong className="text-gray-900 block font-bold">Unmapped Roadside Vendors:</strong>
              <span className="text-gray-700 block">
                {topCandidate?.unregistered_competition_notes || 'Google Maps omits local weekly shandy vendors; complete M21 ground check before capital outlay.'}
              </span>
            </li>

            <li className="p-2.5 bg-amber-50/60 rounded-lg space-y-1">
              <strong className="text-gray-900 block font-bold">Power Sanction & Load:</strong>
              <span className="inline-block text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                ⚡ Fix: Verify 3-Phase commercial DISCOM load before equipment purchase.
              </span>
            </li>
          </ul>
        </div>

        {/* 3. BIG OPPORTUNITIES */}
        <div className="bg-white rounded-2xl border border-blue-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-blue-800 font-extrabold text-sm border-b border-blue-100 pb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>3. Market Gap Opportunities</span>
          </div>

          <ul className="space-y-2.5 text-xs">
            {niches.length > 0 ? niches.slice(0, 2).map((n, i) => (
              <li key={i} className="flex items-start gap-2 p-2.5 bg-blue-50/60 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 block font-bold">{n.niche}:</strong>
                  <span className="text-gray-700">{n.signal}</span>
                </div>
              </li>
            )) : (
              <li className="flex items-start gap-2 p-2.5 bg-blue-50/60 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900 block font-bold">High Demand Sector:</strong>
                  <span className="text-gray-700">Cold-chain storage & agtech input depots.</span>
                </div>
              </li>
            )}
          </ul>
        </div>

        {/* 4. RISKS & REPAYMENT FIXES */}
        <div className="bg-white rounded-2xl border border-rose-200/90 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm border-b border-rose-100 pb-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>4. Financial & Repayment Safeguards</span>
          </div>

          <ul className="space-y-2.5 text-xs">
            <li className="p-2.5 bg-rose-50/60 rounded-lg space-y-1">
              <strong className="text-gray-900 block font-bold">Debt Service Coverage & Seasonality:</strong>
              <span className="inline-block text-[11px] font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded">
                🛡️ Fix: Apply for PMFME/PMEGP capital subsidy (up to 35%) to reduce debt service burden.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
