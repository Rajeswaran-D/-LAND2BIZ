'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Zap } from 'lucide-react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { apiClient } from '@/lib/apiClient';

export interface CandidateBusiness {
  id: string;
  title: string;
  category: string;
  capitalMin: number;
  capitalMax: number;
  monthlyNet: number;
  paybackMonths: number;
  marginPct: number;
  equipment: string[];
  utilities: string;
  tagline: string;
}

const TAGLINE: Record<string, string> = {
  solar_cold_storage_15mt: 'Cold-chain preserves produce for nearby farmers — verify local storage rent first.',
  agri_input_depot: 'Inputs + soil testing near farms — confirm dealer margins and footfall.',
  ev_charging_hub: 'Highway charging needs huge power sanction — verify DISCOM load first.',
};

interface Props {
  selectedId: string;
  onSelect: (candidate: CandidateBusiness) => void;
}

export const ComparativeCandidatesDeck: React.FC<Props> = ({ selectedId, onSelect }) => {
  const [deck, setDeck] = useState<CandidateBusiness[]>([]);

  useEffect(() => {
    let live = true;
    apiClient('/api/v1/schemes/cost-templates')
      .then((t) => {
        if (!live) return;
        const items: CandidateBusiness[] = (t.templates || []).slice(0, 3).map((x: any) => ({
          id: x.id,
          title: x.title,
          category: x.category,
          capitalMin: x.capital_min_inr,
          capitalMax: x.capital_max_inr,
          monthlyNet: x.monthly_net_inr,
          paybackMonths: x.payback_months_typical,
          marginPct: x.margin_pct_typical,
          equipment: x.key_equipment || [],
          utilities: x.utilities || '',
          tagline: TAGLINE[x.id] || 'Typical ranges — verify quotes locally.',
        }));
        setDeck(items);
        if (items.length && !items.find((i) => i.id === selectedId)) onSelect(items[0]);
      })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  const fmtL = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${Math.round(n / 1000)}k`);

  return (
    <div className="space-y-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" /> Compare & Select
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Compare & Select Your Business
          </h2>
        </div>
        <EvidenceBadge status={deck.length ? 'ESTIMATED' : 'DATA_UNAVAILABLE'} />
      </div>

      {!deck.length && <p className="text-xs text-gray-500">Loading cost ranges from backend…</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {deck.map((cand) => {
          const isSelected = selectedId === cand.id;
          return (
            <div
              key={cand.id}
              onClick={() => onSelect(cand)}
              className={`rounded-2xl border transition-all cursor-pointer p-6 flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-gradient-to-b from-blue-50/70 to-white ring-2 ring-blue-500/20 shadow-md'
                  : 'border-gray-200/90 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div>
                <h3 className="font-extrabold text-gray-900 text-base mb-1 leading-snug">
                  {cand.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4">{cand.tagline}</p>

                <div className="space-y-2 py-3 border-y border-gray-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capital range:</span>
                    <span className="font-bold text-gray-900">{fmtL(cand.capitalMin)}–{fmtL(cand.capitalMax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Typical net:</span>
                    <span className="font-bold text-gray-900">~₹{cand.monthlyNet.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Typical payback:</span>
                    <span className="font-bold text-emerald-700">~{(cand.paybackMonths / 12).toFixed(1)} yrs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Typical margin:</span>
                    <span className="font-bold text-gray-900">~{cand.marginPct}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">
                  {isSelected ? 'Selected' : 'Click to Select'}
                </span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'}`}>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
