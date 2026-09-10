'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Landmark, MapPin, ArrowRight, Download, CheckCircle2 } from 'lucide-react';

export const PostDecisionSupportDeck: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-blue-200 shadow-lg p-6 lg:p-8 mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-bold uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Next Action Steps
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Post-Decision Next Action Options
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Select what you would like to do next with your finalized business plan.
          </p>
        </div>
      </div>

      {/* 3 Action Deck Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Option 1: Download DPR */}
        <div className="bg-gradient-to-b from-blue-50/80 to-white rounded-2xl border border-blue-200 p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="p-3 bg-blue-600 text-white rounded-xl w-fit mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-blue-950 text-base mb-1">
              1. Download NABARD Bank Report (DPR)
            </h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Download a complete bank-ready project report with all financial figures to show your local bank manager.
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                let onboardingData: any = null;
                let decisionData: any = null;
                let selectedCand: any = null;
                try {
                  const savedOnboarding = sessionStorage.getItem('land2biz_onboarding_data');
                  if (savedOnboarding) onboardingData = JSON.parse(savedOnboarding);
                  const savedDecision = sessionStorage.getItem('land2biz_decision_analysis');
                  if (savedDecision) decisionData = JSON.parse(savedDecision);
                  const savedCandidate = sessionStorage.getItem('land2biz_selected_candidate');
                  if (savedCandidate) selectedCand = JSON.parse(savedCandidate);
                } catch (e) {}

                // Use selected candidate, fall back to ranking[0] from decision analysis
                const top = selectedCand
                  ? (decisionData?.ranking?.find((r: any) => r.id === selectedCand.id || r.business === selectedCand.title) || decisionData?.ranking?.[0])
                  : decisionData?.ranking?.[0];
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
                    opportunity_id: selectedCand?.id || top?.id || 'OPP-2026-001',
                    opportunity_name: selectedCand?.title || top?.title || top?.business || 'Solar Powered Cold Storage (15MT)',
                    business_category: selectedCand?.category || top?.category || 'cold_storage',
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
                  a.download = `LAND2BIZ_NABARD_DPR_${district}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                } else {
                  alert('Unable to generate DPR PDF from backend server.');
                }
              } catch (err) {
                console.error('DPR download error:', err);
                alert('Backend service unavailable for DPR PDF download.');
              }
            }}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white text-xs font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Bank Report (PDF)</span>
          </button>
        </div>

        {/* Option 2: Apply Govt Subsidy */}
        <div className="bg-gradient-to-b from-amber-50/80 to-white rounded-2xl border border-amber-200 p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="p-3 bg-amber-600 text-white rounded-xl w-fit mb-3">
              <Landmark className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-amber-950 text-base mb-1">
              2. Apply for 35% Govt Subsidy
            </h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Prepare your application details for PMFME Govt scheme to get up to ₹10 Lakhs subsidy money back.
            </p>
          </div>

          <Link
            href="/finance"
            className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 text-white text-xs font-bold py-3 px-4 rounded-xl hover:bg-amber-700 transition-all shadow-sm"
          >
            <span>Apply for Subsidy</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Option 3: Ground Validation Check */}
        <div className="bg-gradient-to-b from-emerald-50/80 to-white rounded-2xl border border-emerald-200 p-5 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="p-3 bg-emerald-600 text-white rounded-xl w-fit mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-emerald-950 text-base mb-1">
              3. Proceed to Final Ground Check
            </h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Check land boundaries, soil quality, and receive your final project completion certificate.
            </p>
          </div>

          <Link
            href="/final"
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs font-bold py-3 px-4 rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
          >
            <span>Go to Final Ground Check</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
