'use client';

import React from 'react';
import { Award, CheckCircle2, Clock, Wrench, ShieldCheck, Zap } from 'lucide-react';

export interface CandidateBusiness {
  id: string;
  title: string;
  category: string;
  suitabilityScore: number;
  rankLabel: string;
  setupDays: string;
  operationalComplexity: 'Low' | 'Medium' | 'High';
  breakevenThreshold: string;
  laborAvailability: string;
  regulatoryFriction: 'Low' | 'Medium';
  tagline: string;
  empiricalHighlights: {
    demandStat: string;
    logisticsStat: string;
    marginStat: string;
    govtStat: string;
  };
}

export const CANDIDATES_DECK: CandidateBusiness[] = [
  {
    id: 'cand_1',
    title: 'Solar Cold Storage & Preservation Unit',
    category: 'Agri-Logistics & Preservation',
    suitabilityScore: 92,
    rankLabel: '#1 Top Recommended',
    setupDays: '45 Days',
    operationalComplexity: 'Low',
    breakevenThreshold: '58% Utilization',
    laborAvailability: '9/10 (High)',
    regulatoryFriction: 'Low',
    tagline: 'Solves 15km cold preservation gap for 40+ local vegetable farmers.',
    empiricalHighlights: {
      demandStat: '40+ farmers produce ~1,200 MT produce annually with 18.5% post-harvest spoilage.',
      logisticsStat: '4,200 vehicles/day on SH-78 (18% heavy commercial freight); 18m road width supports 16-wheelers.',
      marginStat: 'Capital: ₹15L–22L | Monthly net profit: ₹75,000 | 26.4% profit margin | Payback in 21.6 months.',
      govtStat: 'PMFME Scheme Sub-clause 4.2 grants 35% capital subsidy (up to ₹10 Lakhs).',
    },
  },
  {
    id: 'cand_2',
    title: 'Integrated Agri-Input & Soil Testing Depot',
    category: 'Agri-Retail & Services',
    suitabilityScore: 86,
    rankLabel: '#2 Highly Viable',
    setupDays: '30 Days',
    operationalComplexity: 'Low',
    breakevenThreshold: '42% Sales Volume',
    laborAvailability: '9.5/10 (High)',
    regulatoryFriction: 'Low',
    tagline: 'Eliminates 18km travel distance for farmers buying seeds & fertilizers.',
    empiricalHighlights: {
      demandStat: 'Over 850 agricultural households buy seeds & fertilizer 4 times per year.',
      logisticsStat: 'Located 450m from main village crossroad; high footfall from local tractor traffic.',
      marginStat: 'Capital: ₹8L–12L | Monthly net profit: ₹45,000 | 18.2% margin | Payback in 16.8 months.',
      govtStat: 'Agri-Clinic (ACABC) Scheme offers 36% composite credit subsidy.',
    },
  },
  {
    id: 'cand_3',
    title: 'Commercial EV Fleet & Fast-Charging Hub',
    category: 'Clean Energy & Highway',
    suitabilityScore: 81,
    rankLabel: '#3 Growth Potential',
    setupDays: '60 Days',
    operationalComplexity: 'Medium',
    breakevenThreshold: '65% Charging Capacity',
    laborAvailability: '7.5/10 (Medium)',
    regulatoryFriction: 'Medium',
    tagline: 'Captures 40km unserved highway charging gap on State Highway 78.',
    empiricalHighlights: {
      demandStat: '75+ daily commercial e-rickshaws and highway EV freight trucks pass location.',
      logisticsStat: 'Direct frontage on SH-78 highway with 11kV grid connection nearby.',
      marginStat: 'Capital: ₹18L–25L | Monthly net profit: ₹80,000 | 32.0% margin | Payback in 25.2 months.',
      govtStat: 'FAME-II & State EV Infrastructure Policy gives 25% capital grant.',
    },
  },
];

interface ComparativeCandidatesDeckProps {
  selectedId: string;
  onSelect: (candidate: CandidateBusiness) => void;
}

export const ComparativeCandidatesDeck: React.FC<ComparativeCandidatesDeckProps> = ({
  selectedId,
  onSelect,
}) => {
  return (
    <div className="space-y-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" /> Compare & Select
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Compare & Select Your Business
          </h2>
        </div>
        <span className="text-xs text-gray-500 font-medium">Click any card to select</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CANDIDATES_DECK.map((cand) => {
          const isSelected = selectedId === cand.id;

          return (
            <div
              key={cand.id}
              onClick={() => onSelect(cand)}
              className={`rounded-2xl border transition-all cursor-pointer p-6 flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-gradient-to-b from-blue-50/70 to-white ring-2 ring-blue-500/20 shadow-md'
                  : 'border-gray-200/90 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div>
                {/* Header Rank & Suitability */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      cand.id === 'cand_1'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cand.rankLabel}
                  </span>

                  <div className="flex items-center gap-1 text-xs font-black text-blue-900">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>{cand.suitabilityScore}/100</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-gray-900 text-base mb-1 leading-snug">
                  {cand.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4">{cand.tagline}</p>

                {/* Operational Comparison Grid */}
                <div className="space-y-2 py-3 border-y border-gray-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Setup Time:</span>
                    <span className="font-bold text-gray-900">{cand.setupDays}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Complexity:</span>
                    <span className="font-bold text-gray-900">{cand.operationalComplexity}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Break-even:</span>
                    <span className="font-bold text-emerald-700">{cand.breakevenThreshold}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Labor Supply:</span>
                    <span className="font-bold text-gray-900">{cand.laborAvailability}</span>
                  </div>
                </div>
              </div>

              {/* Selection Radio Control */}
              <div className="pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">
                  {isSelected ? 'Selected' : 'Click to Select'}
                </span>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
