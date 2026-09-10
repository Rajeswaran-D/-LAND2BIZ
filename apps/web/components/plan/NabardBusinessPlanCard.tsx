'use client';

import React, { useEffect, useState } from 'react';
import { Landmark, CheckCircle2, Wallet } from 'lucide-react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { apiClient } from '@/lib/apiClient';

interface CostTemplate {
  id: string; title: string; category: string;
  capital_min_inr: number; capital_max_inr: number;
  monthly_net_inr?: number; payback_months_typical?: number; margin_pct_typical?: number;
  confidence?: string;
}
interface TemplatesResponse { version: string; templates: CostTemplate[] }

interface Props {
  financeSkipped?: boolean;
}

export const NabardBusinessPlanCard: React.FC<Props> = ({ financeSkipped }) => {
  const [templates, setTemplates] = useState<CostTemplate[]>([]);
  useEffect(() => {
    let live = true;
    apiClient('/api/v1/schemes/cost-templates').then((t: TemplatesResponse) => { if (live) setTemplates(t.templates || []); }).catch(() => {});
    return () => { live = false; };
  }, []);
  const t = templates[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 lg:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <Landmark className="w-3.5 h-3.5" /> Cost-range plan
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Business Cost Ranges (MSME data)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Ranges from backend cost templates — never a fixed profit promise.
          </p>
        </div>
        <EvidenceBadge status={t ? 'ESTIMATED' : 'DATA_UNAVAILABLE'} />
      </div>

      {!t ? (
        <p className="text-xs text-gray-500">Loading cost templates from backend…</p>
      ) : (
        <>
          <div className="p-5 bg-slate-900 text-white rounded-2xl mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              {t.title}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">💰 Capital range</span>
                <span className="text-sm font-extrabold text-emerald-400">₹{(t.capital_min_inr / 100000).toFixed(1)}L – ₹{(t.capital_max_inr / 100000).toFixed(1)}L</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">💵 Typical net</span>
                <span className="text-sm font-extrabold text-emerald-400">~₹{t.monthly_net_inr?.toLocaleString('en-IN')} / mo</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">⏱️ Typical payback</span>
                <span className="text-sm font-extrabold text-blue-300">~{(t.payback_months_typical / 12).toFixed(1)} yrs</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">✨ Margin</span>
                <span className="text-sm font-extrabold text-emerald-400">~{t.margin_pct_typical}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              {financeSkipped ? 'Finance skipped — ' : ''}Get 2 local supplier quotes and complete M21 ground checks before treating these typical ranges as your numbers.
            </span>
          </div>
        </>
      )}
    </div>
  );
};
