'use client';

import React from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { ShieldAlert, Zap, CloudRain, FileCheck, CheckCircle2 } from 'lucide-react';

export const PlanKeyDangers: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 lg:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Simple Safety Check
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Key Dangers & Easy Solutions
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Things that could go wrong during operations and how we solve them easily.
          </p>
        </div>

        <EvidenceBadge status="NEEDS_VERIFICATION" />
      </div>

      {/* 3 Specific Key Danger Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Danger 1: Power Cuts */}
        <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>1. Electricity Power Cuts</span>
            </div>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Grid cuts stop cooling — confirm backup in supplier quote.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs">
            <strong className="text-emerald-800 font-extrabold block mb-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Easy Fix:
            </strong>
            <span className="text-gray-700">Solar + generator sizing from vendor, not assumed 15 kW.</span>
          </div>
        </div>

        {/* Danger 2: Off-Season Harvest */}
        <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm mb-2">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <span>2. Off-Season Crop Drop</span>
            </div>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Monsoon season produces fewer fresh vegetables for storage.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-blue-200 text-xs">
            <strong className="text-emerald-800 font-extrabold block mb-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Easy Fix:
            </strong>
            <span className="text-gray-700">Store multi-season items (onions, potatoes, seeds & dairy).</span>
          </div>
        </div>

        {/* Danger 3: Local Paperwork Delay */}
        <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-purple-900 font-bold text-sm mb-2">
              <FileCheck className="w-4 h-4 text-purple-600" />
              <span>3. Local Paperwork Delay</span>
            </div>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Panchayat NOC or local board permits might take time.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-purple-200 text-xs">
            <strong className="text-emerald-800 font-extrabold block mb-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Easy Fix:
            </strong>
            <span className="text-gray-700">Use fast-track official Udyam MSME online registration.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
