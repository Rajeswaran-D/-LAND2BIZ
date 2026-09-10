'use client';

import React, { useEffect, useState } from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { Users, Navigation2, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { OnboardingFormData } from '@/types/onboarding';

type Badge = 'VERIFIED' | 'ESTIMATED' | 'DATA_UNAVAILABLE' | 'DATA_CONFLICT' | 'NEEDS_VERIFICATION';

interface ProvenanceValue<T = unknown> { value: T; status: string; data_period?: string; source?: string; confidence?: number }
interface DistrictProfile {
  matched?: boolean; district?: string; status?: string;
  population_2011?: ProvenanceValue<number>; density_2011?: ProvenanceValue<number>;
  population_estimate_2026?: ProvenanceValue<number>; density_estimate_2026?: ProvenanceValue<number>;
  odop_primary?: ProvenanceValue<string>; odop_sector?: string;
}
interface SiteBucket { mapped_count?: number; records?: unknown[]; status?: string; meaning?: string }
interface SiteResult {
  status?: string; confidence?: string;
  site_score?: { value: number | null; formula?: string; status?: string };
  amenity_score?: { value: number | null; status?: string };
  road_score?: { value: number | null; status?: string };
  counts?: Record<string, SiteBucket>;
  regulatory_flags?: Array<{ rule: string; flag: string; confidence?: string }>;
}
interface Props { onboardingData: OnboardingFormData | null; }

const getCoords = (d: OnboardingFormData | null): { lat: number; lng: number } | null => {
  if (!d) return null;
  if (d.locationMode === 'geolocation' && d.geolocation.latitude && d.geolocation.longitude)
    return { lat: d.geolocation.latitude, lng: d.geolocation.longitude };
  if (d.locationMode === 'link' && d.locationLink.extractedCoordinates)
    return { lat: d.locationLink.extractedCoordinates.lat, lng: d.locationLink.extractedCoordinates.lng };
  return null;
};

export const SiteMetricsGrid: React.FC<Props> = ({ onboardingData }) => {
  const [district, setDistrict] = useState<DistrictProfile | null>(null);
  const [site, setSite] = useState<SiteResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let live = true;
    const run = async () => {
      if (onboardingData?.locationMode === 'address' && onboardingData.fullAddress.district) {
        try {
          const p = await apiClient(`/api/v1/intelligence/district?name=${encodeURIComponent(onboardingData.fullAddress.district)}`);
          if (live) setDistrict(p);
        } catch { if (live) setDistrict(null); }
      }
      const c = getCoords(onboardingData);
      if (c) {
        setLoading(true);
        try {
          const s = await apiClient('/api/v1/intelligence/site', { method: 'POST', body: JSON.stringify({ lat: c.lat, lon: c.lng }) });
          if (live) { setSite(s.site); if (s.district_baseline?.matched) setDistrict(s.district_baseline); }
        } catch { if (live) setSite(null); }
        finally { if (live) setLoading(false); }
      }
    };
    run();
    return () => { live = false; };
  }, [onboardingData]);

  const popBadge: Badge = district?.population_2011?.status === 'VERIFIED' ? 'VERIFIED' : 'DATA_UNAVAILABLE';
  const estBadge: Badge = district?.population_estimate_2026?.status === 'ESTIMATED' ? 'ESTIMATED' : 'DATA_UNAVAILABLE';
  const siteBadge: Badge = (site?.site_score?.status as Badge) || (site?.confidence as Badge) || 'DATA_UNAVAILABLE';
  const num = (b: SiteBucket | undefined): number | null => (b && typeof b.mapped_count === 'number' ? b.mapped_count : null);
  const fmt = (n?: number | null) => (typeof n === 'number' ? n.toLocaleString('en-IN') : '—');

  return (
    <div className="space-y-6 mb-10">
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          People & Road Access Near Your Land
        </h2>
        <span className="text-xs font-medium text-gray-500">District baseline + live OSM · 5km radius</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <EvidenceBadge status={popBadge} />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              District Baseline — {district?.district || onboardingData?.fullAddress.district || 'Enter district'}
            </h3>
            {district?.matched || district?.district ? (
              <>
                <div className="text-3xl font-black text-gray-900 mb-1">Census 2011: {fmt(district.population_2011?.value)}</div>
                <p className="text-xs text-gray-500">Density {fmt(district.density_2011?.value)}/km² · {district.district} · VERIFIED — 2011.</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-600">2026 estimate ~{fmt(district.population_estimate_2026?.value)}</span>
                  <EvidenceBadge status={estBadge} />
                </div>
                <p className="text-[11px] text-gray-400">Estimate method: 2011 × (1+0.156)^(15/10). NOT a Census value — verify on ground.</p>
                {district.odop_primary?.value && <p className="text-xs text-gray-500 mt-1">ODOP: {district.odop_primary.value} ({district.odop_sector})</p>}
              </>
            ) : (
              <p className="text-xs text-gray-500">Enter a Tamil Nadu district (or share GPS) to load the Census 2011 baseline. No invented population is shown.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Navigation2 className="w-5 h-5" />
              </div>
              <EvidenceBadge status={siteBadge} />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Live Road & Amenity Count (OSM)
            </h3>
            {site ? (
              <>
                <div className="text-2xl font-extrabold text-gray-900 mb-1">Site score {site.site_score?.value ?? '—'}{site.site_score?.value != null ? '/100' : ''}</div>
                <p className="text-xs text-gray-500">Major road segments mapped: {fmt(num(site.counts?.road_km))} · Schools mapped: {fmt(num(site.counts?.school))} · Health mapped: {fmt(num(site.counts?.hospital))} · Banks mapped: {fmt(num(site.counts?.bank))} · Retail mapped: {fmt(num(site.counts?.market))} (5km, live).</p>
                <p className="text-[11px] text-gray-400 mt-1">Mapped businesses only. Additional businesses may exist outside OSM.</p>
              </>
            ) : (
              <p className="text-xs text-gray-500">{loading ? 'Querying live OpenStreetMap…' : 'Share GPS coordinates to run a live road/amenity count. Road names are not invented.'}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <EvidenceBadge status={site?.regulatory_flags?.length ? 'NEEDS_VERIFICATION' : siteBadge} />
            </div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Regulatory Flags (rule-based)
            </h3>
            {site?.regulatory_flags?.length ? (
              <ul className="text-xs text-gray-600 space-y-1">
                {site.regulatory_flags.map((f) => <li key={f.rule}>• [{f.rule}] {f.flag}</li>)}
                <li className="text-gray-400">Preliminary only — final clearance rests with the authority.</li>
              </ul>
            ) : (
              <p className="text-xs text-gray-500">Flags appear here only from screening rules R1–R6 once GPS is shared. Nothing is pre-filled.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
