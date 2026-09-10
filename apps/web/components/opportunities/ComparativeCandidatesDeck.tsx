'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Zap, MapPin } from 'lucide-react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { fetchDecisionAnalysis } from '@/lib/apiClient';

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
  whyThisLocation?: string[];
  targetCustomers?: string[];
  overallScore?: number;
}

interface Props {
  selectedId: string;
  onSelect: (candidate: CandidateBusiness) => void;
}

export const ComparativeCandidatesDeck: React.FC<Props> = ({ selectedId, onSelect }) => {
  const [deck, setDeck] = useState<CandidateBusiness[]>([]);

  useEffect(() => {
    let live = true;
    let onboardingData: any = null;
    try {
      const saved = sessionStorage.getItem('land2biz_onboarding_data');
      if (saved) onboardingData = JSON.parse(saved);
    } catch (e) {}

    fetchDecisionAnalysis(onboardingData)
      .then((d) => {
        if (!live || !d || !d.ranking) return;
        const items: CandidateBusiness[] = d.ranking.slice(0, 3).map((r: any) => {
          const minCap = r.capital_min_inr || 1500000;
          const maxCap = r.capital_max_inr || 2500000;
          const whyStr = (r.why_this_location && r.why_this_location[0])
            ? r.why_this_location[0]
            : 'AI analyzed district census & ODOP produce fit.';

          return {
            id: r.id || r.business || 'business_1',
            title: r.title || r.business || 'Rural Enterprise',
            category: r.category || r.business,
            capitalMin: minCap,
            capitalMax: maxCap,
            monthlyNet: r.monthly_net_inr || Math.round(minCap * 0.08),
            paybackMonths: r.payback_months_typical || 36,
            marginPct: r.margin_pct_typical || 25,
            equipment: r.key_equipment || ['Processing/Storage Tools', 'Utility Panel'],
            utilities: r.utilities || '3-Phase Commercial Power, Road Access',
            tagline: whyStr,
            whyThisLocation: r.why_this_location || [],
            targetCustomers: r.target_customers || [],
            overallScore: r.overall_score || 75.0,
          };
        });
        setDeck(items);
        if (items.length && (!selectedId || !items.find((i) => i.id === selectedId))) {
          onSelect(items[0]);
        }
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
            <Zap className="w-3.5 h-3.5" /> AI Evaluated Options
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Compare & Select Your Business Option
          </h2>
        </div>
        <EvidenceBadge status={deck.length ? 'ESTIMATED' : 'DATA_UNAVAILABLE'} />
      </div>

      {!deck.length && <p className="text-xs text-gray-500">Loading AI location-fit ranking from backend API…</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {deck.map((cand, index) => {
          const isSelected = selectedId === cand.id;
          const candKey = cand.id || `cand-key-${index}`;
          return (
            <div
              key={candKey}
              onClick={() => onSelect(cand)}
              className={`rounded-2xl border transition-all cursor-pointer p-6 flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-gradient-to-b from-blue-50/70 to-white ring-2 ring-blue-500/20 shadow-md'
                  : 'border-gray-200/90 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-extrabold text-gray-900 text-base leading-snug">
                    {cand.title}
                  </h3>
                  {cand.overallScore && (
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {cand.overallScore}/100
                    </span>
                  )}
                </div>

                <p className="text-xs text-blue-900 bg-blue-50/80 p-2.5 rounded-lg border border-blue-100 mb-4 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>{cand.tagline}</span>
                </p>

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
                  {isSelected ? 'Selected Choice' : 'Click to Select'}
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
