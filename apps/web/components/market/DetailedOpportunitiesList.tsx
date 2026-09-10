'use client';

import React, { useEffect, useState } from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { Zap, Award, ChevronDown, ChevronUp, CheckCircle2, Gift } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface CostTemplate {
  id: string; title: string; category: string;
  capital_min_inr: number; capital_max_inr: number;
  monthly_net_inr?: number; payback_months_typical?: number; margin_pct_typical?: number;
  key_equipment?: string[]; utilities?: string; verify_locally?: string[]; confidence?: string;
}
interface SchemeRow { id: string; name: string; subsidy_pct?: number; min_beneficiary_share_pct?: number; confidence?: string }
interface SchemesResponse { version: string; schemes: SchemeRow[] }
interface TemplatesResponse { version: string; templates: CostTemplate[] }

export const DetailedOpportunitiesList: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<CostTemplate[]>([]);
  const [schemes, setSchemes] = useState<SchemesResponse | null>(null);

  useEffect(() => {
    let live = true;
    apiClient('/api/v1/schemes/cost-templates').then((t: TemplatesResponse) => { if (live) setTemplates(t.templates || []); }).catch(() => {});
    apiClient('/api/v1/schemes/list').then((s: SchemesResponse) => { if (live) setSchemes(s); }).catch(() => {});
    return () => { live = false; };
  }, []);

  const pmfme = schemes?.schemes?.find((s) => s.id === 'pmfme_individual');
  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);
  const fmtL = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)}L` : `₹${Math.round(n / 1000)}k`);

  return (
    <div className="space-y-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" /> Top Business Options
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Top 3 Business Options For Your Land
          </h2>
        </div>
        <span className="text-xs text-gray-500 font-medium">Simple Profit Summary</span>
      </div>

      <div className="space-y-6">
        {!templates.length && <p className="text-xs text-gray-500">Loading cost ranges from backend data…</p>}
        {templates.slice(0, 3).map((t) => {
          const isExpanded = expandedId === t.id;

          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                      {t.category}
                    </span>
                    <EvidenceBadge status="ESTIMATED" />
                  </div>
                  <span className="text-[11px] text-gray-500">Range from MSME cost data · verify quotes locally</span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">{t.title}</h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900 text-white rounded-xl mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">💰 Money Needed</span>
                    <span className="text-sm font-extrabold text-emerald-400">{fmtL(t.capital_min_inr)} – {fmtL(t.capital_max_inr)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">💵 Typical Net</span>
                    <span className="text-sm font-extrabold text-emerald-400">~₹{t.monthly_net_inr?.toLocaleString('en-IN')} / mo</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">⏱️ Typical Payback</span>
                    <span className="text-sm font-extrabold text-blue-300">~{(t.payback_months_typical / 12).toFixed(1)} yrs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">📈 Typical Margin</span>
                    <span className="text-sm font-extrabold text-amber-300">~{t.margin_pct_typical}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs font-semibold mb-3">
                  <Gift className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong className="text-amber-950">Govt Help:</strong>{' '}
                    {pmfme ? `PMFME ${pmfme.subsidy_pct}% credit-linked (cap ₹10L) — applies to eligible food-processing activity` : 'Loading scheme data…'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpand(t.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all"
                >
                  {isExpanded ? (
                    <>
                      <span>Hide Simple Details</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Show Simple Setup Details</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="bg-slate-50 border-t border-gray-200 px-6 py-4 text-xs text-gray-700 space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <span className="font-bold text-gray-900 block mb-0.5">Power & Utilities:</span>
                    <p className="text-gray-600">{t.utilities}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <span className="font-bold text-gray-900 block mb-1">Items Needed:</span>
                    <div className="flex flex-wrap gap-2">
                      {(t.key_equipment || []).map((eq: string, i: number) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {eq}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <span className="font-bold text-gray-900 block mb-1">Verify locally before investing:</span>
                    <p className="text-gray-600">{(t.verify_locally || []).join(' · ')}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
