'use client';

import React from 'react';
import { EligibilityProfile } from './SchemeEligibilityQuestionnaire';
import { Landmark, CheckCircle2, ArrowUpRight, Sparkles } from 'lucide-react';

interface GovernmentSchemesGridProps {
  userProfile?: EligibilityProfile;
}

export const GovernmentSchemesGrid: React.FC<GovernmentSchemesGridProps> = ({ userProfile }) => {
  const isWoman = userProfile ? userProfile.gender === 'female' : true;
  const isSpecialCategory = userProfile ? isWoman || userProfile.category !== 'general' : true;
  const isWomanOrScSt = userProfile ? isWoman || userProfile.category === 'sc_st' : true;

  const pmegpSubsidyRate = isSpecialCategory
    ? isWoman
      ? '35% Money Back (Women Special Category)'
      : '35% Money Back (Special Category)'
    : '25% Money Back (General Category)';

  const schemes = [
    {
      id: 'pmfme',
      name: 'PMFME Scheme',
      fullName: 'PM Formalisation of Micro Food Processing Enterprises',
      subsidyRate: '35% Money Back',
      maxLimit: 'Up to ₹10 Lakhs Grant',
      interestBenefit: '3% Interest Subvention (AIF Linked)',
      eligibilityStatus: 'Highly Eligible',
      simpleReason: 'Eligible for cold storage, grain mills, bio-fertilizers, and agri-processing units.',
    },
    {
      id: 'pmegp',
      name: 'PMEGP Scheme',
      fullName: 'Prime Minister Employment Generation Programme',
      subsidyRate: pmegpSubsidyRate,
      maxLimit: 'Up to ₹25 Lakhs Project Cost',
      interestBenefit: 'Rural Priority Sector Lending',
      eligibilityStatus: 'Highly Eligible',
      simpleReason: `Provides ${isSpecialCategory ? '35%' : '25%'} margin money subsidy for new rural ventures.`,
    },
    {
      id: 'aif',
      name: 'Agri Infrastructure Fund (AIF)',
      fullName: 'Agriculture Infrastructure Fund Scheme',
      subsidyRate: '3% Discount on Interest',
      maxLimit: 'Loans up to ₹2 Crores',
      interestBenefit: '7 Years Subvention Period',
      eligibilityStatus: 'Potentially Applicable',
      simpleReason: 'Reduces bank loan interest rate from 10.5% down to ~7.5% per year.',
    },
    {
      id: 'mudra_standup',
      name: isWomanOrScSt ? 'Stand-Up India Scheme' : 'MUDRA Bank Loan',
      fullName: isWomanOrScSt
        ? isWoman
          ? 'Stand-Up India Scheme for Women Entrepreneurs'
          : 'Stand-Up India Scheme for SC/ST'
        : 'Micro Units Development & Refinance Agency',
      subsidyRate: 'No Land Mortgage Needed',
      maxLimit: isWomanOrScSt ? '₹10 Lakhs to ₹1 Crore' : 'Up to ₹10 Lakhs',
      interestBenefit: 'Lowest Bank Base Rate',
      eligibilityStatus: isWomanOrScSt ? 'Unlocked Special Match' : 'Potentially Applicable',
      simpleReason: isWomanOrScSt
        ? isWoman
          ? 'Unlocked specially for Women Entrepreneurs to get bank loans up to ₹1 Crore without collateral.'
          : 'Unlocked for SC/ST entrepreneurs to get bank loans up to ₹1 Crore without collateral.'
        : 'Provides bank credit guarantee so you don’t need to mortgage extra property.',
    },
  ];

  return (
    <div className="space-y-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-1">
            <Landmark className="w-3.5 h-3.5" /> Government Money Back Schemes
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Government Schemes That Help Pay For Your Business
          </h2>
        </div>
        <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
          {isWoman
            ? '👩‍💼 Women 35% Max Subsidy Match'
            : isSpecialCategory
            ? '35% Special Category Subsidy'
            : '25% General Subsidy Match'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {scheme.name}
                </span>

                <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {scheme.eligibilityStatus}
                </span>
              </div>

              <h3 className="font-extrabold text-gray-900 text-base mb-1">{scheme.fullName}</h3>
              <p className="text-xs text-gray-600 mb-4">{scheme.simpleReason}</p>

              {/* Metric Highlights */}
              <div className="space-y-2 py-3 border-y border-gray-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subsidy Discount:</span>
                  <span className="font-bold text-emerald-700">{scheme.subsidyRate}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Maximum Money Back:</span>
                  <span className="font-bold text-gray-900">{scheme.maxLimit}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Interest Subvention:</span>
                  <span className="font-bold text-blue-700">{scheme.interestBenefit}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs font-bold text-blue-700">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Available via Partner Banks</span>
              </span>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
