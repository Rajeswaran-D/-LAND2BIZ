'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlobalJourneyIndicator } from '@/components/ui/GlobalJourneyIndicator';
import { BeginnerHelperBanner } from '@/components/ui/BeginnerHelperBanner';
import { LocationInputSection } from '@/components/onboarding/LocationInputSection';
import { CapitalSection } from '@/components/onboarding/CapitalSection';
import { LandTypeSection } from '@/components/onboarding/LandTypeSection';
import { SuggestionsSection } from '@/components/onboarding/SuggestionsSection';
import {
  OnboardingFormData,
  LocationMode,
  FullAddress,
  GeolocationData,
  LocationLinkData,
  LandTypeOption,
} from '@/types/onboarding';
import { ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();

  const [locationMode, setLocationMode] = useState<LocationMode>('address');
  const [fullAddress, setFullAddress] = useState<FullAddress>({
    doorOrPlotNo: '',
    streetOrVillage: '',
    blockOrTehsil: '',
    district: '',
    state: '',
    pincode: '',
  });
  const [geolocation, setGeolocation] = useState<GeolocationData>({
    latitude: null,
    longitude: null,
    accuracy: null,
    detectedAddress: '',
  });
  const [locationLink, setLocationLink] = useState<LocationLinkData>({
    url: '',
    extractedCoordinates: null,
  });

  const [capital, setCapital] = useState<number | ''>('');
  const [landType, setLandType] = useState<LandTypeOption>('not_specified');
  const [suggestions, setSuggestions] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Restore saved input from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('land2biz_onboarding_data');
      if (saved) {
        const data: OnboardingFormData = JSON.parse(saved);
        if (data.locationMode) setLocationMode(data.locationMode);
        if (data.fullAddress) setFullAddress(data.fullAddress);
        if (data.geolocation) setGeolocation(data.geolocation);
        if (data.locationLink) setLocationLink(data.locationLink);
        if (data.capital !== undefined) setCapital(data.capital);
        if (data.landType) setLandType(data.landType);
        if (data.suggestions) setSuggestions(data.suggestions);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const validateForm = (): boolean => {
    setErrorMsg('');

    // 1. Validate Location
    if (locationMode === 'address') {
      if (!fullAddress.streetOrVillage.trim()) {
        setErrorMsg('Please enter your Street / Village / Area in the address form.');
        return false;
      }
      if (!fullAddress.district.trim()) {
        setErrorMsg('Please enter your District in the address form.');
        return false;
      }
      if (!fullAddress.state.trim()) {
        setErrorMsg('Please enter your State in the address form.');
        return false;
      }
    } else if (locationMode === 'geolocation') {
      if (!geolocation.latitude || !geolocation.longitude) {
        setErrorMsg('Please click "Detect My Location" to capture your GPS coordinates.');
        return false;
      }
    } else if (locationMode === 'link') {
      if (!locationLink.url.trim()) {
        setErrorMsg('Please paste a Google Maps or location link.');
        return false;
      }
    }

    // 2. Validate Capital
    if (capital === '' || isNaN(capital) || capital <= 0) {
      setErrorMsg('Please enter a valid available capital amount (greater than ₹0).');
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const formData: OnboardingFormData = {
      locationMode,
      fullAddress,
      geolocation,
      locationLink,
      capital,
      landType,
      suggestions,
    };

    try {
      sessionStorage.setItem('land2biz_onboarding_data', JSON.stringify(formData));
    } catch (err) {
      console.error('Failed to save onboarding data to sessionStorage:', err);
    }

    // Navigate to next step: Site analysis page (/site)
    router.push('/site');
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <GlobalJourneyIndicator currentStep={2} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        {/* Header Header Banner */}
        <div className="mb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Step 1 • Enter Land & Budget
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Enter Your Land Details & Available Savings
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Tell us where your land is located and how much money you can invest to see top business options for your land.
          </p>
        </div>

        {/* Beginner Helper Banner */}
        <BeginnerHelperBanner
          stepNumber={1}
          simpleTitle="Enter Land & Savings"
          whatToDo="Tell us where your land is located and how much savings you can invest."
          whyItMatters="We check your land's location to calculate which local business will make you the most money."
        />

        {/* Validation Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg text-rose-800 text-sm flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Incomplete Form</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: Location Input */}
          <LocationInputSection
            mode={locationMode}
            onModeChange={setLocationMode}
            fullAddress={fullAddress}
            onAddressChange={setFullAddress}
            geolocation={geolocation}
            onGeolocationChange={setGeolocation}
            locationLink={locationLink}
            onLinkChange={setLocationLink}
          />

          {/* Section 2: Capital Input */}
          <CapitalSection capital={capital} onChange={setCapital} />

          {/* Section 3: Land Type (Optional) */}
          <LandTypeSection selected={landType} onChange={setLandType} />

          {/* Section 4: Suggestions (Optional) */}
          <SuggestionsSection suggestions={suggestions} onChange={setSuggestions} />

          {/* Form Actions / Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-12">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-all order-2 sm:order-1"
            >
              &larr; Back to Home
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-extrabold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 active:scale-[0.99] transition-all disabled:opacity-50 order-1 sm:order-2"
            >
              {isSubmitting ? 'Saving...' : 'Save & Continue to Check Land Site'}
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
