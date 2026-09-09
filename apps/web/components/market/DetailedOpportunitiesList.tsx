'use client';

import React, { useState } from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import {
  Zap,
  IndianRupee,
  Calendar,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Building2,
  Clock,
  Gift,
} from 'lucide-react';

export interface OpportunityItem {
  id: string;
  title: string;
  category: string;
  suitabilityScore: number;
  capitalRequired: string;
  monthlyNetProfit: string;
  paybackPeriod: string;
  marginPercent: string;
  keyAdvantage: string;
  govtSchemeMatch: string;
  evidenceStatus: 'VERIFIED' | 'ESTIMATED' | 'NEEDS_VERIFICATION';
  details: {
    targetCustomers: string;
    keyEquipment: string[];
    utilityRequirement: string;
  };
}

const OPPORTUNITIES_DATA: OpportunityItem[] = [
  {
    id: 'opp_1',
    title: 'Cold Storage & Vegetable Preservation Unit',
    category: 'Cold Storage & Farming',
    suitabilityScore: 92,
    capitalRequired: '₹15 – 22 Lakhs',
    monthlyNetProfit: '₹75,000 / month',
    paybackPeriod: '1.8 Years',
    marginPercent: '26% Profit',
    keyAdvantage: 'No cold storage exists within 15km. High demand from 40+ local vegetable farmers.',
    govtSchemeMatch: 'PMFME Scheme — Govt pays 35% discount (Up to ₹10 Lakhs subsidy)',
    evidenceStatus: 'VERIFIED',
    details: {
      targetCustomers: 'Local vegetable farmers and market traders.',
      keyEquipment: ['Cold Storage Room', 'Solar Panels', 'Temp Logger'],
      utilityRequirement: 'Electric connection + Solar power.',
    },
  },
  {
    id: 'opp_2',
    title: 'Agri Seeds, Fertilizer & Soil Testing Shop',
    category: 'Farming Shop',
    suitabilityScore: 86,
    capitalRequired: '₹8 – 12 Lakhs',
    monthlyNetProfit: '₹45,000 / month',
    paybackPeriod: '1.4 Years',
    marginPercent: '18% Profit',
    keyAdvantage: 'Farmers currently travel 18km far away to buy quality seeds and fertilizers.',
    govtSchemeMatch: 'Agri-Clinic (ACABC) Scheme — 36% Govt Subsidy',
    evidenceStatus: 'VERIFIED',
    details: {
      targetCustomers: 'Nearby farmers and village cattle owners.',
      keyEquipment: ['Soil Test Kit', 'Computer & Printer', 'Storage Racks'],
      utilityRequirement: 'Normal electricity line.',
    },
  },
  {
    id: 'opp_3',
    title: 'Highway Vehicle Fast-Charging Station',
    category: 'Clean Energy & Highway',
    suitabilityScore: 81,
    capitalRequired: '₹18 – 25 Lakhs',
    monthlyNetProfit: '₹80,000 / month',
    paybackPeriod: '2.1 Years',
    marginPercent: '32% Profit',
    keyAdvantage: 'Located right next to Highway 78 where zero EV chargers exist for 40km.',
    govtSchemeMatch: 'State EV Scheme — 25% Govt Subsidy Support',
    evidenceStatus: 'ESTIMATED',
    details: {
      targetCustomers: 'Highway trucks, e-rickshaws, and electric cars.',
      keyEquipment: ['DC Fast Charger', 'AC Charger', 'Rest Area Chairs'],
      utilityRequirement: 'Commercial power line.',
    },
  },
];

export const DetailedOpportunitiesList: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>('opp_1');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
        {OPPORTUNITIES_DATA.map((opp) => {
          const isExpanded = expandedId === opp.id;

          return (
            <div
              key={opp.id}
              className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Card Header & Title Bar */}
              <div className="p-6 sm:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                      {opp.category}
                    </span>
                    <EvidenceBadge status={opp.evidenceStatus} />
                  </div>

                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-emerald-800 text-xs font-extrabold self-start sm:self-auto">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Suitability Score: {opp.suitabilityScore} / 100</span>
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2">{opp.title}</h3>

                <p className="text-xs sm:text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                  <strong className="text-blue-900 font-bold">Why it works here:</strong> {opp.keyAdvantage}
                </p>

                {/* Simple Financials Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900 text-white rounded-xl mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">💰 Money Needed</span>
                    <span className="text-sm font-extrabold text-emerald-400">{opp.capitalRequired}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">💵 Monthly Income</span>
                    <span className="text-sm font-extrabold text-emerald-400">{opp.monthlyNetProfit}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">⏱️ Money Back Time</span>
                    <span className="text-sm font-extrabold text-blue-300">{opp.paybackPeriod}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">📈 Profit Rate</span>
                    <span className="text-sm font-extrabold text-amber-300">{opp.marginPercent}</span>
                  </div>
                </div>

                {/* Government Subsidy Match Banner */}
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs font-semibold mb-3">
                  <Gift className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong className="text-amber-950">Govt Help:</strong> {opp.govtSchemeMatch}
                  </span>
                </div>

                {/* Drawer Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggleExpand(opp.id)}
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

              {/* Simple Details Drawer */}
              {isExpanded && (
                <div className="bg-slate-50 border-t border-gray-200 px-6 py-4 text-xs text-gray-700 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-900 block mb-0.5">Main Customers:</span>
                      <p className="text-gray-600">{opp.details.targetCustomers}</p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-900 block mb-0.5">Power & Electricity:</span>
                      <p className="text-gray-600">{opp.details.utilityRequirement}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <span className="font-bold text-gray-900 block mb-1">Items Needed:</span>
                    <div className="flex flex-wrap gap-2">
                      {opp.details.keyEquipment.map((eq, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {eq}
                        </span>
                      ))}
                    </div>
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
