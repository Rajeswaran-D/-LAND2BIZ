export type Confidence = 'VERIFIED' | 'ESTIMATED' | 'NEEDS_VERIFICATION' | 'DATA_UNAVAILABLE' | 'VERIFIED_BASELINE' | 'SOURCE_CONFLICT';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    signal: options.signal ?? AbortSignal.timeout(90_000),
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    if (response.ok) throw new Error('API returned a non-JSON response');
    throw new Error(`API request failed with status ${response.status}`);
  }
  if (!response.ok) {
    if (data?.error) {
      throw new Error(`[${data.error.module}] ${data.error.message} (Ref: ${data.error.request_id})`);
    }
    throw new Error(`API request failed with status ${response.status}`);
  }
  return data;
};

export interface DecisionAnalysisResponse {
  recommendation: {
    business: string;
    overall_score: number;
    opportunity_score: number;
    confidence_score: number;
    data_completeness_score: number;
    status: string;
    why: string[];
    missing: any[];
    must_verify_M21: string[];
  };
  ranking: Array<{
    id: string;
    business: string;
    title?: string;
    category?: string;
    capital_min_inr?: number;
    capital_max_inr?: number;
    monthly_net_inr?: number;
    payback_months_typical?: number;
    margin_pct_typical?: number;
    key_equipment?: string[];
    utilities?: string;
    tagline?: string;
    overall_score: number;
    why_this_location?: string[];
    target_customers?: string[];
    demand_drivers?: string[];
    unregistered_competition_notes?: string;
    estimated_project_cost?: number;
    subscores: any;
    evidence?: any;
  }>;
  market_gap_synthesis: {
    location_summary?: string;
    underserved_niches?: Array<{
      niche: string;
      signal: string;
      confidence: Confidence;
      suggested_capacity: string;
    }>;
    unregistered_business_inferences?: Array<{
      type: string;
      note: string;
    }>;
    demand_drivers?: string[];
    infrastructure_gaps?: string[];
    top_recommended_sectors?: string[];
  };
  evidence: {
    district_baseline?: any;
    finance?: any;
    regional_demand_signal?: any;
    regulatory?: any;
    risks?: any[];
  };
  ai_status: string;
}

let inFlightAnalyze: Promise<DecisionAnalysisResponse | null> | null = null;
let lastAnalyzeFailureAt = 0;
const ANALYZE_FAILURE_RETRY_MS = 10_000;

export const fetchDecisionAnalysis = async (onboardingData: any): Promise<DecisionAnalysisResponse | null> => {
  if (typeof window === 'undefined') return null;

  const cached = sessionStorage.getItem('land2biz_decision_analysis');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error("Failed parsing cached decision analysis:", e);
    }
  }

  // Several components request the same analysis on mount — share one request
  // instead of firing the heavy pipeline once per component.
  if (inFlightAnalyze) return inFlightAnalyze;
  if (Date.now() - lastAnalyzeFailureAt < ANALYZE_FAILURE_RETRY_MS) return null;

  const district = onboardingData?.fullAddress?.district || 'Coimbatore';
  const lat = onboardingData?.coordinates?.lat ?? null;
  const lon = onboardingData?.coordinates?.lng ?? null;
  const capital = (typeof onboardingData?.capital === 'number' && onboardingData.capital > 0) ? onboardingData.capital : 150000;
  const land_type = onboardingData?.landType || 'commercial';

  inFlightAnalyze = (async () => {
    try {
      const data = await apiClient('/api/v1/decision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district,
          lat,
          lon,
          margin_capital: capital,
          land_type,
          is_rural: true
        })
      });
      if (data) {
        sessionStorage.setItem('land2biz_decision_analysis', JSON.stringify(data));
      }
      return data;
    } catch (err) {
      console.error("Failed to fetch decision analysis from backend API:", err);
      lastAnalyzeFailureAt = Date.now();
      return null;
    } finally {
      inFlightAnalyze = null;
    }
  })();
  return inFlightAnalyze;
};
