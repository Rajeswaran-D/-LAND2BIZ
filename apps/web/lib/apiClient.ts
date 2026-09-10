export type Confidence = 'VERIFIED' | 'ESTIMATED' | 'NEEDS_VERIFICATION' | 'DATA_UNAVAILABLE' | 'VERIFIED_BASELINE' | 'SOURCE_CONFLICT';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    if (data.error) {
      throw new Error(`[${data.error.module}] ${data.error.message} (Ref: ${data.error.request_id})`);
    }
    throw new Error('API request failed');
  }
  return data;
};
