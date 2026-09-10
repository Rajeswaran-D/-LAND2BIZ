'use client';

import React from 'react';
import { EvidenceBadge } from '@/components/ui/EvidenceBadge';
import { MapPin, Navigation, ExternalLink, ShieldCheck } from 'lucide-react';
import { OnboardingFormData } from '@/types/onboarding';

interface SiteMapPreviewProps {
  onboardingData: OnboardingFormData | null;
  suitabilityScore?: number;
}

export const SiteMapPreview: React.FC<SiteMapPreviewProps> = ({
  onboardingData,
  suitabilityScore,
}) => {
  let locationDisplayText = 'Enter district or share GPS to preview location';
  let lat: number | null = null;
  let lng: number | null = null;

  if (onboardingData) {
    if (onboardingData.locationMode === 'address') {
      const addr = onboardingData.fullAddress;
      const parts = [addr.doorOrPlotNo, addr.streetOrVillage, addr.blockOrTehsil, addr.district, addr.state]
        .filter(Boolean);
      locationDisplayText = parts.join(', ') || 'Custom Address';
    } else if (onboardingData.locationMode === 'geolocation' && onboardingData.geolocation.latitude) {
      lat = onboardingData.geolocation.latitude;
      lng = onboardingData.geolocation.longitude;
      locationDisplayText = onboardingData.geolocation.detectedAddress || (lat && lng ? `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})` : 'GPS Location');
    } else if (onboardingData.locationMode === 'link' && onboardingData.locationLink.url) {
      if (onboardingData.locationLink.extractedCoordinates) {
        lat = onboardingData.locationLink.extractedCoordinates.lat;
        lng = onboardingData.locationLink.extractedCoordinates.lng;
      }
      locationDisplayText = `Maps Link: ${onboardingData.locationLink.url}`;
    }
  }

  const bboxDelta = 0.02;
  const hasCoords = lat !== null && lng !== null;
  const mapIframeUrl = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${(lng as number) - bboxDelta}%2C${(lat as number) - bboxDelta}%2C${(lng as number) + bboxDelta}%2C${(lat as number) + bboxDelta}&layer=mapnik&marker=${lat}%2C${lng}`
    : '';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase mb-1">
            <MapPin className="w-4 h-4 text-blue-600" />
            Your Land Location
          </div>
          <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{locationDisplayText}</h2>
        </div>

        {suitabilityScore !== undefined && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
            <div className="text-center">
              <span className="text-xs text-blue-600 font-semibold uppercase block">Live site score</span>
              <span className="text-2xl font-black text-blue-900">{suitabilityScore}/100</span>
            </div>
            <EvidenceBadge status="VERIFIED" />
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative w-full h-80 rounded-xl overflow-hidden border border-gray-300 bg-gray-100 shadow-inner">
        {hasCoords ? (
          <>
            <iframe
              title="Land Location Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={mapIframeUrl}
              className="w-full h-full"
            ></iframe>

            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 shadow-md text-xs font-semibold text-gray-800 flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Lat: {(lat as number).toFixed(4)}, Lng: {(lng as number).toFixed(4)}</span>
            </div>

            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200 shadow-md text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Live OSM location (share GPS to enable counts)</span>
              <a
                href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 hover:underline inline-flex items-center"
              >
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-8 text-center text-xs text-gray-500">
            Share GPS (Location Access / Location Link) to preview the exact plot. District-only input shows baseline data below without a fake pin.
          </div>
        )}
      </div>
    </div>
  );
};
