'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, CheckCircle2, Wallet, MapPin, Users } from 'lucide-react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { fetchDecisionAnalysis, DecisionAnalysisResponse } from '@/lib/apiClient';
import { CandidateBusiness } from '@/components/opportunities/ComparativeCandidatesDeck';

interface Props {
  financeSkipped?: boolean;
  selectedCandidate?: CandidateBusiness | null;
}

export const NabardBusinessPlanCard: React.FC<Props> = ({ financeSkipped, selectedCandidate }) => {
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

  // Use selected candidate if available, otherwise find the matching one from ranking, then fall back to ranking[0]
  const matchFromRanking = selectedCandidate
    ? decision?.ranking?.find((r: any) => r.id === selectedCandidate.id || r.business === selectedCandidate.title)
    : null;
  const top = matchFromRanking || decision?.ranking?.[0];
  
  // Prefer selectedCandidate values over API ranking values for consistency
  const minCap = selectedCandidate?.capitalMin || top?.capital_min_inr || 1500000;
  const maxCap = selectedCandidate?.capitalMax || top?.capital_max_inr || 2500000;
  const monthlyNet = selectedCandidate?.monthlyNet || top?.monthly_net_inr || Math.round(minCap * 0.08);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 lg:p-8 mb-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Landmark className="w-3.5 h-3.5" /> AI Evaluated Business Plan
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Selected Business Plan & Location Fit Brief
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Calculated from district census data, ODOP priority produce, and bank loan norms.
          </p>
        </div>
        <EvidenceBadge status={top ? 'ESTIMATED' : 'DATA_UNAVAILABLE'} />
      </div>

      {!top ? (
        <p className="text-xs text-gray-500">Loading AI business plan from backend decision API…</p>
      ) : (
        <>
          <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-lg font-extrabold text-emerald-400 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                {selectedCandidate?.title || top.title || top.business}
              </h3>
              <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                Fit Score: {selectedCandidate?.overallScore || top.overall_score}/100
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">💰 Capital Range</span>
                <span className="text-sm font-extrabold text-emerald-400">₹{(minCap / 100000).toFixed(1)}L – ₹{(maxCap / 100000).toFixed(1)}L</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">💵 Typical Monthly Net</span>
                <span className="text-sm font-extrabold text-emerald-400">~₹{monthlyNet.toLocaleString('en-IN')} / mo</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">⏱️ Payback Period</span>
                <span className="text-sm font-extrabold text-blue-300">~{((selectedCandidate?.paybackMonths || top.payback_months_typical || 36) / 12).toFixed(1)} yrs</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">✨ Margin</span>
                <span className="text-sm font-extrabold text-amber-300">~{selectedCandidate?.marginPct || top.margin_pct_typical || 25}%</span>
              </div>
            </div>
          </div>

          {/* AI Location Fit & Customer Profile Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {top.why_this_location && top.why_this_location.length > 0 && (
              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" /> AI Location Fit Reasoning:
                </span>
                <ul className="text-blue-950 space-y-1 list-disc pl-4">
                  {top.why_this_location.map((why, i) => (
                    <li key={i}>{why}</li>
                  ))}
                </ul>
              </div>
            )}

            {top.target_customers && top.target_customers.length > 0 && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-2 text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" /> Target Customer Base:
                </span>
                <p className="text-emerald-950 font-medium">
                  {top.target_customers.join(' · ')}
                </p>
              </div>
            )}
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              {financeSkipped ? 'Finance step skipped — ' : ''}Confirm 2 local supplier equipment quotes and verify title deeds during M21 ground check before committing capital.
            </span>
          </div>
        </>
      )}
    </div>
  );
};
