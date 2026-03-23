// API Configuration - centralized base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const API_ENDPOINTS = {
  DASHBOARD: `${API_BASE_URL}/api/v1/dashboard`,
  CHAT: `${API_BASE_URL}/api/v1/chat`,
  MODEL_METRICS: `${API_BASE_URL}/api/v1/model-metrics`,
  HEALTH: `${API_BASE_URL}/health`,
};

export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS) => {
  return API_ENDPOINTS[endpoint];
};
