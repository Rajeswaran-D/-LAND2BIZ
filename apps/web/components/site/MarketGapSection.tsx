'use client';

import React, { useEffect, useState } from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { TrendingUp, Zap, Sparkles, AlertCircle, MapPin } from 'lucide-react';
import { apiClient, fetchDecisionAnalysis, DecisionAnalysisResponse } from '@/lib/apiClient';
import { OnboardingFormData } from '@/types/onboarding';
import { getCoordinates, getDistrictName } from '@/lib/locationUtils';

interface Props {
  onboardingData: OnboardingFormData | null;
}

export const MarketGapSection: React.FC<Props> = ({ onboardingData }) => {
  const [market, setMarket] = useState<any>(null);
  const [district, setDistrict] = useState<any>(null);
  const [decision, setDecision] = useState<DecisionAnalysisResponse | null>(null);

  useEffect(() => {
    let live = true;
    const distName = getDistrictName(onboardingData);
    apiClient(`/api/v1/intelligence/district?name=${encodeURIComponent(distName)}`)
      .then((p) => { if (live && p.matched) setDistrict(p); })
      .catch(() => {});

    const c = getCoordinates(onboardingData);
    apiClient('/api/v1/intelligence/market', { method: 'POST', body: JSON.stringify({ lat: c.lat, lon: c.lng }) })
      .then((m) => { if (live) setMarket(m); })
      .catch(() => {});

    fetchDecisionAnalysis(onboardingData).then((d) => {
      if (live && d) setDecision(d);
    });

    return () => { live = false; };
  }, [onboardingData]);

  const num = (b: any) => (b && typeof b.mapped_count === 'number' ? b.mapped_count : null);
  const sectors = market ? [
    { label: 'Retail mapped', value: num(market.counts?.market) },
    { label: 'Cold-chain mapped', value: num(market.counts?.cold_storage) },
    { label: 'Dairy mapped', value: num(market.counts?.dairy) },
    { label: 'Fuel/EV mapped', value: num(market.counts?.fuel_ev) },
  ] : [];

  const synthesis = decision?.market_gap_synthesis;
  const niches = synthesis?.underserved_niches || [];
  const inferences = synthesis?.unregistered_business_inferences || [];
  const infraGaps = synthesis?.infrastructure_gaps || [];

  return (
    <div className="space-y-6 mb-10">
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Live Market Signals & AI Gap Synthesis
        </h2>
        <EvidenceBadge status={(market?.confidence as any) || (decision ? 'ESTIMATED' : 'DATA_UNAVAILABLE')} />
      </div>

      {market?.notice && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{market.notice} Counts below are best-available and clearly badged — nothing is invented.</span>
        </div>
      )}

      {/* AI Regional Location Summary */}
      {synthesis?.location_summary && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-blue-800">
          <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-emerald-400" /> AI Regional Catchment Synthesis
          </div>
          <p className="text-sm text-slate-100 font-medium leading-relaxed">
            {synthesis.location_summary}
          </p>
        </div>
      )}

      {district?.odop_primary?.value && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">District Strength (National ODOP List V32)</h3>
          <p className="text-sm font-bold text-gray-900">{district.district}: {district.odop_primary.value} ({district.odop_sector})</p>
          <p className="text-xs text-gray-500 mt-1">Build around this agricultural/industrial strength; PMFME scheme supports eligible processing units with 35% credit-linked subsidy (cap ₹10L).</p>
        </div>
      )}

      {/* Mapped Counts Grid */}
      {sectors.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {sectors.map((s) => (
            <div key={s.label} className="bg-white p-4 rounded-xl border border-gray-200/80 text-center">
              <div className="text-xs text-gray-500 font-bold uppercase">{s.label}</div>
              <div className="text-xl font-black text-gray-900 my-1">{s.value ?? '0'} mapped</div>
            </div>
          ))}
        </div>
      )}

      {/* Underserved Market Niches AI Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          AI Identified Underserved Market Niches
        </h3>

        <div className="space-y-3">
          {niches.map((gap, i) => (
            <div key={i} className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-sm font-extrabold text-gray-900">{gap.niche}</span>
                <p className="text-xs text-gray-600 mt-0.5">{gap.signal}</p>
                {gap.suggested_capacity && (
                  <span className="inline-block mt-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Suggested scale: {gap.suggested_capacity}
                  </span>
                )}
              </div>
              <EvidenceBadge status={gap.confidence} />
            </div>
          ))}

          {!niches.length && (
            <p className="text-xs text-gray-500">Analyzing live OSM density & district population benchmarks...</p>
          )}
        </div>
      </div>

      {/* Unmapped Ground Competition Inferences */}
      {inferences.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-6 text-amber-950 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Unregistered Ground Competition Inferences (M21 Verification Checklist)
          </h3>
          <ul className="space-y-2 text-xs">
            {inferences.map((inf, idx) => (
              <li key={idx} className="p-3 bg-white/80 rounded-xl border border-amber-100">
                <strong className="font-bold text-amber-950 block">{inf.type}</strong>
                <span className="text-amber-900">{inf.note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Infrastructure Gaps */}
      {infraGaps.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" /> Infrastructure & Utility Gaps to Verify
          </h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {infraGaps.map((gapStr, i) => (
              <span key={i} className="bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-lg">
                {gapStr}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
