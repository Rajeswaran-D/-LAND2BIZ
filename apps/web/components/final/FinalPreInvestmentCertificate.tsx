'use client';

import React from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { Award, CheckCircle2, Download, Landmark, Lock, ShieldCheck, Sparkles } from 'lucide-react';

interface FinalPreInvestmentCertificateProps {
  businessTitle: string;
  isFullyVerified: boolean;
  verifiedCount: number;
}

export const FinalPreInvestmentCertificate: React.FC<FinalPreInvestmentCertificateProps> = ({
  businessTitle,
  isFullyVerified,
  verifiedCount,
}) => {
  const calculatedScore = Math.round(70 + (verifiedCount / 5) * 22); // Range 70 -> 92

  return (
    <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 lg:p-10 shadow-2xl mb-12 border-4 border-emerald-600/40 relative overflow-hidden">
      {/* Background Decorative Shield watermark */}
      <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
        <ShieldCheck className="w-80 h-80 text-blue-400" />
      </div>

      {/* Certificate Header Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Official Business Approval Certificate
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Land Business Pass Certificate
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Official certificate showing your land score, profit potential, and subsidy eligibility.
          </p>
        </div>

        <div className="text-left sm:text-right bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
          <span className="text-[10px] text-slate-300 font-bold uppercase block">Land Rating Score</span>
          <span className="text-3xl font-black text-emerald-400">{calculatedScore} / 100</span>
          <span className="text-xs font-bold text-emerald-300 block mt-0.5">
            {isFullyVerified ? '100% READY FOR BUSINESS' : `${verifiedCount}/5 Checks Done`}
          </span>
        </div>
      </div>

      {/* Selected Business Choice Display */}
      <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 mb-8 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Your Selected Project
          </span>
          <EvidenceBadge status={isFullyVerified ? 'VERIFIED' : 'NEEDS_VERIFICATION'} />
        </div>

        <h3 className="text-2xl font-black text-white">{businessTitle}</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Money Needed to Start</span>
            <span className="font-extrabold text-emerald-400">₹15L – 22L</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Net Monthly Profit</span>
            <span className="font-extrabold text-emerald-400">₹75,000 / month</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Govt Subsidy</span>
            <span className="font-extrabold text-amber-300">35% Money Back</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Money Back Time</span>
            <span className="font-extrabold text-blue-300">1.8 Years</span>
          </div>
        </div>
      </div>

      {/* Decision Summary Points */}
      <div className="space-y-3 mb-8 text-xs text-slate-200">
        <h4 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Why This Business Fits Your Land:
        </h4>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <li className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
            <span><strong>Great Road Location:</strong> 100m distance from main highway.</span>
          </li>
          <li className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
            <span><strong>High Local Need:</strong> 0 cold storage units exist within 15 km.</span>
          </li>
          <li className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
            <span><strong>Government Help:</strong> Eligible for 35% PMFME subsidy money back.</span>
          </li>
          <li className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
            <span><strong>Fast Return:</strong> Full setup cost recovered in under 2 years.</span>
          </li>
        </ul>
      </div>

      {/* Certificate Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          onClick={() => alert(`Pre-Investment Decision Certificate for "${businessTitle}" downloaded!`)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 text-slate-950 font-extrabold text-xs px-6 py-3.5 rounded-xl hover:bg-emerald-400 active:scale-[0.99] transition-all shadow-lg shadow-emerald-500/25"
        >
          <Download className="w-4 h-4" />
          <span>Download Official Land Certificate (PDF)</span>
        </button>

        <a
          href="/finance"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 font-bold text-xs px-6 py-3.5 rounded-xl hover:bg-white/20 active:scale-[0.99] transition-all"
        >
          <Landmark className="w-4 h-4 text-amber-400" />
          <span>Apply for Bank Loan & 35% Subsidy</span>
        </a>
      </div>
    </div>
  );
};
