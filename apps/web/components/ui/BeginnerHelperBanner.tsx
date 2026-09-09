'use client';

import React from 'react';
import { HelpCircle, Lightbulb, CheckCircle, Sparkles } from 'lucide-react';

interface BeginnerHelperBannerProps {
  stepNumber: number;
  simpleTitle: string;
  whatToDo: string;
  whyItMatters: string;
}

export const BeginnerHelperBanner: React.FC<BeginnerHelperBannerProps> = ({
  stepNumber,
  simpleTitle,
  whatToDo,
  whyItMatters,
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 rounded-2xl p-5 mb-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-amber-200/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
            {stepNumber}
          </div>
          <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
            Step {stepNumber} of 7 • {simpleTitle}
          </span>
        </div>

        <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800 bg-white/80 px-2.5 py-1 rounded-full border border-amber-200/80">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Super Easy Guide for Everyone</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="flex items-start gap-2 bg-white/75 p-3 rounded-xl border border-amber-200/60">
          <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-amber-950 block mb-0.5">What to do here:</span>
            <span className="text-amber-900 leading-relaxed">{whatToDo}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-white/75 p-3 rounded-xl border border-amber-200/60">
          <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-amber-950 block mb-0.5">Why this helps you:</span>
            <span className="text-amber-900 leading-relaxed">{whyItMatters}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
