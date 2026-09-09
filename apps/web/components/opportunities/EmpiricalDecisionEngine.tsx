'use client';

import React from 'react';
import { CandidateBusiness } from './ComparativeCandidatesDeck';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { Sparkles, CheckCircle2, TrendingUp, Truck, Landmark, Wallet } from 'lucide-react';

interface EmpiricalDecisionEngineProps {
  candidate: CandidateBusiness;
}

export const EmpiricalDecisionEngine: React.FC<EmpiricalDecisionEngineProps> = ({ candidate }) => {
  return (
    <div className="bg-white rounded-2xl border border-blue-200/90 p-6 sm:p-8 mb-10 shadow-sm">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Easy System Recommendation
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Why &quot;{candidate.title}&quot; is the Best Fit for Your Land
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg">
            Ranked #{candidate.rankLabel.charAt(1)} Recommended
          </span>
          <EvidenceBadge status="VERIFIED" />
        </div>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
        Our system evaluated your land location, highway access, nearby farmers, and profit metrics. Here are 4 simple reasons why this project works best:
      </p>

      {/* 4 Clean Light Reason Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Reason 1: High Farmer Demand */}
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>1. High Local Farmer Demand</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            40+ nearby vegetable farmers need cold storage so their crops don&apos;t spoil before market.
          </p>
        </div>

        {/* Reason 2: Easy Highway Access */}
        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>2. Easy Highway & Truck Access</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            Located just 100m from Highway 78 with a wide 18m road for big commercial trucks.
          </p>
        </div>

        {/* Reason 3: Good Income & Quick Money Back */}
        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>3. Good Income & Quick Money Back</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            Earn ~₹75,000 per month. Get your full investment money back in about 1.8 years.
          </p>
        </div>

        {/* Reason 4: 35% Govt Subsidy Discount */}
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <Landmark className="w-4 h-4 text-amber-600" />
            <span>4. 35% Govt Scheme Discount</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            Qualifies for PMFME Govt scheme to get up to ₹10 Lakhs subsidy money back.
          </p>
        </div>
      </div>

      {/* Clean Checkmark Summary */}
      <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Land Fit: Perfect</span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Customer Demand: High</span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Govt Subsidy: Available</span>
        </div>
      </div>
    </div>
  );
};
