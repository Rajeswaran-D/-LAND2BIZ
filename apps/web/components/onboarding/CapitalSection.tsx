'use client';

import React from 'react';
import { IndianRupee } from 'lucide-react';

interface CapitalSectionProps {
  capital: number | '';
  onChange: (value: number | '') => void;
}

const PRESETS = [
  { label: '₹50,000', value: 50000 },
  { label: '₹1 Lakh', value: 100000 },
  { label: '₹5 Lakhs', value: 500000 },
  { label: '₹10 Lakhs', value: 1000000 },
  { label: '₹25 Lakhs', value: 2500000 },
  { label: '₹50 Lakhs', value: 5000000 },
];

export const CapitalSection: React.FC<CapitalSectionProps> = ({ capital, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange('');
    } else {
      const num = parseFloat(val);
      onChange(isNaN(num) ? '' : num);
    }
  };

  const formatCurrencyDisplay = (amount: number | '') => {
    if (amount === '' || isNaN(amount)) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <IndianRupee className="w-5 h-5 text-emerald-600" />
        <h2 className="text-xl font-bold text-gray-900">2. How much money can you invest?</h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Enter the savings amount you can use to start your new business.
      </p>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
          Capital Amount (in ₹ INR) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500 font-semibold text-sm">₹</span>
          <input
            type="number"
            min="0"
            step="1000"
            value={capital}
            onChange={handleInputChange}
            placeholder="e.g. 150000"
            className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-base font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            required
          />
        </div>
        {typeof capital === 'number' && capital > 0 && (
          <p className="text-xs font-semibold text-emerald-700 mt-1.5">
            Formatted: {formatCurrencyDisplay(capital)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
          Quick Preset Amounts:
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                capital === preset.value
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
