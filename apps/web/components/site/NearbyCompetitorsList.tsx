'use client';

import React, { useEffect, useState } from 'react';
import { Store } from 'lucide-react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
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

export const NearbyCompetitorsList: React.FC<Props> = ({ onboardingData }) => {
  const [market, setMarket] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let live = true;
    const c = getCoords(onboardingData);
    if (!c) { setMarket(null); return; }
    setLoading(true);
    apiClient('/api/v1/intelligence/market', { method: 'POST', body: JSON.stringify({ lat: c.lat, lon: c.lng }) })
      .then((m) => { if (live) setMarket(m); })
      .catch(() => { if (live) setMarket(null); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [onboardingData]);

  const num = (b: any) => (b && typeof b.mapped_count === 'number' ? b.mapped_count : null);
  const rows = market ? [
    { label: 'Retail outlets mapped', value: num(market.counts.market) },
    { label: 'Banks mapped', value: num(market.counts.bank) },
    { label: 'Dairy outlets mapped', value: num(market.counts.dairy) },
    { label: 'Cold-chain features mapped', value: num(market.counts.cold_storage) },
    { label: 'Fuel / EV charging mapped', value: num(market.counts.fuel_ev) },
  ] : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 lg:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Store className="w-3.5 h-3.5" /> Live Surroundings Count
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Nearby Business Density (OpenStreetMap, 5km)
          </h2>
        </div>
        <EvidenceBadge status={(market?.confidence as any) || 'DATA_UNAVAILABLE'} />
      </div>

      {!market ? (
        <p className="text-xs text-gray-500">
          {loading ? 'Querying live OpenStreetMap…' : 'Share GPS coordinates (Location Access or Location Link tab) to count real mapped shops around your land. No shop names are invented — counts come from a live OSM query at request time, and unmapped shops will not appear.'}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            {rows.map((r) => (
              <div key={r.label} className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 text-center">
                <div className="text-xs text-gray-500 font-bold uppercase">{r.label}</div>
                <div className="text-2xl font-black text-gray-900 my-1">{r.value ?? '—'}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500">Mapped businesses only. Additional businesses may exist outside OSM. OSM coverage varies by village — confirm with the M21 ground-truth checklist before treating a zero as a real gap.</p>
        </>
      )}
    </div>
  );
};
