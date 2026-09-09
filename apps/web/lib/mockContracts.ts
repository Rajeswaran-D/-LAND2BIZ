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

export const MOCK_OPPORTUNITIES: OpportunityMock[] = [
  {
    id: "food_processing_01",
    title: "Food Processing Unit",
    score: 91,
    marketGap: "Strong",
    siteSuitability: "Suitable",
    competition: "Moderate",
    financialFeasibility: "High",
    risk: "Low",
    investmentRange: "₹5L - ₹15L",
    description: "High local agricultural output with minimal processing facilities nearby."
  },
  {
    id: "dairy_02",
    title: "Dairy Collection & Chilling",
    score: 85,
    marketGap: "Moderate",
    siteSuitability: "Very Suitable",
    competition: "High",
    financialFeasibility: "Moderate",
    risk: "Medium",
    investmentRange: "₹8L - ₹20L",
    description: "Strong local milk production but existing players capture significant market share."
  }
];
