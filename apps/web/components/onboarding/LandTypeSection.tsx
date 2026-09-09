'use client';

import React from 'react';
import { LandTypeOption } from '@/types/onboarding';
import { Building2, Sprout, Store, Factory, Home, HelpCircle } from 'lucide-react';

interface LandTypeSectionProps {
  selected: LandTypeOption;
  onChange: (type: LandTypeOption) => void;
}

const LAND_TYPES: { id: LandTypeOption; label: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'agricultural', label: 'Agricultural', desc: 'Farming, crops, livestock, agri-processing', icon: Sprout },
  { id: 'commercial', label: 'Commercial', desc: 'Retail shops, markets, offices, warehouses', icon: Store },
  { id: 'industrial', label: 'Industrial', desc: 'Manufacturing, workshops, processing plants', icon: Factory },
  { id: 'residential', label: 'Residential', desc: 'Housing, homestays, hostels, rental units', icon: Home },
  { id: 'vacant', label: 'Vacant / Open Plot', desc: 'Empty plot ready for new development', icon: Building2 },
  { id: 'not_specified', label: 'Not Specified / Skip', desc: 'Let LAND2BIZ recommend the best land use', icon: HelpCircle },
];

export const LandTypeSection: React.FC<LandTypeSectionProps> = ({ selected, onChange }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">3. What type of land is this?</h2>
        </div>
        <span className="text-xs font-semibold uppercase px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
          Optional
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Tell us what your land is currently used for (or leave blank if unsure).
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {LAND_TYPES.map((item) => {
          const Icon = item.icon;
          const isSelected = selected === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && (
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </div>
              <span className="font-semibold text-gray-900 text-sm mb-1">{item.label}</span>
              <span className="text-xs text-gray-500 leading-tight">{item.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
