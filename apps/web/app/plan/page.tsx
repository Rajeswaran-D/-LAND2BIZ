'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlobalJourneyIndicator } from '@/components/ui/GlobalJourneyIndicator';
import { BeginnerHelperBanner } from '@/components/ui/BeginnerHelperBanner';
import { PlanSuccessScore } from '@/components/plan/PlanSuccessScore';
import { PlanKeyDangers } from '@/components/plan/PlanKeyDangers';
import { NabardBusinessPlanCard } from '@/components/plan/NabardBusinessPlanCard';
import { PostDecisionSupportDeck } from '@/components/plan/PostDecisionSupportDeck';
import { OnboardingFormData } from '@/types/onboarding';
import { CandidateBusiness } from '@/components/opportunities/ComparativeCandidatesDeck';
import { ArrowRight, MapPin, IndianRupee, Sparkles } from 'lucide-react';

function PlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const financeSkipped = searchParams?.get('finance') === 'skipped';

  const [onboardingData, setOnboardingData] = useState<OnboardingFormData | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateBusiness | null>(null);

  // Load onboarding data and selected candidate from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('land2biz_onboarding_data');
      if (saved) {
        setOnboardingData(JSON.parse(saved));
      }

      // Read the user's selected business candidate
      const savedCandidate = sessionStorage.getItem('land2biz_selected_candidate');
      if (savedCandidate) {
        setSelectedCandidate(JSON.parse(savedCandidate));
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
      <GlobalJourneyIndicator currentStep={7} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Sleek, Professional Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 rounded-2xl p-6 sm:p-8 mb-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-800/60">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Step 6 • Simple Business Plan
            </div>
            <h1 className="text-2xl font-extrabold sm:text-3xl tracking-tight text-white">
              Simple Business Plan & Safety Check
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Cost ranges, risks with fixes, and readiness checklist from backend data.
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
          stepNumber={6}
          simpleTitle="Simple Business Plan"
          whatToDo="Review cost ranges, risks, and ground checks before investing."
          whyItMatters="Banks need backend loan math + verified documents, not fixed profit promises."
        />

        {/* Section 1: Readiness checklist */}
        <PlanSuccessScore financeSkipped={financeSkipped} districtName={onboardingData?.fullAddress.district} selectedCandidate={selectedCandidate} />

        {/* Section 2: Specific Key Dangers & Easy Fixes */}
        <PlanKeyDangers selectedCandidate={selectedCandidate} />

        {/* Section 3: NABARD Model Brief Business Plan */}
        <NabardBusinessPlanCard financeSkipped={financeSkipped} selectedCandidate={selectedCandidate} />

        {/* Section 4: Post-Decision Action Options */}
        <PostDecisionSupportDeck />

        {/* Navigation Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-16 border-t border-gray-200/80">
          <button
            type="button"
            onClick={() => router.push('/opportunities')}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-all order-2 sm:order-1"
          >
            &larr; Back to Business Selection
          </button>

          <button
            type="button"
            onClick={() => router.push('/final')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.99] transition-all order-1 sm:order-2"
          >
            Continue to Ground Check & Final Certificate
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Business Plan...</div>}>
      <PlanContent />
    </Suspense>
  );
}
