'use client';

import React from 'react';
import { MessageSquareText } from 'lucide-react';

interface SuggestionsSectionProps {
  suggestions: string;
  onChange: (value: string) => void;
}

export const SuggestionsSection: React.FC<SuggestionsSectionProps> = ({ suggestions, onChange }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-5 h-5 text-amber-600" />
          <h2 className="text-xl font-bold text-gray-900">4. Do you have a specific business in mind?</h2>
        </div>
        <span className="text-xs font-semibold uppercase px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
          Optional
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        If you already have a business idea in mind (like a cold store or dairy farm), write it here:
      </p>

      <div>
        <textarea
          rows={3}
          value={suggestions}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Interested in opening a dairy farm or solar power setup. Seeking low-maintenance business models with government subsidy options..."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
        />
        <p className="text-xs text-gray-400 mt-1">
          Our AI advisor will consider your suggestions during financial structuring and market feasibility analysis.
        </p>
      </div>
    </div>
  );
};
