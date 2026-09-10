'use client';

import React from 'react';
import { CandidateBusiness } from './ComparativeCandidatesDeck';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { Sparkles, CheckCircle2, TrendingUp, Truck, Landmark, Wallet } from 'lucide-react';

interface Props {
  candidate: CandidateBusiness;
}

export const EmpiricalDecisionEngine: React.FC<Props> = ({ candidate }) => {
  const fmtL = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${Math.round(n / 1000)}k`);
  return (
    <div className="bg-white rounded-2xl border border-blue-200/90 p-6 sm:p-8 mb-10 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Cost-range summary
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Why &quot;{candidate.title}&quot; could fit
          </h2>
        </div>
        <EvidenceBadge status="ESTIMATED" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
            <Wallet className="w-4 h-4 text-blue-600" />
            <span>Typical capital & return</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            {fmtL(candidate.capitalMin)}–{fmtL(candidate.capitalMax)} capital · ~₹{candidate.monthlyNet.toLocaleString('en-IN')}/mo typical net · ~{(candidate.paybackMonths / 12).toFixed(1)} yrs payback · ~{candidate.marginPct}% margin. Typical ranges, not promises.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>Utilities to confirm</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">{candidate.utilities}</p>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Equipment</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">{candidate.equipment.join(' · ')}</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <Landmark className="w-4 h-4 text-amber-600" />
            <span>Subsidy depends on category</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">PMFME 35% cap ₹10L applies to eligible food-processing activity; ACABC 36/44% needs agri-graduate status. Confirm on official portals.</p>
        </div>
      </div>

      <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap items-center gap-3 text-xs">
        <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Figures are TYPICAL RANGES — verify with 2 local quotes + M21 ground checks</span>
        </span>
      </div>
    </div>
  );
};
