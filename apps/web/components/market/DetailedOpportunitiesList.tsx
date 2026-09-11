'use client';

import React, { useEffect, useState } from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { Zap, ChevronDown, ChevronUp, CheckCircle2, Gift, MapPin, Users, TrendingUp } from 'lucide-react';
import { apiClient, fetchDecisionAnalysis, DecisionAnalysisResponse } from '@/lib/apiClient';

interface SchemeRow { id: string; name: string; subsidy_pct?: number; min_beneficiary_share_pct?: number; confidence?: string }
interface SchemesResponse { version: string; schemes: SchemeRow[] }

export const DetailedOpportunitiesList: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [decision, setDecision] = useState<DecisionAnalysisResponse | null>(null);
  const [schemes, setSchemes] = useState<SchemesResponse | null>(null);

  useEffect(() => {
    let live = true;
    let onboardingData: any = null;
    try {
      const saved = sessionStorage.getItem('land2biz_onboarding_data');
      if (saved) onboardingData = JSON.parse(saved);
    } catch (e) {}

    fetchDecisionAnalysis(onboardingData).then((d) => {
      if (live && d) setDecision(d);
    });

    apiClient('/api/v1/schemes/list').then((s: SchemesResponse) => { if (live) setSchemes(s); }).catch(() => {});
    return () => { live = false; };
  }, []);

  const pmfme = schemes?.schemes?.find((s) => s.id === 'pmfme_individual');
  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);
  const fmtL = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)}L` : `₹${Math.round(n / 1000)}k`);

  const ranking = decision?.ranking || [];

  return (
    <div className="space-y-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" /> Top Business Options
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Top Business Options For Your Location & Capital
          </h2>
        </div>
        <span className="text-xs text-gray-500 font-medium">Real-time Location Reasoning</span>
      </div>

      <div className="space-y-6">
        {!ranking.length && <p className="text-xs text-gray-500">Loading AI decision & location analysis from backend API…</p>}
        {ranking.slice(0, 3).map((item, index) => {
          const itemKey = item.id || item.business || `opp-item-${index}`;
          const isExpanded = expandedId === itemKey;
          const minCap = item.capital_min_inr || 1500000;
          const maxCap = item.capital_max_inr || 2500000;
          const monthlyNet = item.monthly_net_inr || Math.round(minCap * 0.08);

          return (
            <div
              key={itemKey}
              className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                      {item.category || item.business}
                    </span>
                    <EvidenceBadge status="ESTIMATED" />
                  </div>
                  <span className="text-[11px] text-gray-500">Overall Fit Score: <strong className="text-emerald-700 font-bold">{item.overall_score}/100</strong></span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">{item.title || item.business}</h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900 text-white rounded-xl mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Money Needed</span>
                    <span className="text-sm font-extrabold text-emerald-400">{fmtL(minCap)} – {fmtL(maxCap)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Typical Net</span>
                    <span className="text-sm font-extrabold text-emerald-400">~₹{monthlyNet.toLocaleString('en-IN')} / mo</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Payback</span>
                    <span className="text-sm font-extrabold text-blue-300">~{((item.payback_months_typical || 36) / 12).toFixed(1)} yrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Margin</span>
                    <span className="text-sm font-extrabold text-amber-300">~{item.margin_pct_typical || 25}%</span>
                  </div>
                </div>

                {/* AI Why-This-Location Highlights */}
                {item.why_this_location && item.why_this_location.length > 0 && (
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl mb-3 space-y-1">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" /> AI Location Fit Reasoning:
                    </span>
                    <ul className="text-xs text-blue-950 space-y-1 list-disc pl-4">
                      {item.why_this_location.map((why, idx) => (
                        <li key={idx}>{why}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs font-semibold mb-3">
                  <Gift className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong className="text-amber-950">Govt Support:</strong>{' '}
                    {pmfme ? `PMFME ${pmfme.subsidy_pct}% credit-linked subsidy applies for eligible micro food processing activities.` : 'Loading scheme route data…'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpand(itemKey)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                >
                  {isExpanded ? (
                    <>
                      <span>Hide Detailed AI Analysis</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Show Customers, Drivers & Equipment</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="bg-slate-50 border-t border-gray-200 px-6 py-4 text-xs text-gray-700 space-y-3">
                  {item.target_customers && (
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                        <Users className="w-3.5 h-3.5 text-emerald-600" /> Target Customer Profiles:
                      </span>
                      <p className="text-gray-600">{item.target_customers.join(' · ')}</p>
                    </div>
                  )}
                  {item.demand_drivers && (
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Key Demand Drivers:
                      </span>
                      <p className="text-gray-600">{item.demand_drivers.join(' · ')}</p>
                    </div>
                  )}
                  {item.unregistered_competition_notes && (
                    <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg">
                      <span className="font-bold text-amber-900 block mb-0.5">Unmapped Ground Competition Note:</span>
                      <p className="text-amber-950">{item.unregistered_competition_notes}</p>
                    </div>
                  )}
                  {item.key_equipment && (
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-900 block mb-1">Required Equipment:</span>
                      <div className="flex flex-wrap gap-2">
                        {item.key_equipment.map((eq: string, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
