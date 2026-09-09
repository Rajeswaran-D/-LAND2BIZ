'use client';

import React from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { Award, CheckCircle2, MapPin, TrendingUp, ShieldCheck } from 'lucide-react';

interface PlanSuccessScoreProps {
  financeSkipped?: boolean;
}

export const PlanSuccessScore: React.FC<PlanSuccessScoreProps> = ({ financeSkipped }) => {
  return (
    <div className="bg-white rounded-2xl border border-blue-200/90 shadow-sm p-6 lg:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5" /> Project Score
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Project Safety Score & Top Strengths
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Rating for Solar Cold Storage on your land.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">Success Score</span>
            <span className="text-2xl font-black text-emerald-900">88 / 100</span>
          </div>
          <EvidenceBadge status="VERIFIED" />
        </div>
      </div>

      {/* 4 Key Strengths Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
          <span className="text-[10px] text-blue-700 font-bold uppercase flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> 1. Great Location
          </span>
          <div className="text-sm font-bold text-gray-900">100m from Highway 78</div>
          <p className="text-[11px] text-gray-500">Wide 18m road for big trucks.</p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
          <span className="text-[10px] text-emerald-700 font-bold uppercase flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 2. High Customer Demand
          </span>
          <div className="text-sm font-bold text-gray-900">0 Cold Stores in 15km</div>
          <p className="text-[11px] text-gray-500">40+ local farmers need storage.</p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
          <span className="text-[10px] text-purple-700 font-bold uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 3. Govt Subsidy Match
          </span>
          <div className="text-sm font-bold text-gray-900">35% Money Back</div>
          <p className="text-[11px] text-gray-500">Qualifies for PMFME Govt scheme.</p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
          <span className="text-[10px] text-amber-700 font-bold uppercase flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> 4. Fast Money Back
          </span>
          <div className="text-sm font-bold text-gray-900">1.8 Years Payback</div>
          <p className="text-[11px] text-gray-500">
            {financeSkipped ? 'Financials: Skipped by user' : '26% profit return rate.'}
          </p>
        </div>
      </div>
    </div>
  );
};
