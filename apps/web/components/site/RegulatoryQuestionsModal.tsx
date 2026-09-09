'use client';

import React, { useState } from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { ShieldAlert, FileText, CheckCircle2, XCircle, AlertCircle, ChevronDown, X, Sparkles } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  description: string;
  category: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'na_conversion',
    question: '1. Land Conversion (NA Status)',
    description: 'Is your land converted to Non-Agricultural (NA) status or designated for commercial/industrial use in the local Master Plan?',
    category: 'Zoning & Title',
  },
  {
    id: 'eco_zone',
    question: '2. Environmental & Eco-Sensitivity Clearance',
    description: 'Is the land situated at least 500m away from protected forests, river basins, or eco-sensitive buffer zones?',
    category: 'Environmental',
  },
  {
    id: 'road_frontage',
    question: '3. Road Frontage & Setback Compliance',
    description: 'Does the plot boundary have a direct road frontage of at least 12 meters to allow commercial vehicle entry?',
    category: 'Infrastructure',
  },
  {
    id: 'utility_access',
    question: '4. 3-Phase Power Grid & Industrial Water Access',
    description: 'Is there access to a 3-phase electricity line (11kV/33kV) and a reliable groundwater/piped water connection?',
    category: 'Utilities',
  },
  {
    id: 'local_noc',
    question: '5. Gram Panchayat / Municipal Body NOC',
    description: 'Can local Panchayat or Municipal Corporation No-Objection Certificate (NOC) be obtained for commercial setup?',
    category: 'Local Approvals',
  },
];

export const RegulatoryQuestionsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | 'unsure'>>({
    na_conversion: 'unsure',
    eco_zone: 'yes',
    road_frontage: 'yes',
    utility_access: 'yes',
    local_noc: 'unsure',
  });
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSelectAnswer = (qId: string, val: 'yes' | 'no' | 'unsure') => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  // Compute Regulatory Score & Feasibility Status
  const yesCount = Object.values(answers).filter((v) => v === 'yes').length;
  const noCount = Object.values(answers).filter((v) => v === 'no').length;
  const unsureCount = Object.values(answers).filter((v) => v === 'unsure').length;

  let feasibilityBadgeStatus: 'VERIFIED' | 'ESTIMATED' | 'NEEDS_VERIFICATION' = 'NEEDS_VERIFICATION';
  let feasibilityLabel = 'NEEDS VERIFICATION';
  let feasibilityColor = 'text-amber-700 bg-amber-50 border-amber-200';

  if (yesCount >= 4 && noCount === 0) {
    feasibilityBadgeStatus = 'VERIFIED';
    feasibilityLabel = 'HIGH REGULATORY FEASIBILITY';
    feasibilityColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  } else if (noCount > 1) {
    feasibilityBadgeStatus = 'NEEDS_VERIFICATION';
    feasibilityLabel = 'REGULATORY OBSTACLES DETECTED';
    feasibilityColor = 'text-rose-700 bg-rose-50 border-rose-200';
  } else {
    feasibilityBadgeStatus = 'ESTIMATED';
    feasibilityLabel = 'PRELIMINARY FEASIBLE (VERIFICATION RECOMMENDED)';
    feasibilityColor = 'text-blue-700 bg-blue-50 border-blue-200';
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
      {/* Header Banner Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Regulatory Feasibility Screening
          </div>
          <h2 className="text-xl font-bold text-gray-900">Statutory & Land Clearance Assessment</h2>
          <p className="text-xs text-gray-600 mt-1">
            Preliminary screening for land conversion, environmental clearance, and utility NOCs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <EvidenceBadge status={feasibilityBadgeStatus} />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md hover:from-amber-600 hover:to-amber-700 transition-all"
          >
            <FileText className="w-4 h-4" />
            {isOpen ? 'Close Questions' : 'Regulatory Feasibility Questions'}
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Alert */}
      {!isOpen && (
        <div className={`mt-4 p-4 rounded-xl border ${feasibilityColor} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">Screening Status</span>
              <span className="text-sm font-extrabold">{feasibilityLabel}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-xs font-bold underline hover:no-underline"
          >
            Answer Questions ({yesCount}/5 cleared) &rarr;
          </button>
        </div>
      )}

      {/* Collapsible Questions Panel */}
      {isOpen && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Regulatory Compliance Questionnaire</h3>
              <p className="text-xs text-gray-500">
                Answer these 5 quick questions to determine your site statutory readiness score.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {QUESTIONS.map((q) => {
              const currentAns = answers[q.id];

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-white transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-sm text-gray-900">{q.question}</span>
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded uppercase">
                      {q.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{q.description}</p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(q.id, 'yes')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        currentAns === 'yes'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Yes / Compliant
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(q.id, 'no')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        currentAns === 'no'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-rose-500'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      No / Obstacle
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectAnswer(q.id, 'unsure')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        currentAns === 'unsure'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-amber-500'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      Needs Verification
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Questionnaire Summary & Calculation */}
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-blue-900 uppercase">Assessment Summary</div>
              <div className="text-sm font-extrabold text-blue-950 mt-0.5">
                {yesCount} Compliant · {noCount} Obstacles · {unsureCount} Pending Verification
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Status: <strong>{feasibilityLabel}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSubmitted(true);
                setIsOpen(false);
              }}
              className="bg-blue-600 text-white font-semibold text-xs px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-md"
            >
              Apply Assessment & Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
