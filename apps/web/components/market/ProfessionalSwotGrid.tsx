'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const ProfessionalSwotGrid: React.FC = () => {
  return (
    <div className="space-y-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> 10-Second Guide
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Simple Pros & Cons (At a Glance)
          </h2>
        </div>
        <span className="text-xs text-gray-500 font-medium">Ultra-Short Points</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. GOOD THINGS (STRENGTHS) */}
        <div className="bg-white rounded-2xl border border-emerald-200/90 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm mb-3 border-b border-emerald-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>1. Good Points (Strengths)</span>
          </div>

          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2 p-2 bg-emerald-50/50 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-bold">Wide Highway Road:</strong>
                <span className="text-gray-600">100m from Highway 78 for big trucks.</span>
              </div>
            </li>

            <li className="flex items-start gap-2 p-2 bg-emerald-50/50 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-bold">Own Land Ready:</strong>
                <span className="text-gray-600">Save 60% setup cost (no rent).</span>
              </div>
            </li>
          </ul>
        </div>

        {/* 2. CHALLENGES & FIXES (WEAKNESSES) */}
        <div className="bg-white rounded-2xl border border-amber-200/90 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm mb-3 border-b border-amber-100 pb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>2. Challenges & Easy Fixes</span>
          </div>

          <ul className="space-y-2.5 text-xs">
            <li className="p-2 bg-amber-50/50 rounded-lg space-y-1">
              <strong className="text-gray-900 block font-bold">Power Line Delay (30 days):</strong>
              <span className="inline-block text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                ⚡ Easy Fix: Use solar panels to start fast
              </span>
            </li>

            <li className="p-2 bg-amber-50/50 rounded-lg space-y-1">
              <strong className="text-gray-900 block font-bold">Limited Cash Buffer:</strong>
              <span className="inline-block text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                🎁 Easy Fix: Get 35% Govt scheme subsidy
              </span>
            </li>
          </ul>
        </div>

        {/* 3. BIG OPPORTUNITIES */}
        <div className="bg-white rounded-2xl border border-blue-200/90 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-blue-800 font-extrabold text-sm mb-3 border-b border-blue-100 pb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>3. Big Opportunities</span>
          </div>

          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2 p-2 bg-blue-50/50 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-bold">No Cold Storage within 15km:</strong>
                <span className="text-gray-600">40+ local farmers need storage.</span>
              </div>
            </li>

            <li className="flex items-start gap-2 p-2 bg-blue-50/50 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 block font-bold">Govt 35% Money Back:</strong>
                <span className="text-gray-600">Qualifies for PMFME Govt scheme.</span>
              </div>
            </li>
          </ul>
        </div>

        {/* 4. RISKS TO WATCH */}
        <div className="bg-white rounded-2xl border border-rose-200/90 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm mb-3 border-b border-rose-100 pb-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>4. Risks & Easy Fixes</span>
          </div>

          <ul className="space-y-2.5 text-xs">
            <li className="p-2 bg-rose-50/50 rounded-lg space-y-1">
              <strong className="text-gray-900 block font-bold">Rainfall Harvest Changes:</strong>
              <span className="inline-block text-[11px] font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded">
                🛡️ Easy Fix: Store multiple items (veggies, seeds, dairy)
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
