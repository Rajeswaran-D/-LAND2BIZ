'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalJourneyIndicator } from '@/components/ui/GlobalJourneyIndicator';
import { BeginnerHelperBanner } from '@/components/ui/BeginnerHelperBanner';
import { DynamicFinanceCalculator } from '@/components/finance/DynamicFinanceCalculator';
import {
  SchemeEligibilityQuestionnaire,
  EligibilityProfile,
} from '@/components/finance/SchemeEligibilityQuestionnaire';
import { GovernmentSchemesGrid } from '@/components/finance/GovernmentSchemesGrid';
import { UdyamAssistanceCard } from '@/components/finance/UdyamAssistanceCard';
import { OnboardingFormData } from '@/types/onboarding';
import { ArrowRight, MapPin, IndianRupee, Sparkles, CheckCircle2 } from 'lucide-react';

export default function FinancePage() {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<OnboardingFormData | null>(null);
  const [userCapital, setUserCapital] = useState<number>(150000);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const [eligibilityProfile, setEligibilityProfile] = useState<EligibilityProfile>({
    gender: 'female',
    ageGroup: '18-35',
    category: 'general',
    incomeRange: '2l_5l',
    education: '8th_10th',
    isFirstTime: 'yes',
  });

  // Load onboarding data and selected business candidate from sessionStorage on mount
  useEffect(() => {
    try {
      const savedOnboarding = sessionStorage.getItem('land2biz_onboarding_data');
      if (savedOnboarding) {
        const parsed: OnboardingFormData = JSON.parse(savedOnboarding);
        setOnboardingData(parsed);
        if (parsed.capital && typeof parsed.capital === 'number' && parsed.capital > 0) {
          setUserCapital(parsed.capital);
        }
      }

      const savedCandidate = sessionStorage.getItem('land2biz_selected_candidate');
      if (savedCandidate) {
        const parsedCand = JSON.parse(savedCandidate);
        setSelectedCandidate(parsedCand);
        const minCap = parsedCand.capitalMin || parsedCand.capital_min_inr || 1500000;
        const maxCap = parsedCand.capitalMax || parsedCand.capital_max_inr || 2500000;
        const avgCost = (minCap + maxCap) / 2;
        const requiredMargin = Math.round(avgCost * 0.10);
        
        // Sync capital to selected business if onboarding capital is not explicitly set
        if (!savedOnboarding || !JSON.parse(savedOnboarding).capital) {
          setUserCapital(requiredMargin);
        }
      } else {
        const savedDecision = sessionStorage.getItem('land2biz_decision_analysis');
        if (savedDecision) {
          const parsedDecision = JSON.parse(savedDecision);
          const top = parsedDecision?.ranking?.[0];
          if (top) {
            setSelectedCandidate(top);
            const minCap = top.capital_min_inr || 1500000;
            const maxCap = top.capital_max_inr || 2500000;
            setUserCapital(Math.round(((minCap + maxCap) / 2) * 0.10));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load onboarding & selected candidate on finance page:', err);
    }
  }, []);

  const handleConfirmProfile = (profile: EligibilityProfile) => {
    setEligibilityProfile(profile);
    setIsSubmitted(true);
  };

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
      <GlobalJourneyIndicator currentStep={6} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Sleek, Professional Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 rounded-2xl p-6 sm:p-8 mb-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-800/60">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Step 5 • Money & Govt Subsidy
            </div>
            <h1 className="text-2xl font-extrabold sm:text-3xl tracking-tight text-white">
              Bank Loan Calculator & Govt Subsidy
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              SIH-baseline EMI from backend data, verified scheme slabs, and MSME guidance.
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
          stepNumber={5}
          simpleTitle="Money & Subsidy"
          whatToDo="Use the slider for SIH-baseline loan math, then match PMEGP/PMFME/MUDRA slabs with your profile."
          whyItMatters="Slabs differ by rural/urban + category — the backend computes the exact matrix."
        />

        {/* Section 1: Live Dynamic Financial Calculator */}
        <DynamicFinanceCalculator initialCapital={userCapital} selectedCandidate={selectedCandidate} />

        {/* Section 2: Demographic & Income Scheme Eligibility Questionnaire */}
        <SchemeEligibilityQuestionnaire
          onConfirmProfile={handleConfirmProfile}
          isSubmitted={isSubmitted}
        />

        {/* Section 3 & 4: Matched Schemes & Udyam (Rendered cleanly after input submission) */}
        {isSubmitted && (
          <div className="space-y-10">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                Eligibility Verified! Matched Government Schemes and Loan Subsidies generated for your profile.
              </span>
            </div>

            <GovernmentSchemesGrid userProfile={eligibilityProfile} />
            <UdyamAssistanceCard />
          </div>
        )}

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
            onClick={() => router.push('/plan')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.99] transition-all order-1 sm:order-2"
          >
            Continue to Risk & Business Plan
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
