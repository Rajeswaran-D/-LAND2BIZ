'use client';

import React, { useEffect, useState } from 'react';
import { EligibilityProfile } from './SchemeEligibilityQuestionnaire';
import { Landmark, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { apiClient } from '@/lib/apiClient';

interface GovernmentSchemesGridProps {
  userProfile?: EligibilityProfile;
  projectCost?: number;
}

interface MudraCat { name: string; max_inr: number }
interface SchemeRow {
  id: string;
  name: string;
  ministry: string;
  source_url: string;
  confidence?: string;
  subsidy_pct?: number;
  min_beneficiary_share_pct?: number;
  subsidy_matrix_pct?: Record<string, number>;
  categories?: MudraCat[];
  subvention_years?: number;
  subsidy_note?: string;
  note?: string;
}

type SchemeCard = SchemeRow & { metric: string; sub: string; badge: 'VERIFIED' | 'NEEDS_VERIFICATION' };

type SchemesResponse = { version: string; schemes: SchemeRow[] };

export const GovernmentSchemesGrid: React.FC<GovernmentSchemesGridProps> = ({ userProfile, projectCost }) => {
  const [data, setData] = useState<SchemesResponse | null>(null);

  useEffect(() => {
    let live = true;
    apiClient('/api/v1/schemes/list').then((s) => { if (live) setData(s); }).catch(() => {});
    return () => { live = false; };
  }, []);

  if (!data) return <p className="text-xs text-gray-500 mb-10">Loading verified scheme data from backend…</p>;

  const isWoman = userProfile ? userProfile.gender === 'female' : true;
  const isSpecial = userProfile ? isWoman || userProfile.category !== 'general' : true;
  const pmegp = data.schemes.find((s: SchemeRow) => s.id === 'pmegp_micro');
  const pmegpPct: number | undefined = pmegp?.subsidy_matrix_pct?.[isSpecial ? 'special_rural' : 'general_rural'];

  const cards = data.schemes.map((s: SchemeRow) => {
    let metric = '', sub = '';
    let badge: 'VERIFIED' | 'NEEDS_VERIFICATION' = s.confidence === 'VERIFIED' ? 'VERIFIED' : 'NEEDS_VERIFICATION';
    if (s.id === 'pmfme_individual') { metric = `${s.subsidy_pct}% credit-linked, cap ₹10L`; sub = `Min ${s.min_beneficiary_share_pct}% owner share`; }
    else if (s.id === 'pmegp_micro') { metric = `${pmegpPct}% margin money (rural ${isSpecial ? 'special' : 'general'})`; sub = `Caps ₹50L mfg / ₹20L service · own share ${isSpecial ? '5%' : '10%'}`; }
    else if (s.id === 'mudra_pmmy') { metric = s.categories.map((c: MudraCat) => `${c.name} ≤₹${(c.max_inr / 100000).toFixed(c.max_inr >= 100000 ? 0 : 1)}L`).join(' · '); sub = 'Collateral-free via member banks; Tarun Plus only after Tarun repaid'; }
    else if (s.id === 'standup_india') { metric = '₹10L – ₹1Cr composite loan'; sub = 'SC/ST/women greenfield · 51% holding'; }
    else if (s.id === 'aif') { metric = `3% subvention to ₹2Cr × ${s.subvention_years}yrs`; sub = 'Post-harvest infra incl. cold chain'; }
    else { metric = s.subsidy_note || s.note || ''; sub = 'Confirm current circular before quoting'; badge = 'NEEDS_VERIFICATION'; }
    return { ...s, metric, sub, badge };
  });

  return (
    <div className="space-y-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-1">
            <Landmark className="w-3.5 h-3.5" /> Government Money Back Schemes
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Government Schemes That Help Pay For Your Business
          </h2>
        </div>
        <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
          {isWoman
            ? '👩‍💼 Women rural: 35% PMEGP slab'
            : isSpecial
            ? 'Special rural: 35% PMEGP slab'
            : 'General rural: 25% PMEGP slab'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((scheme: any) => (
          <div
            key={scheme.id}
            className="bg-white rounded-2xl border border-gray-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {scheme.name}
                </span>
                <EvidenceBadge status={scheme.badge} />
              </div>

              <h3 className="font-extrabold text-gray-900 text-base mb-1">{scheme.ministry}</h3>
              <p className="text-xs text-gray-600 mb-4">{scheme.metric} · {scheme.sub}</p>

              <div className="py-3 border-y border-gray-100 text-xs">
                <a href={scheme.source_url} target="_blank" rel="noreferrer" className="text-blue-700 font-bold hover:underline">Verify on official portal ↗</a>
                {projectCost && scheme.id === 'pmegp_micro' && (
                  <span className="block mt-1 text-emerald-700 font-bold">On ₹{projectCost.toLocaleString('en-IN')}: ~₹{Math.round(projectCost * pmegpPct / 100).toLocaleString('en-IN')} margin money</span>
                )}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs font-bold text-blue-700">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Available via Partner Banks</span>
              </span>
              <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
