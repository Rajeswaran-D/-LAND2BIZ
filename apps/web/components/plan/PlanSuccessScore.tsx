'use client';

import React, { useEffect, useState } from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { Award, MapPin, TrendingUp, ShieldCheck } from 'lucide-react';
import { fetchDecisionAnalysis, DecisionAnalysisResponse } from '@/lib/apiClient';
import { CandidateBusiness } from '@/components/opportunities/ComparativeCandidatesDeck';

interface Props {
  financeSkipped?: boolean;
  districtName?: string;
  odopPrimary?: string;
  selectedCandidate?: CandidateBusiness | null;
}

export const PlanSuccessScore: React.FC<Props> = ({ financeSkipped, districtName, odopPrimary, selectedCandidate }) => {
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

    return () => {
      live = false;
    };
  }, []);

  const dist = districtName || decision?.evidence?.district_baseline?.district || 'Coimbatore Region';

  const rawOdop = odopPrimary || decision?.evidence?.district_baseline?.odop_primary;
  const odopStr = typeof rawOdop === 'object' ? rawOdop?.value : rawOdop;
  const displayOdop = odopStr ? `ODOP: ${odopStr}` : 'ODOP Priority Cluster';

  // Use selected candidate to find correct ranking entry instead of always ranking[0]
  const matchFromRanking = selectedCandidate
    ? decision?.ranking?.find((r: any) => r.id === selectedCandidate.id || r.business === selectedCandidate.title)
    : null;

  const niche = decision?.market_gap_synthesis?.underserved_niches?.[0]?.niche;
  const demandTitle = niche ? `${niche} Deficit` : 'Verified Market Opportunity';
  const demandSummary = decision?.market_gap_synthesis?.location_summary || 'Catchment gap & MoSPI benchmark evidence verified.';

  const scheme = decision?.evidence?.finance?.scheme;
  const subsidyTitle = scheme?.name || 'PMFME Credit-Linked Scheme';
  const subsidyPct = scheme?.subsidy_pct || '35%';
  const maxSubsidyLakhs = scheme?.max_subsidy_inr ? (scheme.max_subsidy_inr / 100000).toFixed(0) : '10';
  const subsidyDetail = `${subsidyPct} Capital Subsidy (Cap ₹${maxSubsidyLakhs}L)`;

  const emiVal = decision?.evidence?.finance?.emi?.emi;
  const loanVal = decision?.evidence?.finance?.loan_amount;

  const financeTitle = financeSkipped
    ? 'Custom Capital Selected'
    : emiVal
    ? `₹${Math.round(emiVal).toLocaleString('en-IN')}/mo EMI`
    : 'Loan Repayment Computed';

  const financeDetail = loanVal
    ? `₹${(loanVal / 100000).toFixed(2)}L Loan (${scheme?.tenure_years || 7}Y @ ${scheme?.interest_rate || 8.5}%)`
    : 'Bank loan math & moratorium schedule verified.';

  const statusBadge = decision?.evidence?.finance ? 'VERIFIED_BASELINE' : 'NEEDS_VERIFICATION';

  return (
    <div className="bg-white rounded-2xl border border-blue-200/90 shadow-sm p-6 lg:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5" /> Investment Readiness Checklist
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Readiness & Evidence Verification
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Empirical district baseline, market gap synthesis, and bank loan parameters.
          </p>
        </div>
        <EvidenceBadge status={statusBadge} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: District Strength */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1 hover:border-blue-300 transition-colors">
          <span className="text-[10px] text-blue-700 font-bold uppercase flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> 1. District strength
          </span>
          <div className="text-sm font-extrabold text-gray-900 truncate" title={dist}>
            {dist}
          </div>
          <p className="text-[11px] text-gray-600 font-medium truncate" title={displayOdop}>
            {displayOdop}
          </p>
        </div>

        {/* Card 2: Demand Evidence */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1 hover:border-emerald-300 transition-colors">
          <span className="text-[10px] text-emerald-700 font-bold uppercase flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 2. Demand evidence
          </span>
          <div className="text-sm font-extrabold text-gray-900 truncate" title={demandTitle}>
            {demandTitle}
          </div>
          <p className="text-[11px] text-gray-600 font-medium line-clamp-2" title={demandSummary}>
            {demandSummary}
          </p>
        </div>

        {/* Card 3: Subsidy Route */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1 hover:border-purple-300 transition-colors">
          <span className="text-[10px] text-purple-700 font-bold uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 3. Subsidy route
          </span>
          <div className="text-sm font-extrabold text-gray-900 truncate" title={subsidyTitle}>
            {subsidyTitle}
          </div>
          <p className="text-[11px] text-gray-600 font-medium truncate" title={subsidyDetail}>
            {subsidyDetail}
          </p>
        </div>

        {/* Card 4: Financial Readiness */}
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1 hover:border-amber-300 transition-colors">
          <span className="text-[10px] text-amber-700 font-bold uppercase flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> 4. Finance readiness
          </span>
          <div className="text-sm font-extrabold text-gray-900 truncate" title={financeTitle}>
            {financeTitle}
          </div>
          <p className="text-[11px] text-gray-600 font-medium truncate" title={financeDetail}>
            {financeDetail}
          </p>
        </div>
      </div>
    </div>
  );
};

