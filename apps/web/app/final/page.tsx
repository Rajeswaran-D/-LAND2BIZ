'use client';

import { useState, useEffect } from 'react';
import { GlobalJourneyIndicator } from '@/components/ui/GlobalJourneyIndicator';
import { BeginnerHelperBanner } from '@/components/ui/BeginnerHelperBanner';
import { BusinessSpecificGroundCheck } from '@/components/final/BusinessSpecificGroundCheck';
import { FinalPreInvestmentCertificate } from '@/components/final/FinalPreInvestmentCertificate';
import { WhatIfScenarioSimulator } from '@/components/final/WhatIfScenarioSimulator';
import { PostDecisionInteractiveDeck } from '@/components/final/PostDecisionInteractiveDeck';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function FinalPage() {
  const [selectedBusiness, setSelectedBusiness] = useState<string>(
    'Business (select on Opportunities page)'
  );
  const [isFullyVerified, setIsFullyVerified] = useState<boolean>(false);
  const [verifiedCount, setVerifiedCount] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Read the user's selected business candidate from sessionStorage
      const savedCandidate = sessionStorage.getItem('land2biz_selected_candidate');
      if (savedCandidate) {
        try {
          const parsed = JSON.parse(savedCandidate);
          if (parsed.title) {
            setSelectedBusiness(parsed.title);
          }
        } catch (e) {
          console.error('Failed to parse selected candidate', e);
        }
      }

      // Fallback: try decision analysis ranking[0]
      if (!savedCandidate) {
        const savedDecision = sessionStorage.getItem('land2biz_decision_analysis');
        if (savedDecision) {
          try {
            const parsed = JSON.parse(savedDecision);
            const top = parsed?.ranking?.[0];
            if (top?.title || top?.business) {
              setSelectedBusiness(top.title || top.business);
            }
          } catch (e) {}
        }
      }
    }
  }, []);

  const handleVerificationChange = (fullyVerified: boolean, count: number) => {
    setIsFullyVerified(fullyVerified);
    setVerifiedCount(count);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 pb-20">
      <GlobalJourneyIndicator currentStep={8} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Step 7 of 7 • Final Land Business Pass
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Final Land Check & Business Pass
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Confirm 5 simple physical items on your land to get your official business certificate.
            </p>
          </div>

          <Link
            href="/finance"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition-all self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Money & Subsidy
          </Link>
        </div>

        {/* Beginner Helper Banner */}
        <BeginnerHelperBanner
          stepNumber={7}
          simpleTitle="Final Land Certificate"
          whatToDo="Tick only verified ground checks, then take the backend DPR + summary to the bank."
          whyItMatters="Banks decide on documents + math, not on app badges — this summary keeps you honest."
        />

        {/* 1. Business-Specific Ground Verification Checkboxes */}
        <BusinessSpecificGroundCheck
          businessTitle={selectedBusiness}
          onVerificationChange={handleVerificationChange}
        />

        {/* 2. Official Pre-Investment Decision Certificate */}
        <FinalPreInvestmentCertificate
          businessTitle={selectedBusiness}
          isFullyVerified={isFullyVerified}
          verifiedCount={verifiedCount}
        />

        {/* 3. Interactive Post-Decision Action Deck (Modals & Actions) */}
        <PostDecisionInteractiveDeck businessTitle={selectedBusiness} />

        {/* 4. What-If Scenario Simulator */}
        <WhatIfScenarioSimulator />
      </main>
    </div>
  );
}
