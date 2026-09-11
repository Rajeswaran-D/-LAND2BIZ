'use client';

import React, { useState } from 'react';
import { UserCheck, ShieldCheck, CheckCircle2, ArrowRight, HeartHandshake } from 'lucide-react';

export interface EligibilityProfile {
  gender: 'female' | 'male' | 'other';
  ageGroup: '18-35' | '35-50' | '50+';
  category: 'general' | 'obc' | 'sc_st' | 'minority';
  incomeRange: 'under_2l' | '2l_5l' | '5l_10l' | 'above_10l';
  education: 'below_8th' | '8th_10th' | 'graduate';
  isFirstTime: 'yes' | 'no';
}

interface SchemeEligibilityQuestionnaireProps {
  onConfirmProfile: (profile: EligibilityProfile) => void;
  isSubmitted: boolean;
}

export const SchemeEligibilityQuestionnaire: React.FC<SchemeEligibilityQuestionnaireProps> = ({
  onConfirmProfile,
  isSubmitted,
}) => {
  const [profile, setProfile] = useState<EligibilityProfile>({
    gender: 'female',
    ageGroup: '18-35',
    category: 'general',
    incomeRange: '2l_5l',
    education: '8th_10th',
    isFirstTime: 'yes',
  });

  const handleChange = <K extends keyof EligibilityProfile>(field: K, value: EligibilityProfile[K]) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmProfile(profile);
  };

  const isWomenOrSpecial = profile.gender === 'female' || profile.category !== 'general';

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200/90 shadow-sm p-6 lg:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-blue-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-bold uppercase tracking-wider mb-1">
            <UserCheck className="w-3.5 h-3.5" /> Check Government Discount
          </div>
          <h2 className="text-xl font-extrabold text-blue-950 tracking-tight">
            Tell Us A Bit About Yourself For Extra Govt Discounts
          </h2>
          <p className="text-xs text-blue-900/80 mt-1">
            Tell us your gender, category, and age so we can get you up to 35% government money back.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 bg-white text-emerald-800 shadow-sm self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Personalized Scheme Match</span>
        </div>
      </div>

      <form onSubmit={handleFormSubmit}>
        {/* 6 Essential Input Questions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {/* 1. Gender */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.gender}
              onChange={(e) => handleChange('gender', e.target.value as EligibilityProfile['gender'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="female">Female / Woman Entrepreneur (35% Subsidy + Priority)</option>
              <option value="male">Male / Man Entrepreneur</option>
              <option value="other">Third Gender / Transgender</option>
            </select>
          </div>

          {/* 2. Category / Caste */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Category / Social Group <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.category}
              onChange={(e) => handleChange('category', e.target.value as EligibilityProfile['category'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="general">General Category</option>
              <option value="obc">OBC Category (35% Subsidy)</option>
              <option value="sc_st">SC / ST Category (35% Subsidy)</option>
              <option value="minority">Minority Category (35% Subsidy)</option>
            </select>
          </div>

          {/* 3. Age Group */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Age Group <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.ageGroup}
              onChange={(e) => handleChange('ageGroup', e.target.value as EligibilityProfile['ageGroup'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="18-35">18 – 35 Years (Youth Priority)</option>
              <option value="35-50">35 – 50 Years</option>
              <option value="50+">50+ Years</option>
            </select>
          </div>

          {/* 4. Annual Income */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Annual Family Income <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.incomeRange}
              onChange={(e) => handleChange('incomeRange', e.target.value as EligibilityProfile['incomeRange'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="under_2l">Under ₹2 Lakhs (EWS Priority)</option>
              <option value="2l_5l">₹2 Lakhs – ₹5 Lakhs</option>
              <option value="5l_10l">₹5 Lakhs – ₹10 Lakhs</option>
              <option value="above_10l">Above ₹10 Lakhs</option>
            </select>
          </div>

          {/* 5. Education */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Highest Education <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.education}
              onChange={(e) => handleChange('education', e.target.value as EligibilityProfile['education'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="8th_10th">8th Pass / 10th / 12th</option>
              <option value="graduate">Graduate / Diploma</option>
              <option value="below_8th">Below 8th Pass</option>
            </select>
          </div>

          {/* 6. First Time Business */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              First-Time Business Owner? <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.isFirstTime}
              onChange={(e) => handleChange('isFirstTime', e.target.value as EligibilityProfile['isFirstTime'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="yes">Yes (First-Time Entrepreneur)</option>
              <option value="no">No (Existing Business Expansion)</option>
            </select>
          </div>
        </div>

        {/* Women Special Advantage Highlight Banner */}
        {profile.gender === 'female' && (
          <div className="mb-4 p-3 bg-purple-100/80 border border-purple-300 rounded-xl text-purple-950 text-xs font-bold flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-purple-700 flex-shrink-0" />
            <span>
              <strong>Women Entrepreneur Advantages Applied:</strong> 35% PMEGP Rural Subsidy + Unlocked Stand-Up India Collateral-Free Loans!
            </span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-blue-900 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Target Subsidy Rate: <strong>{isWomenOrSpecial ? '35% Special / Women Category Subsidy' : '25% Rural Subsidy'}</strong>
            </span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 active:scale-[0.99] transition-all"
          >
            <span>{isSubmitted ? 'Update & Recalculate Schemes' : 'Find Eligible Govt Schemes & Loan Subsidies'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
