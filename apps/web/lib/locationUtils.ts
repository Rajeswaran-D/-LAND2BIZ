import { OnboardingFormData } from '@/types/onboarding';

export const DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  salem: { lat: 11.6643, lng: 78.1460 },
  trichy: { lat: 10.7905, lng: 78.7047 },
  tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  tirunelveli: { lat: 8.7139, lng: 77.7567 },
  erode: { lat: 11.3410, lng: 77.7172 },
  vellore: { lat: 12.9165, lng: 79.1325 },
  thanjavur: { lat: 10.7870, lng: 79.1378 },
  thoothukudi: { lat: 8.7642, lng: 78.1348 },
  tuticorin: { lat: 8.7642, lng: 78.1348 },
  dindigul: { lat: 10.3673, lng: 77.9803 },
  kancheepuram: { lat: 12.8342, lng: 79.7036 },
  kanchipuram: { lat: 12.8342, lng: 79.7036 },
  chengalpattu: { lat: 12.6819, lng: 79.9888 },
  kanyakumari: { lat: 8.0883, lng: 77.5385 },
  nagercoil: { lat: 8.1833, lng: 77.4119 },
  cuddalore: { lat: 11.7480, lng: 79.7714 },
  dharmapuri: { lat: 12.1211, lng: 78.1582 },
  krishnagiri: { lat: 12.5186, lng: 78.2137 },
  namakkal: { lat: 11.2189, lng: 78.1674 },
  karur: { lat: 10.9601, lng: 78.0766 },
  nilgiris: { lat: 11.4102, lng: 76.6950 },
  ooty: { lat: 11.4102, lng: 76.6950 },
  pudukkottai: { lat: 10.3833, lng: 78.8000 },
  ramanathapuram: { lat: 9.3639, lng: 78.8394 },
  sivaganga: { lat: 9.8433, lng: 78.4809 },
  tenkasi: { lat: 8.9593, lng: 77.3135 },
  theni: { lat: 10.0104, lng: 77.4768 },
  tirupathur: { lat: 12.4926, lng: 78.5701 },
  tiruppur: { lat: 11.1085, lng: 77.3411 },
  tiruvallur: { lat: 13.1432, lng: 79.9077 },
  tiruvannamalai: { lat: 12.2253, lng: 79.0747 },
  tiruvarur: { lat: 10.7709, lng: 79.6373 },
  viluppuram: { lat: 11.9401, lng: 79.4861 },
  virudhunagar: { lat: 9.5872, lng: 77.9514 },
  ariyalur: { lat: 11.1401, lng: 79.0786 },
  kallakurichi: { lat: 11.7384, lng: 78.9639 },
  mayiladuthurai: { lat: 11.1018, lng: 79.6522 },
  nagapattinam: { lat: 10.7672, lng: 79.8449 },
  perambalur: { lat: 11.2342, lng: 78.8820 },
  ranipet: { lat: 12.9296, lng: 79.3333 }
};

export const getDistrictName = (d: OnboardingFormData | null): string => {
  if (d?.fullAddress?.district) return d.fullAddress.district;
  return 'Coimbatore';
};

export const getCoordinates = (d: OnboardingFormData | null): { lat: number; lng: number } => {
  if (d) {
    if (d.locationMode === 'geolocation' && d.geolocation?.latitude && d.geolocation?.longitude) {
      return { lat: d.geolocation.latitude, lng: d.geolocation.longitude };
    }
    if (d.locationMode === 'link' && d.locationLink?.extractedCoordinates) {
      return { lat: d.locationLink.extractedCoordinates.lat, lng: d.locationLink.extractedCoordinates.lng };
    }
    if (d.fullAddress?.district) {
      const norm = d.fullAddress.district.trim().toLowerCase().replace(/district/g, '').trim();
      if (DISTRICT_COORDS[norm]) {
        return DISTRICT_COORDS[norm];
      }
    }
  }
  // Default to Coimbatore center
  return { lat: 11.0168, lng: 76.9558 };
};
