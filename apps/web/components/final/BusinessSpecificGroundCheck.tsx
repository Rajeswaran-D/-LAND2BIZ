'use client';

import React, { useState } from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { MapPin, Truck, Zap, Droplets, Users, FileCheck, ShieldAlert } from 'lucide-react';

export interface GroundCheckState {
  roadAccess: boolean;
  powerAndSolar: boolean;
  waterAndSoil: boolean;
  farmerDemand: boolean;
  documentsReady: boolean;
}

interface BusinessSpecificGroundCheckProps {
  businessTitle: string;
  onVerificationChange: (isFullyVerified: boolean, verifiedCount: number) => void;
}

export const BusinessSpecificGroundCheck: React.FC<BusinessSpecificGroundCheckProps> = ({
  businessTitle,
  onVerificationChange,
}) => {
  const [checks, setChecks] = useState<GroundCheckState>({
    roadAccess: false,
    powerAndSolar: false,
    waterAndSoil: false,
    farmerDemand: false,
    documentsReady: false,
  });

  const toggleCheck = (key: keyof GroundCheckState) => {
    const updated = { ...checks, [key]: !checks[key] };
    setChecks(updated);

    const count = Object.values(updated).filter(Boolean).length;
    onVerificationChange(count === 5, count);
  };

  const verifiedCount = Object.values(checks).filter(Boolean).length;
  const isFullyVerified = verifiedCount === 5;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 lg:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-extrabold uppercase tracking-wider mb-1">
            <MapPin className="w-3.5 h-3.5" /> Physical Land Checklist
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            5 Real-World Checks for &quot;{businessTitle}&quot;
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Tick only what you personally verified on ground. Unchecked = not claimed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl">
            {verifiedCount} / 5 Land Checks Done
          </span>
          <EvidenceBadge status={isFullyVerified ? 'VERIFIED' : 'NEEDS_VERIFICATION'} />
        </div>
      </div>

      {!isFullyVerified && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl mb-6 flex items-center gap-3 font-semibold">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            Ground checks incomplete ({verifiedCount}/5 checked). Please check all 5 items to get your 100% complete certificate.
          </span>
        </div>
      )}

      {/* 5 Business-Specific Checkboxes with Super Simple Everyday Titles */}
      <div className="space-y-4">
        {/* Check 1 */}
        <label
          onClick={() => toggleCheck('roadAccess')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
            checks.roadAccess
              ? 'border-emerald-200 bg-emerald-50/40 shadow-sm'
              : 'border-gray-200 bg-gray-50 hover:bg-white'
          }`}
        >
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={checks.roadAccess}
              onChange={() => {}}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>1. Wide Road for Supply Trucks</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Measured road frontage and truck entry in person — do not rely on map text.
            </p>
          </div>
        </label>

        {/* Check 2 */}
        <label
          onClick={() => toggleCheck('powerAndSolar')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
            checks.powerAndSolar
              ? 'border-emerald-200 bg-emerald-50/40 shadow-sm'
              : 'border-gray-200 bg-gray-50 hover:bg-white'
          }`}
        >
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={checks.powerAndSolar}
              onChange={() => {}}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>2. Power Line & Open Solar Roof Area</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Confirmed sanctioned power load + backup sizing from vendor quote.
            </p>
          </div>
        </label>

        {/* Check 3 */}
        <label
          onClick={() => toggleCheck('waterAndSoil')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
            checks.waterAndSoil
              ? 'border-emerald-200 bg-emerald-50/40 shadow-sm'
              : 'border-gray-200 bg-gray-50 hover:bg-white'
          }`}
        >
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={checks.waterAndSoil}
              onChange={() => {}}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Droplets className="w-4 h-4 text-cyan-600" />
              <span>3. Good Water Supply & Solid Ground</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Confirmed water source and soil/load-bearing suitability with local engineer.
            </p>
          </div>
        </label>

        {/* Check 4 */}
        <label
          onClick={() => toggleCheck('farmerDemand')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
            checks.farmerDemand
              ? 'border-emerald-200 bg-emerald-50/40 shadow-sm'
              : 'border-gray-200 bg-gray-50 hover:bg-white'
          }`}
        >
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={checks.farmerDemand}
              onChange={() => {}}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <Users className="w-4 h-4 text-purple-600" />
              <span>4. Local Farmers Ready to Store Crops</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Spoke to nearby buyers/farmers and visited competitors — note names, prices, volumes.
            </p>
          </div>
        </label>

        {/* Check 5 */}
        <label
          onClick={() => toggleCheck('documentsReady')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
            checks.documentsReady
              ? 'border-emerald-200 bg-emerald-50/40 shadow-sm'
              : 'border-gray-200 bg-gray-50 hover:bg-white'
          }`}
        >
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={checks.documentsReady}
              onChange={() => {}}
              className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <span>5. Land Papers + Scheme Circular Checked</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Land title, Aadhaar/PAN, Udyam details ready; current scheme circular checked on official portal + bank.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};
