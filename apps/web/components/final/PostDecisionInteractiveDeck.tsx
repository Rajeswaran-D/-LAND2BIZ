'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  FileDown,
  PhoneCall,
  X,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Zap,
  Award,
  Download,
} from 'lucide-react';

interface PostDecisionInteractiveDeckProps {
  businessTitle: string;
}

export const PostDecisionInteractiveDeck: React.FC<PostDecisionInteractiveDeckProps> = ({
  businessTitle,
}) => {
  const [activeModal, setActiveModal] = useState<'msme' | 'dpr' | 'vendors' | null>(null);
  const [quoteSent, setQuoteSent] = useState<boolean>(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 lg:p-8 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-extrabold uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Next Steps After Approval
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Simple Next Steps to Start Your Business
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Click any box below to open simple guides, download bank papers, or contact machine suppliers.
          </p>
        </div>
      </div>

      {/* 3 Interactive Cards with Super Simple Titles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Udyam MSME Registration */}
        <div className="p-5 rounded-2xl border border-blue-200/80 bg-blue-50/40 hover:bg-blue-50/80 transition-all flex flex-col justify-between space-y-4 shadow-sm group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                1
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase">
                Free Govt Certificate
              </span>
            </div>

            <h3 className="font-extrabold text-base text-gray-900 group-hover:text-blue-700 transition-colors">
              1. Get Free Business Paper (MSME)
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Register free online in 5 minutes using Aadhaar to get 35% government money subsidy back.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal('msme')}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            <span>Open MSME Guide & Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Submit DPR to Bank Manager */}
        <div className="p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50/80 transition-all flex flex-col justify-between space-y-4 shadow-sm group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                2
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                Bank Report Draft
              </span>
            </div>

            <h3 className="font-extrabold text-base text-gray-900 group-hover:text-emerald-700 transition-colors">
              2. Download Bank Report for Loan
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Download the official bank report to show your bank manager for quick loan approval.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal('dpr')}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Open & Download Bank Report</span>
          </button>
        </div>

        {/* Card 3: Order Equipment & Install */}
        <div className="p-5 rounded-2xl border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50/80 transition-all flex flex-col justify-between space-y-4 shadow-sm group">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                3
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                Trusted Suppliers
              </span>
            </div>

            <h3 className="font-extrabold text-base text-gray-900 group-hover:text-amber-700 transition-colors">
              3. Contact Machine Suppliers
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              See government approved solar & cold room suppliers with 5-year warranty and phone numbers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveModal('vendors')}
            className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Open Supplier Contacts</span>
          </button>
        </div>
      </div>

      {/* ================= MODAL 1: UDYAM MSME REGISTRATION ================= */}
      {activeModal === 'msme' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  Government Business Paper
                </span>
                <h3 className="text-xl font-extrabold text-gray-900">
                  Easy MSME Registration Guide
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs text-gray-700">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                <div className="font-bold text-blue-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Why is this paper needed?
                </div>
                <p className="leading-relaxed text-blue-950">
                  This government paper proves you are running a small business so banks can give you 35% government money back (subsidy). It is 100% free.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-gray-900 text-sm">Keep these ready:</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <li className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Aadhaar Card (with mobile number)</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>PAN Card</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Bank Passbook</span>
                  </li>
                  <li className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Business Code: <strong>52101</strong> (Cold Storage)</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-gray-900 text-sm">Simple Steps:</h4>
                <ol className="space-y-2 list-decimal list-inside text-gray-600 leading-relaxed">
                  <li>Click the button below to visit <strong>udyamregistration.gov.in</strong>.</li>
                  <li>Click <strong>&quot;For New Business Registration&quot;</strong>.</li>
                  <li>Enter your Aadhaar number & Name, then enter the OTP received on your mobile.</li>
                  <li>Select Business Code <code>52101</code> for Cold Storage.</li>
                  <li>Submit to download your official government certificate immediately.</li>
                </ol>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-100">
              <a
                href="https://udyamregistration.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
              >
                <span>Open Free Govt Registration Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full sm:w-auto text-gray-600 font-bold text-xs px-5 py-3 rounded-xl hover:bg-gray-100"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: SUBMIT DPR TO BANK MANAGER ================= */}
      {activeModal === 'dpr' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Bank Paperwork Package
                </span>
                <h3 className="text-xl font-extrabold text-gray-900">
                  Official Bank Project Report & Bank Contacts
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs text-gray-700">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                <div className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  NABARD Model Format Report Included
                </div>
                <p className="leading-relaxed text-emerald-950">
                  This report shows complete income calculations, machine costs, and 35% government subsidy details formatted for bank loan officers.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-gray-900 text-sm">Recommended Local Banks:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" /> State Bank of India (SBI)
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">Scheme: PMFME Agri Infra Fund (3% Interest discount)</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-600" /> Bank of Baroda
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">Scheme: Stand-Up India for Women / PMEGP (35% Subsidy)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-gray-900 text-sm">What to take to the bank:</h4>
                <ul className="space-y-1.5 text-gray-600 list-disc list-inside">
                  <li>Downloaded LAND2BIZ Certificate & Bank Report (PDF)</li>
                  <li>Land title paper or 10-year lease paper</li>
                  <li>Udyam MSME Registration Paper</li>
                  <li>Identity card & bank passbook</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => alert(`Official Bank DPR Package for "${businessTitle}" downloaded!`)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition-all shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download Bank Report (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-full sm:w-auto text-gray-600 font-bold text-xs px-5 py-3 rounded-xl hover:bg-gray-100"
              >
                Close Box
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: ORDER EQUIPMENT & INSTALL ================= */}
      {activeModal === 'vendors' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 space-y-6 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Approved Machine Sellers
                </span>
                <h3 className="text-xl font-extrabold text-gray-900">
                  Solar & Cold Storage Machine Sellers
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs text-gray-700">
              <p className="text-gray-600 leading-relaxed">
                Contact official government approved machine makers for 15 ton cold room units with solar panels and 5-year warranty with free delivery.
              </p>

              {/* Vendor List */}
              <div className="space-y-3">
                {/* Vendor 1 */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-gray-900">EcoZen Solar Cold Storage</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Govt Approved
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    15 Ton Solar Cold Room (15 kW Solar Panels, 5-Year Warranty)
                  </p>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60">
                    <span className="font-extrabold text-gray-900">Price: ₹16,50,000</span>
                    <span className="text-blue-700 font-bold">📞 +91 98230 11220</span>
                  </div>
                </div>

                {/* Vendor 2 */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-gray-900">Tata Power Solar Agri Solutions</h4>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                      Top Brand
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    15 kW Solar Panels & Insulated Cold Storage Room
                  </p>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60">
                    <span className="font-extrabold text-gray-900">Price: ₹18,00,000</span>
                    <span className="text-blue-700 font-bold">📞 1800-209-8282</span>
                  </div>
                </div>
              </div>

              {/* Instant Quote Request */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                <div className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Ask Suppliers to Call You:
                </div>

                {quoteSent ? (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Request sent to both machine makers! They will call you within 24 hours.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setQuoteSent(true)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    Request Both Suppliers to Call Me for Best Discount
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-600 font-bold text-xs px-5 py-3 rounded-xl hover:bg-gray-100"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
