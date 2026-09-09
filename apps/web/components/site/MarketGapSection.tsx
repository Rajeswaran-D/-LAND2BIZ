'use client';

import React from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { TrendingUp, Zap } from 'lucide-react';

export const MarketGapSection: React.FC = () => {
  const marketGaps = [
    {
      title: 'Solar-Powered Cold Storage Unit',
      gapRating: 'High Gap (Unserved)',
      gapType: 'HIGH',
      description: 'Zero cold storage units within 15km despite high fruit & vegetable farming.',
      estimatedMargin: '22% - 28%',
    },
    {
      title: 'Agri-Input & Soil Testing Depot',
      gapRating: 'Medium-High Gap',
      gapType: 'MEDIUM',
      description: 'Farmers currently travel 18km to buy certified bio-fertilizers.',
      estimatedMargin: '15% - 20%',
    },
    {
      title: 'EV Commercial Charging Hub',
      gapRating: 'Emerging Gap',
      gapType: 'HIGH',
      description: 'Located 100m from Highway 78; zero fast-chargers along this 40km stretch.',
      estimatedMargin: '25% - 35%',
    },
  ];

  return (
    <div className="space-y-6 mb-10">
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Businesses High In Demand Near Your Land
        </h2>
        <EvidenceBadge status="VERIFIED" />
      </div>

      {/* Observed Sector Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 text-center">
          <div className="text-xs text-gray-500 font-bold uppercase">Food Processing</div>
          <div className="text-xl font-black text-gray-900 my-1">2 Observed</div>
          <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded">Moderate</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 text-center">
          <div className="text-xs text-gray-500 font-bold uppercase">Cold Storage</div>
          <div className="text-xl font-black text-rose-600 my-1">0 Observed</div>
          <span className="text-[10px] bg-rose-50 text-rose-800 font-bold px-2 py-0.5 rounded">High Deficit</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 text-center">
          <div className="text-xs text-gray-500 font-bold uppercase">Dairy</div>
          <div className="text-xl font-black text-gray-900 my-1">1 Observed</div>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">High Demand</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200/80 text-center">
          <div className="text-xs text-gray-500 font-bold uppercase">Retail Kirana</div>
          <div className="text-xl font-black text-gray-900 my-1">8 Observed</div>
          <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded">Saturated</span>
        </div>
      </div>

      {/* Identified Market Gaps */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Top 3 Business Gaps Discovered
        </h3>

        <div className="space-y-3">
          {marketGaps.map((gap, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900">{gap.title}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {gap.gapRating}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{gap.description}</p>
              </div>

              <div className="flex-shrink-0 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-left sm:text-right">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Est. Margin</span>
                <span className="text-xs font-extrabold text-emerald-600">{gap.estimatedMargin}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
