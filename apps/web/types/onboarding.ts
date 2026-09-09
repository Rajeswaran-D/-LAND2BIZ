export type LocationMode = 'address' | 'geolocation' | 'link';

export interface FullAddress {
  doorOrPlotNo?: string;
  streetOrVillage: string;
  blockOrTehsil?: string;
  district: string;
  state: string;
  pincode?: string;
}

export interface GeolocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy?: number | null;
  detectedAddress?: string;
}

export interface LocationLinkData {
  url: string;
  extractedCoordinates?: { lat: number; lng: number } | null;
}

export type LandTypeOption = 'agricultural' | 'commercial' | 'industrial' | 'residential' | 'vacant' | 'not_specified';

export interface OnboardingFormData {
  locationMode: LocationMode;
  fullAddress: FullAddress;
  geolocation: GeolocationData;
  locationLink: LocationLinkData;
  capital: number | '';
  landType: LandTypeOption;
  suggestions: string;
}
