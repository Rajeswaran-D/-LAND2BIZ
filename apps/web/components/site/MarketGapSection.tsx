'use client';

import React, { useEffect, useState } from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { TrendingUp, Zap } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { OnboardingFormData } from '@/types/onboarding';

interface Props {
  onboardingData: OnboardingFormData | null;
}

const getCoords = (d: OnboardingFormData | null) => {
  if (!d) return null;
  if (d.locationMode === 'geolocation' && d.geolocation.latitude && d.geolocation.longitude)
    return { lat: d.geolocation.latitude, lng: d.geolocation.longitude };
  if (d.locationMode === 'link' && d.locationLink.extractedCoordinates)
    return { lat: d.locationLink.extractedCoordinates.lat, lng: d.locationLink.extractedCoordinates.lng };
  return null;
};

export const MarketGapSection: React.FC<Props> = ({ onboardingData }) => {
  const [market, setMarket] = useState<any>(null);
  const [district, setDistrict] = useState<any>(null);

  useEffect(() => {
    let live = true;
    if (onboardingData?.locationMode === 'address' && onboardingData.fullAddress.district) {
      apiClient(`/api/v1/intelligence/district?name=${encodeURIComponent(onboardingData.fullAddress.district)}`)
        .then((p) => { if (live && p.matched) setDistrict(p); })
        .catch(() => {});
    }
    const c = getCoords(onboardingData);
    if (c) {
      apiClient('/api/v1/intelligence/market', { method: 'POST', body: JSON.stringify({ lat: c.lat, lon: c.lng }) })
        .then((m) => { if (live) setMarket(m); })
        .catch(() => {});
    }
    return () => { live = false; };
  }, [onboardingData]);

  const num = (b: any) => (b && typeof b.mapped_count === 'number' ? b.mapped_count : null);
  const sectors = market ? [
    { label: 'Retail mapped', value: num(market.counts.market) },
    { label: 'Cold-chain mapped', value: num(market.counts.cold_storage) },
    { label: 'Dairy mapped', value: num(market.counts.dairy) },
    { label: 'Fuel/EV mapped', value: num(market.counts.fuel_ev) },
  ] : [];

  return (
    <div className="space-y-6 mb-10">
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Market Signals Near Your Land
        </h2>
        <EvidenceBadge status={(market?.confidence as any) || 'DATA_UNAVAILABLE'} />
      </div>

      {district?.odop_primary?.value && (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">District strength (National ODOP list V32)</h3>
          <p className="text-sm font-bold text-gray-900">{district.district}: {district.odop_primary.value} ({district.odop_sector})</p>
          <p className="text-xs text-gray-500">Build around this strength; ODOP alone never guarantees demand. PMFME supports eligible food-processing activity (35% cap ₹10L).</p>
        </div>
      )}

      {!market ? (
        <p className="text-xs text-gray-500">Share GPS coordinates to compute live market signals. No demand figures are invented.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {sectors.map((s) => (
              <div key={s.label} className="bg-white p-4 rounded-xl border border-gray-200/80 text-center">
                <div className="text-xs text-gray-500 font-bold uppercase">{s.label}</div>
                <div className="text-xl font-black text-gray-900 my-1">{s.value ?? '—'} mapped</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Possible gaps (verify on ground before investing)
            </h3>
            <div className="space-y-3">
              {(market.gaps || []).map((gap: any, i: number) => (
                <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-sm font-bold text-gray-900">{gap.niche}</span>
                    <p className="text-xs text-gray-500">{gap.signal}</p>
                  </div>
                  <EvidenceBadge status={gap.confidence} />
                </div>
              ))}
              {!(market.gaps || []).length && <p className="text-xs text-gray-500">No zero-count gaps in mapped data. Still verify on ground — OSM misses unmapped shops.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
