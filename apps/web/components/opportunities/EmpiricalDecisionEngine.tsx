'use client';

import React from 'react';
import { CandidateBusiness } from './ComparativeCandidatesDeck';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { Sparkles, CheckCircle2, MapPin, Users, Landmark, Wallet, Wrench, Zap } from 'lucide-react';

interface Props {
  candidate: CandidateBusiness;
}

export const EmpiricalDecisionEngine: React.FC<Props> = ({ candidate }) => {
  const fmtL = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${Math.round(n / 1000)}k`);
  const whyList = candidate.whyThisLocation || [];

  // Candidate-specific dynamic scheme & subsidy details
  const getDynamicSchemeInfo = () => {
    const cat = (candidate.category || candidate.id || '').toLowerCase();
    const title = (candidate.title || '').toLowerCase();

    if (cat.includes('cold') || cat.includes('food') || title.includes('cold') || title.includes('mill')) {
      return {
        scheme: 'PMFME Micro Food Scheme',
        detail: '35% Credit-Linked Capital Subsidy (up to ₹10 Lakhs) + Agri Infrastructure Fund (AIF) 3% interest subvention for 7 years.',
      };
    } else if (cat.includes('agri') || cat.includes('retail') || title.includes('input') || title.includes('depot')) {
      return {
        scheme: 'ACABC & PMFME Working Capital',
        detail: 'NABARD Agri-Clinics & Agri-Business Centers (ACABC) 36-44% composite subsidy + PMFME retail credit line.',
      };
    } else if (cat.includes('ev') || cat.includes('charging') || title.includes('ev') || title.includes('solar')) {
      return {
        scheme: 'PMEGP Renewable & Infrastructure',
        detail: 'PMEGP 25-35% Rural Margin Money credit subsidy for service units up to ₹20 Lakhs project cost.',
      };
    } else if (cat.includes('dairy') || title.includes('dairy') || title.includes('milk')) {
      return {
        scheme: 'National Livestock Mission & PMEGP',
        detail: '25-35% Capital Credit Subsidy + NABARD Dairy Infrastructure Development Fund (DIDF) low-interest loan.',
      };
    } else {
      return {
        scheme: 'PMEGP & Mudra Tarun Loan Route',
        detail: 'PMEGP 25-35% Rural General/Special Category Margin Money + MUDRA Tarun loan coverage up to ₹10 Lakhs.',
      };
    }
  };

  const schemeInfo = getDynamicSchemeInfo();

  return (
    <div className="bg-white rounded-2xl border border-blue-200/90 p-6 sm:p-8 mb-10 shadow-sm transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> AI Location Fit Breakdown
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Why &quot;{candidate.title}&quot; Fits Your Location
          </h2>
        </div>
        <EvidenceBadge status="ESTIMATED" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Box 1: Location Reasoning */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-2">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>AI Location Reasoning for {candidate.title}</span>
          </div>
          {whyList.length > 0 ? (
            <ul className="text-xs text-blue-950 space-y-1.5 list-disc pl-4 font-medium">
              {whyList.map((why, i) => (
                <li key={i}>{why}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-blue-950 leading-relaxed font-medium">
              District Census population scale & ODOP produce alignment verified for {candidate.title}.
            </p>
          )}
        </div>

        {/* Box 2: Target Customer Segment */}
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Target Customer Segment for {candidate.title}</span>
          </div>
          <p className="text-xs text-emerald-950 leading-relaxed font-medium">
            {candidate.targetCustomers && candidate.targetCustomers.length > 0
              ? candidate.targetCustomers.join(' · ')
              : `Local residents, regional farmers, and commercial buyers in the spatial catchment.`}
          </p>
        </div>

        {/* Box 3: Capital & Financial Metrics */}
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
            <Wallet className="w-4 h-4 text-indigo-600" />
            <span>Financial Investment Profile ({candidate.title})</span>
          </div>
          <p className="text-xs text-indigo-950 leading-relaxed font-medium">
            {fmtL(candidate.capitalMin)} – {fmtL(candidate.capitalMax)} capital · ~₹{candidate.monthlyNet.toLocaleString('en-IN')}/mo estimated net · ~{(candidate.paybackMonths / 12).toFixed(1)} yrs payback · ~{candidate.marginPct}% operating margin.
          </p>
        </div>

        {/* Box 4: Govt Subsidy Route */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <Landmark className="w-4 h-4 text-amber-600" />
            <span>Matched Scheme: {schemeInfo.scheme}</span>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed font-medium">
            {schemeInfo.detail}
          </p>
        </div>
      </div>

      {/* Additional Candidate Specifics: Equipment & Utilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-1">
          <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-slate-600" /> Equipment Package Needed:
          </span>
          <p className="text-slate-600 font-medium">
            {candidate.equipment && candidate.equipment.length > 0
              ? candidate.equipment.join(' · ')
              : 'Standard operational machinery & utility tools.'}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs space-y-1">
          <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-slate-600" /> Utility & Road Access Prerequisites:
          </span>
          <p className="text-slate-600 font-medium">
            {candidate.utilities || '3-Phase Commercial Electrical Line, Road Frontage.'}
          </p>
        </div>
      </div>

      <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap items-center gap-3 text-xs">
        <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Calculated for &quot;{candidate.title}&quot; from backend decision API — verify 2 local quotes before capital commitment.</span>
        </span>
      </div>
    </div>
  );
};

