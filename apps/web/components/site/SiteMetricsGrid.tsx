'use client';

import React from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { Users, Navigation2, Building2, Store, Truck, Landmark, Wallet } from 'lucide-react';

export const SiteMetricsGrid: React.FC = () => {
  return (
    <div className="space-y-6 mb-10">
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          People & Road Access Near Your Land
        </h2>
        <span className="text-xs font-medium text-gray-500">Within 2km–5km Distance</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. People Count / Population */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <EvidenceBadge status="VERIFIED" />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Local People Count
            </h3>
            <div className="text-3xl font-black text-gray-900 mb-1">~48,500</div>
            <p className="text-xs text-gray-500">Estimated residents in 3km radius (~9,700 families).</p>
          </div>
        </div>

        {/* 2. Nearby Road Connection */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Navigation2 className="w-5 h-5" />
              </div>
              <EvidenceBadge status="VERIFIED" />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Road Connection
            </h3>
            <div className="text-2xl font-extrabold text-gray-900 mb-1">State Highway 78</div>
            <p className="text-xs text-gray-500">4-lane paved access (18m width, heavy truck route).</p>
          </div>
        </div>

        {/* 3. Nearby Commercial Buildings Overview */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <EvidenceBadge status="ESTIMATED" />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Commercial Hubs
            </h3>
            <div className="text-2xl font-extrabold text-gray-900 mb-1">4 Major Hubs</div>
            <p className="text-xs text-gray-500">Includes Mandi market, industrial park, and logistics centers.</p>
          </div>
        </div>
      </div>

      {/* Important Nearby Commercial Buildings - Sleek Row */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Store className="w-4 h-4 text-blue-600" />
          Important Nearby Infrastructure
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
            <Store className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-gray-900">APMC Mandi</div>
              <div className="text-[11px] text-gray-500">3.2 km away</div>
            </div>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
            <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-gray-900">Logistics Hub</div>
              <div className="text-[11px] text-gray-500">1.5 km away</div>
            </div>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
            <Landmark className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-gray-900">Industrial Park</div>
              <div className="text-[11px] text-gray-500">5.5 km away</div>
            </div>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
            <Wallet className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-gray-900">Bank & ATM</div>
              <div className="text-[11px] text-gray-500">800 m away</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
