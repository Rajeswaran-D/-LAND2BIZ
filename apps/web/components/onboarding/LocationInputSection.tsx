'use client';

import React, { useState } from 'react';
import { LocationMode, FullAddress, GeolocationData, LocationLinkData } from '@/types/onboarding';
import { MapPin, Navigation, Link as LinkIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface LocationInputSectionProps {
  mode: LocationMode;
  onModeChange: (mode: LocationMode) => void;
  fullAddress: FullAddress;
  onAddressChange: (address: FullAddress) => void;
  geolocation: GeolocationData;
  onGeolocationChange: (geo: GeolocationData) => void;
  locationLink: LocationLinkData;
  onLinkChange: (linkData: LocationLinkData) => void;
}

export const LocationInputSection: React.FC<LocationInputSectionProps> = ({
  mode,
  onModeChange,
  fullAddress,
  onAddressChange,
  geolocation,
  onGeolocationChange,
  locationLink,
  onLinkChange,
}) => {
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [geoErrorMsg, setGeoErrorMsg] = useState<string>('');

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setGeoErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('loading');
    setGeoErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        onGeolocationChange({
          latitude: lat,
          longitude: lng,
          accuracy: Math.round(accuracy),
          detectedAddress: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)} (±${Math.round(accuracy)}m)`,
        });
        setGeoStatus('success');
      },
      (error) => {
        setGeoStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoErrorMsg('Location permission denied. Please allow location access or choose another input method.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoErrorMsg('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setGeoErrorMsg('The request to get user location timed out.');
            break;
          default:
            setGeoErrorMsg('An unknown error occurred while retrieving location.');
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleUrlInputChange = (url: string) => {
    // Attempt basic coordinate extraction from Google Maps URL format (e.g. @12.9716,77.5946)
    let extracted: { lat: number; lng: number } | null = null;
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      extracted = { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    onLinkChange({
      url,
      extractedCoordinates: extracted,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">1. Where is your land located?</h2>
      </div>
      <p className="text-sm text-gray-600 mb-5">
        Pick how you want to tell us where your land is:
      </p>

      {/* Segmented Control / Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg mb-6 text-sm font-medium">
        <button
          type="button"
          onClick={() => onModeChange('address')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md transition-all ${
            mode === 'address'
              ? 'bg-white text-blue-700 shadow-sm font-semibold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Full Address
        </button>

        <button
          type="button"
          onClick={() => onModeChange('geolocation')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md transition-all ${
            mode === 'geolocation'
              ? 'bg-white text-blue-700 shadow-sm font-semibold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Navigation className="w-4 h-4" />
          Location Access
        </button>

        <button
          type="button"
          onClick={() => onModeChange('link')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-md transition-all ${
            mode === 'link'
              ? 'bg-white text-blue-700 shadow-sm font-semibold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Location Link
        </button>
      </div>

      {/* Tab 1: Full Address */}
      {mode === 'address' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Door / Plot No. (Optional)
              </label>
              <input
                type="text"
                value={fullAddress.doorOrPlotNo || ''}
                onChange={(e) => onAddressChange({ ...fullAddress, doorOrPlotNo: e.target.value })}
                placeholder="e.g. Plot No. 42 / Survey No. 108"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Street / Village / Area <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullAddress.streetOrVillage}
                onChange={(e) => onAddressChange({ ...fullAddress, streetOrVillage: e.target.value })}
                placeholder="e.g. Rampur Village / GT Road"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Block / Tehsil / Sub-district
              </label>
              <input
                type="text"
                value={fullAddress.blockOrTehsil || ''}
                onChange={(e) => onAddressChange({ ...fullAddress, blockOrTehsil: e.target.value })}
                placeholder="e.g. Sadar Tehsil"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                District <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullAddress.district}
                onChange={(e) => onAddressChange({ ...fullAddress, district: e.target.value })}
                placeholder="e.g. Varanasi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullAddress.state}
                onChange={(e) => onAddressChange({ ...fullAddress, state: e.target.value })}
                placeholder="e.g. Uttar Pradesh"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Pincode (Optional)
              </label>
              <input
                type="text"
                value={fullAddress.pincode || ''}
                onChange={(e) => onAddressChange({ ...fullAddress, pincode: e.target.value })}
                placeholder="e.g. 221001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Geolocation Access */}
      {mode === 'geolocation' && (
        <div className="space-y-4 text-center py-4">
          <div className="max-w-md mx-auto p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50">
            <Navigation className="w-10 h-10 text-blue-600 mx-auto mb-2 animate-pulse" />
            <h3 className="font-semibold text-gray-900 mb-1">Auto-Detect Current Location</h3>
            <p className="text-xs text-gray-500 mb-4">
              Click below to share your current GPS coordinates. We will use this to pinpoint your land area.
            </p>

            <button
              type="button"
              onClick={handleFetchLocation}
              disabled={geoStatus === 'loading'}
              className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {geoStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Acquiring GPS Signal...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Detect My Location
                </>
              )}
            </button>

            {geoStatus === 'success' && geolocation.latitude && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium text-left flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Location Detected Successfully!</p>
                  <p className="mt-0.5 text-emerald-700">
                    Latitude: {geolocation.latitude.toFixed(6)}, Longitude: {geolocation.longitude?.toFixed(6)}
                    {geolocation.accuracy ? ` (Accuracy: ~${geolocation.accuracy}m)` : ''}
                  </p>
                </div>
              </div>
            )}

            {geoStatus === 'error' && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Failed to get location</p>
                  <p className="mt-0.5">{geoErrorMsg}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Location Link */}
      {mode === 'link' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Google Maps or Location Link <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="url"
                value={locationLink.url}
                onChange={(e) => handleUrlInputChange(e.target.value)}
                placeholder="e.g. https://maps.app.goo.gl/xyz or https://maps.google.com/?q=25.3176,82.9739"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Copy and paste a shared link from Google Maps, Apple Maps, or OpenStreetMap.
            </p>
          </div>

          {locationLink.extractedCoordinates && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                Coordinates parsed from link: <strong>{locationLink.extractedCoordinates.lat}</strong>, <strong>{locationLink.extractedCoordinates.lng}</strong>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
