'use client';

import React from 'react';
import { FileCheck, CheckCircle2, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export const UdyamAssistanceCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 sm:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileCheck className="w-3.5 h-3.5" /> Govt MSME Registration
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Udyam (MSME) Registration Guide
          </h2>
        </div>
        <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
          Free Govt Registration
        </span>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
        Udyam Registration is the official Indian Government MSME certificate needed to get bank loans, 35% scheme subsidies, and electricity discounts.
      </p>

      {/* 2 Side-by-Side Preparation Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Box 1: LAND2BIZ Prepares */}
        <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
          <h3 className="font-extrabold text-blue-950 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            1. Information LAND2BIZ Prepares for You
          </h3>

          <ul className="space-y-2 text-xs text-blue-900">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span><strong>NIC Code Classification:</strong> Category 1030 (Food/Agri Processing).</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span><strong>Project Investment Estimate:</strong> Plant & Machinery cost breakdown.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span><strong>Turnover Declaration:</strong> Initial 1st-year projected revenue.</span>
            </li>
          </ul>
        </div>

        {/* Box 2: What You Need to Keep Ready */}
        <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
          <h3 className="font-extrabold text-amber-950 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            2. Documents You Need to Keep Ready
          </h3>

          <ul className="space-y-2 text-xs text-amber-900">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              <span><strong>Aadhaar Card:</strong> Linked to your mobile number for OTP.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              <span><strong>PAN Card:</strong> Business or personal owner PAN details.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
              <span><strong>Bank Account:</strong> Account number & IFSC code for subsidy deposit.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Official Direct Portal Button */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-xs text-gray-700 font-semibold">
            Official Govt Portal is 100% Free. Never pay money to private middleman sites.
          </span>
        </div>

        <a
          href="https://udyamregistration.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm"
        >
          <span>Open Official Udyam Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
