'use client';

import React from 'react';
import { Landmark, CheckCircle2, FileText, Sparkles, Building2, Wrench, Wallet } from 'lucide-react';

interface NabardBusinessPlanCardProps {
  financeSkipped?: boolean;
}

export const NabardBusinessPlanCard: React.FC<NabardBusinessPlanCardProps> = ({ financeSkipped }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 lg:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Landmark className="w-3.5 h-3.5" /> National Govt Agri Plan
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Simple Business Plan (National Bank Standard)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Based on official national agriculture bank guidelines for rural land.
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm self-start sm:self-auto">
          NABARD Model Standard
        </span>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Project Capacity */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
          <span className="text-[10px] text-gray-500 font-bold uppercase block">
            🏭 NABARD Unit Capacity
          </span>
          <div className="text-base font-extrabold text-gray-900">15 Metric Ton (MT) Cold Room</div>
          <p className="text-xs text-gray-500">Modular temperature chamber (2°C to 8°C).</p>
        </div>

        {/* Raw Material Source */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
          <span className="text-[10px] text-gray-500 font-bold uppercase block">
            🌾 Raw Produce Source
          </span>
          <div className="text-base font-extrabold text-gray-900">Farmgate Pickup (15km Radius)</div>
          <p className="text-xs text-gray-500">40+ surrounding vegetable & fruit growers.</p>
        </div>

        {/* Equipment Needed */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
          <span className="text-[10px] text-gray-500 font-bold uppercase block">
            ⚙️ Key Machinery Needed
          </span>
          <div className="text-base font-extrabold text-gray-900">Solar Panel + Cooling Unit</div>
          <p className="text-xs text-gray-500">15 kW Solar array & insulated van.</p>
        </div>
      </div>

      {/* NABARD Financial Model Grid */}
      <div className="p-5 bg-slate-900 text-white rounded-2xl mb-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-emerald-400" />
          NABARD Benchmark Financial Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">💰 Setup Money</span>
            <span className="text-sm font-extrabold text-emerald-400">
              {financeSkipped ? '₹15L – 22L' : '₹15L – 22L (10% Owner Money)'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">💵 Gross Monthly Income</span>
            <span className="text-sm font-extrabold text-emerald-400">₹1,10,000 / month</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">📉 Monthly Costs</span>
            <span className="text-sm font-extrabold text-amber-300">₹35,000 / month</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">✨ Net Monthly Profit</span>
            <span className="text-sm font-extrabold text-emerald-400">₹75,000 / month</span>
          </div>
        </div>
      </div>

      {/* Plain Language Summary */}
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <span>
          <strong>NABARD Model Approval:</strong> This project design complies with standard NABARD bank loan guidelines and qualifies for 35% PMFME Govt subsidy funding.
        </span>
      </div>
    </div>
  );
};
