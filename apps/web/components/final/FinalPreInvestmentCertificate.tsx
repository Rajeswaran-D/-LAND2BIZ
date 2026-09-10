'use client';

import React from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { Award, CheckCircle2, Download, Landmark, Lock, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  businessTitle: string;
  isFullyVerified: boolean;
  verifiedCount: number;
}

export const FinalPreInvestmentCertificate: React.FC<Props> = ({
  businessTitle,
  isFullyVerified,
  verifiedCount,
}) => {
  return (
    <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 lg:p-10 shadow-2xl mb-12 border-4 border-emerald-600/40 relative overflow-hidden">
      <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
        <ShieldCheck className="w-80 h-80 text-blue-400" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Pre-investment readiness summary
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Ground-Check Readiness Summary
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            This is NOT a government approval. It records your ground checks + backend math for bank discussion.
          </p>
        </div>

        <div className="text-left sm:text-right bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
          <span className="text-[10px] text-slate-300 font-bold uppercase block">Ground checks</span>
          <span className="text-3xl font-black text-emerald-400">{verifiedCount} / 5</span>
          <span className="text-xs font-bold text-emerald-300 block mt-0.5">
            {isFullyVerified ? 'GROUND CHECKS COMPLETE' : `${verifiedCount}/5 Checks Done`}
          </span>
        </div>
      </div>

      <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 mb-8 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Your Selected Project
          </span>
          <EvidenceBadge status={isFullyVerified ? 'VERIFIED' : 'NEEDS_VERIFICATION'} />
        </div>

        <h3 className="text-2xl font-black text-white">{businessTitle}</h3>
        <p className="text-xs text-slate-300">Capital, profit and subsidy figures come from backend cost ranges + SIH loan math. Confirm with bank before investing.</p>
      </div>

      <div className="space-y-3 mb-8 text-xs text-slate-200">
        <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Before you invest, confirm:
        </h4>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <li className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
            <span><strong>Road/power/water:</strong> verified in person, not from map text.</span>
          </li>
          <li className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
            <span><strong>Demand:</strong> spoke to farmers/buyers; checked competitors.</span>
          </li>
          <li className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
            <span><strong>Subsidy:</strong> checked current portal circular + bank.</span>
          </li>
          <li className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
            <span><strong>Loan:</strong> EMI from backend schedule incl. moratorium.</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          onClick={async () => {
            try {
              let onboardingData: any = null;
              let decisionData: any = null;
              try {
                const savedOnboarding = sessionStorage.getItem('land2biz_onboarding_data');
                if (savedOnboarding) onboardingData = JSON.parse(savedOnboarding);
                const savedDecision = sessionStorage.getItem('land2biz_decision_analysis');
                if (savedDecision) decisionData = JSON.parse(savedDecision);
              } catch (e) {}

              const top = decisionData?.ranking?.[0];
              const district = onboardingData?.fullAddress?.district || decisionData?.evidence?.district_baseline?.district || 'Coimbatore';
              const capital = onboardingData?.capital || 150000;
              const cost = decisionData?.evidence?.finance?.project_cost || capital * 10;
              const loan = decisionData?.evidence?.finance?.loan_amount || cost * 0.9;
              const emi = decisionData?.evidence?.finance?.emi?.emi || 22867;
              const scheme = decisionData?.evidence?.finance?.scheme;

              const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
              const resp = await fetch(`${baseUrl}/api/v1/dpr/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  opportunity_id: top?.id || 'OPP-2026-001',
                  opportunity_name: businessTitle || top?.title || top?.business || 'Solar Powered Cold Storage (15MT)',
                  business_category: top?.category || 'cold_storage',
                  district: district,
                  land_type: onboardingData?.landType || 'agricultural',
                  capital: capital,
                  project_cost: cost,
                  loan_amount: loan,
                  interest_rate: scheme?.interest_rate || 8.5,
                  tenure_years: scheme?.tenure_years || 7,
                  moratorium_months: scheme?.moratorium_months || 6,
                  monthly_emi: emi,
                  payback_years: top?.payback_months_typical ? top.payback_months_typical / 12 : 3.5,
                  repayment_burden_ratio: 0.35,
                  odop_product: typeof decisionData?.evidence?.district_baseline?.odop_primary === 'object'
                    ? decisionData.evidence.district_baseline.odop_primary.value
                    : decisionData?.evidence?.district_baseline?.odop_primary || 'Local Cluster Product'
                })
              });

              if (resp.ok) {
                const blob = await resp.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `LAND2BIZ_Readiness_Summary_${district}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
              } else {
                alert('Unable to generate Readiness Summary PDF from backend server.');
              }
            } catch (err) {
              console.error('PDF download error:', err);
              alert('Backend service unavailable for PDF download.');
            }
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 text-slate-950 font-extrabold text-xs px-6 py-3.5 rounded-xl hover:bg-emerald-400 active:scale-[0.99] transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Readiness Summary (PDF)</span>
        </button>

        <a
          href="/finance"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 font-bold text-xs px-6 py-3.5 rounded-xl hover:bg-white/20 active:scale-[0.99] transition-all"
        >
          <Landmark className="w-4 h-4 text-amber-400" />
          <span>Check Bank Loan Math</span>
        </a>
      </div>
    </div>
  );
};
