'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalJourneyIndicator } from '@/components/ui/GlobalJourneyIndicator';
import { BeginnerHelperBanner } from '@/components/ui/BeginnerHelperBanner';
import {
  ComparativeCandidatesDeck,
  CandidateBusiness,
} from '@/components/opportunities/ComparativeCandidatesDeck';
import { EmpiricalDecisionEngine } from '@/components/opportunities/EmpiricalDecisionEngine';
import { PathSelectionActionBar } from '@/components/opportunities/PathSelectionActionBar';
import { OnboardingFormData } from '@/types/onboarding';
import { MapPin, IndianRupee, Sparkles } from 'lucide-react';

export default function OpportunitiesPage() {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingFormData | null>(null);

  const [selectedCandidate, setSelectedCandidate] = useState<CandidateBusiness | null>(null);

  // Load onboarding data from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('land2biz_onboarding_data');
      if (saved) {
        setOnboardingData(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load onboarding data:', err);
    }
  }, []);

  const formatCapitalDisplay = (amount?: number | '') => {
    if (!amount || typeof amount !== 'number') return 'Not Specified';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <GlobalJourneyIndicator currentStep={5} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 rounded-2xl p-6 sm:p-8 mb-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-800/60">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Step 4 • Pick Best Business Choice
            </div>
            <h1 className="text-2xl font-extrabold sm:text-3xl tracking-tight text-white">
              Pick The Best Business For Your Land
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Compare cost ranges side-by-side from backend data and pick one to carry forward.
            </p>
          </div>

          {/* User Input Summary Badge */}
          {onboardingData && (
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 text-xs space-y-2 min-w-[210px]">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="truncate max-w-[160px]">
                  {onboardingData.locationMode === 'address'
                    ? onboardingData.fullAddress.district || 'Custom Location'
                    : onboardingData.locationMode === 'geolocation'
                    ? 'GPS Location'
                    : 'Location Link'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <IndianRupee className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Capital: {formatCapitalDisplay(onboardingData.capital)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Beginner Helper Banner */}
        <BeginnerHelperBanner
          stepNumber={4}
          simpleTitle="Pick Best Choice"
          whatToDo="Click the card that fits your capital and utilities to carry it forward."
          whyItMatters="Your pick flows into loan math and ground checks — ranges stay estimates until verified."
        />

        {/* Section 1: Comparative Evaluation Candidates Deck */}
        <ComparativeCandidatesDeck
          selectedId={selectedCandidate?.id || ''}
          onSelect={(cand) => setSelectedCandidate(cand)}
        />

        {selectedCandidate && (
          <>
            <EmpiricalDecisionEngine candidate={selectedCandidate} />
            <PathSelectionActionBar selectedCandidate={selectedCandidate} />
          </>
        )}
      </main>
    </div>
  );
}
