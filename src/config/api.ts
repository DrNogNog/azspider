// API Configuration
const getApiUrl = () => {
  // In development, use the local backend
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }
  
  // In production, use the AWS App Runner backend
  return import.meta.env.VITE_API_URL || 'https://ctmq2synkb.us-east-1.awsapprunner.com';
};

export const API_BASE_URL = getApiUrl();

// API endpoints
export const API_ENDPOINTS = {
  SEARCH: `${API_BASE_URL}/api/search`,
  HEALTH: `${API_BASE_URL}/health`,
} as const;
