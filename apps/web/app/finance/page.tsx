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
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const [eligibilityProfile, setEligibilityProfile] = useState<EligibilityProfile>({
    gender: 'female',
    ageGroup: '18-35',
    category: 'general',
    incomeRange: '2l_5l',
    education: '8th_10th',
    isFirstTime: 'yes',
  });

  // Load onboarding data from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('land2biz_onboarding_data');
      if (saved) {
        const parsed: OnboardingFormData = JSON.parse(saved);
        setOnboardingData(parsed);
        if (parsed.capital && typeof parsed.capital === 'number' && parsed.capital > 0) {
          setUserCapital(parsed.capital);
        }
      }
    } catch (err) {
      console.error('Failed to load onboarding data:', err);
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
              Calculate bank loan EMI, see 35% government money back schemes, and get free MSME help.
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
          whatToDo="Use the slider to see bank loan amounts, monthly EMI, and fill in your details to get 35% government money back."
          whyItMatters="Women entrepreneurs, rural landowners, and SC/ST categories get up to 35% government subsidy money back."
        />

        {/* Section 1: Live Dynamic Financial Calculator */}
        <DynamicFinanceCalculator initialCapital={userCapital} />

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
