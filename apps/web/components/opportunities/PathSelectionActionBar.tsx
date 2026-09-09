'use client';

import React from 'react';
import Link from 'next/link';
import { CandidateBusiness } from './ComparativeCandidatesDeck';
import { Lock, ArrowRight, Wallet, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PathSelectionActionBarProps {
  selectedCandidate: CandidateBusiness;
}

export const PathSelectionActionBar: React.FC<PathSelectionActionBarProps> = ({
  selectedCandidate,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-blue-200 shadow-lg p-6 sm:p-8 mb-12">
      {/* Selected Choice Locked Badge Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-lg text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider block">
              Your Locked Choice for Next Steps
            </span>
            <span className="text-base font-extrabold text-white">
              {selectedCandidate.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold self-start sm:self-auto">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Feasibility Score: {selectedCandidate.suitabilityScore}/100</span>
        </div>
      </div>

      <h3 className="text-center font-extrabold text-gray-900 text-lg sm:text-xl mb-2">
        Choose How You Would Like to Proceed
      </h3>
      <p className="text-center text-xs sm:text-sm text-gray-600 mb-8 max-w-xl mx-auto">
        Select your preferred path to generate your detailed business feasibility report.
      </p>

      {/* Two Path Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Path A: Financial Structuring & Schemes */}
        <div className="bg-gradient-to-b from-blue-50/80 to-white rounded-2xl border-2 border-blue-600 p-6 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase">
                Recommended Path
              </span>
            </div>

            <h4 className="font-extrabold text-blue-950 text-base mb-2">
              Path 1: Financial & Scheme Structuring
            </h4>
            <p className="text-xs text-blue-900/80 mb-6 leading-relaxed">
              Calculate loan EMI, check bank scheme eligibility, claim 35% PMFME govt subsidy, and prepare MSME/Udyam registration.
            </p>
          </div>

          <Link
            href="/finance"
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md shadow-blue-500/20"
          >
            <span>Proceed to Financial Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Path B: Direct Action & Business Plan */}
        <div className="bg-gradient-to-b from-gray-50/80 to-white rounded-2xl border border-gray-300 p-6 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gray-800 text-white rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full uppercase">
                Fast Track
              </span>
            </div>

            <h4 className="font-extrabold text-gray-900 text-base mb-2">
              Path 2: Direct Business Action Plan
            </h4>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Skip loan calculations and proceed directly to risk evaluation, operational milestones, and ground validation checks.
            </p>
          </div>

          <Link
            href="/plan?finance=skipped"
            className="w-full inline-flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 text-sm font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 active:scale-[0.99] transition-all shadow-sm"
          >
            <span>Proceed Directly to Business Plan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
