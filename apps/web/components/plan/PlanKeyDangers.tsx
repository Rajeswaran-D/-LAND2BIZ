'use client';

import React, { useEffect, useState } from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { ShieldAlert, Zap, CloudRain, FileCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { fetchDecisionAnalysis, DecisionAnalysisResponse } from '@/lib/apiClient';
import { CandidateBusiness } from '@/components/opportunities/ComparativeCandidatesDeck';

interface Props {
  selectedCandidate?: CandidateBusiness | null;
}

export const PlanKeyDangers: React.FC<Props> = ({ selectedCandidate }) => {
  const [decision, setDecision] = useState<DecisionAnalysisResponse | null>(null);

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

    return () => {
      live = false;
    };
  }, []);

  // Use selected candidate if available, otherwise fall back to ranking[0]
  const matchFromRanking = selectedCandidate
    ? decision?.ranking?.find((r: any) => r.id === selectedCandidate.id || r.business === selectedCandidate.title)
    : null;
  const top = matchFromRanking || decision?.ranking?.[0];
  const category = selectedCandidate?.category || top?.category || top?.id || 'cold_storage';
  const businessTitle = selectedCandidate?.title || top?.title || top?.business || 'Rural Enterprise';

  // Generate situation-based dangers according to evaluated business category
  const getSituationalDangers = () => {
    if (category.includes('cold') || category.includes('solar')) {
      return [
        {
          title: '1. Electricity Grid Power Cuts',
          icon: Zap,
          color: 'amber',
          risk: 'Unscheduled rural grid outages stop chilling compressor units, causing temperature spikes.',
          fix: 'Mandate hybrid solar-diesel dual generator backup sizing in vendor quotation.',
        },
        {
          title: '2. Monsoon Off-Season Crop Drop',
          icon: CloudRain,
          color: 'blue',
          risk: 'Rainy season reduces fresh horticulture arrivals for cold room storage.',
          fix: 'Diversify storage inventory to multi-season seeds, processed spices, and dairy items.',
        },
        {
          title: '3. Panchayat & Power Board Sanction',
          icon: FileCheck,
          color: 'purple',
          risk: 'Delayed 3-phase commercial electrical line load sanction or local NOC approval.',
          fix: 'Submit official single-window MSME Udyam registration for priority state power connection.',
        },
      ];
    } else if (category.includes('agri') || category.includes('retail')) {
      return [
        {
          title: '1. Seasonal Working Capital Lockup',
          icon: AlertTriangle,
          color: 'amber',
          risk: 'Pre-sowing input demand spikes require cash for seed & fertilizer bulk purchase.',
          fix: 'Utilize PMFME working capital credit line and pre-order from certified wholesale distributors.',
        },
        {
          title: '2. Soil Testing & License Delay',
          icon: FileCheck,
          color: 'blue',
          risk: 'State agriculture department retail fertilizer license approval delays opening.',
          fix: 'Apply early via online TN Agri portal using preliminary Land2Biz site feasibility report.',
        },
        {
          title: '3. Price Fluctuation & Unmapped Competition',
          icon: ShieldAlert,
          color: 'purple',
          risk: 'Unregistered local shandy vendors selling uncertified inputs at lower prices.',
          fix: 'Bundle free digital soil testing reports with every bulk seed purchase to build customer trust.',
        },
      ];
    } else if (category.includes('ev') || category.includes('charging')) {
      return [
        {
          title: '1. Grid Transformer Load Sanction',
          icon: Zap,
          color: 'amber',
          risk: 'Fast DC chargers require dedicated 50kW+ transformer sanction from TANGEDCO.',
          fix: 'Include transformer installation cost in PMEGP capital loan request.',
        },
        {
          title: '2. Highway Traffic Seasonality',
          icon: CloudRain,
          color: 'blue',
          risk: 'Monsoon rains or non-festive months reduce inter-city EV vehicle traffic.',
          fix: 'Partner with local commercial EV auto-rickshaw fleets for guaranteed daily charging revenue.',
        },
        {
          title: '3. Equipment Warranty & Maintenance',
          icon: FileCheck,
          color: 'purple',
          risk: 'High-voltage gun connector wear & tear from public multi-vehicle usage.',
          fix: 'Require 3-year full AMC (Annual Maintenance Contract) with hardware supplier.',
        },
      ];
    } else {
      return [
        {
          title: '1. Power Grid Outages & Voltage Fluctuations',
          icon: Zap,
          color: 'amber',
          risk: 'Unstable rural voltage can damage heavy motor equipment.',
          fix: 'Install automatic servo voltage stabilizer + capacitor bank upfront.',
        },
        {
          title: '2. Raw Material Supply Volatility',
          icon: CloudRain,
          color: 'blue',
          risk: 'Seasonal crop yield fluctuations alter raw material procurement prices.',
          fix: 'Establish direct forward contracts with local farmer Producer Organizations (FPOs).',
        },
        {
          title: '3. FSSAI & Environmental NOC Clearances',
          icon: FileCheck,
          color: 'purple',
          risk: 'Food safety and local pollution board clearances required before commercial operation.',
          fix: 'Apply online through Food Safety Compliance System (FoSCoS) using Udyam MSME certificate.',
        },
      ];
    };
  };

  const dangers = getSituationalDangers();

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 lg:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Situational Risk Analysis
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Key Dangers & Actionable Solutions ({businessTitle})
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Operational risk safeguards tailored for {businessTitle} in {decision?.evidence?.district_baseline?.district || 'this catchment'}.
          </p>
        </div>

        <EvidenceBadge status={decision ? 'VERIFIED_BASELINE' : 'NEEDS_VERIFICATION'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dangers.map((item, idx) => {
          const IconComp = item.icon;
          const bgMap: Record<string, string> = {
            amber: 'bg-amber-50/60 border-amber-200 text-amber-900',
            blue: 'bg-blue-50/60 border-blue-200 text-blue-900',
            purple: 'bg-purple-50/60 border-purple-200 text-purple-900',
          };
          const iconColorMap: Record<string, string> = {
            amber: 'text-amber-600',
            blue: 'text-blue-600',
            purple: 'text-purple-600',
          };

          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border flex flex-col justify-between ${bgMap[item.color] || bgMap.amber}`}
            >
              <div>
                <div className="flex items-center gap-2 font-extrabold text-sm mb-2">
                  <IconComp className={`w-4 h-4 ${iconColorMap[item.color]}`} />
                  <span>{item.title}</span>
                </div>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed font-medium">
                  {item.risk}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-gray-200/90 text-xs shadow-xs">
                <strong className="text-emerald-800 font-extrabold block mb-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Actionable Fix:
                </strong>
                <span className="text-gray-700 font-medium">{item.fix}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

