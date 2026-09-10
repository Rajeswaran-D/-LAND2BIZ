'use client';

import React from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { Award, MapPin, TrendingUp, ShieldCheck } from 'lucide-react';

interface Props {
  financeSkipped?: boolean;
  districtName?: string;
  odopPrimary?: string;
}

export const PlanSuccessScore: React.FC<Props> = ({ financeSkipped, districtName, odopPrimary }) => {
  return (
    <div className="bg-white rounded-2xl border border-blue-200/90 shadow-sm p-6 lg:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-3.5 h-3.5" /> Readiness checklist
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Readiness Before You Invest
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            No invented score is shown. Complete finance + ground checks to proceed safely.
          </p>
        </div>
        <EvidenceBadge status="NEEDS_VERIFICATION" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
          <span className="text-[10px] text-blue-700 font-bold uppercase flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> 1. District strength
          </span>
          <div className="text-sm font-bold text-gray-900">{districtName || 'Enter district'}</div>
          <p className="text-[11px] text-gray-500">{odopPrimary ? `ODOP: ${odopPrimary}` : 'ODOP loads from backend list.'}</p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
          <span className="text-[10px] text-emerald-700 font-bold uppercase flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 2. Demand evidence
          </span>
          <div className="text-sm font-bold text-gray-900">Live OSM + ground checks</div>
          <p className="text-[11px] text-gray-500">Zero mapped ≠ zero existing. M21 checklist required.</p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
          <span className="text-[10px] text-purple-700 font-bold uppercase flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 3. Subsidy route
          </span>
          <div className="text-sm font-bold text-gray-900">PMFME / PMEGP / AIF</div>
          <p className="text-[11px] text-gray-500">Eligibility confirmed only by bank + portal.</p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-1">
          <span className="text-[10px] text-amber-700 font-bold uppercase flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> 4. Finance
          </span>
          <div className="text-sm font-bold text-gray-900">{financeSkipped ? 'Skipped by user' : 'Backend EMI used'}</div>
          <p className="text-[11px] text-gray-500">SIH baseline math, moratorium stated.</p>
        </div>
      </div>
    </div>
  );
};
