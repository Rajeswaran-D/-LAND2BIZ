export type ConfidenceLevel = 'VERIFIED' | 'ESTIMATED' | 'DATA_UNAVAILABLE' | 'DATA_CONFLICT' | 'NEEDS_VERIFICATION';

export interface OpportunityMock {
  id: string;
  title: string;
  score: number;
  marketGap: string;
  siteSuitability: string;
  competition: string;
  financialFeasibility: string;
  risk: string;
  investmentRange: string;
  description: string;
}

export const MOCK_OPPORTUNITIES: OpportunityMock[] = [];

if (MOCK_OPPORTUNITIES.length) {
  throw new Error("Production mock data is forbidden — use /api/v1/decision/analyze evidence instead.");
}
