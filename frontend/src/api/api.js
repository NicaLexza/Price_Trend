import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
const API_KEY = process.env.REACT_APP_API_KEY || "dev-key";

const client = axios.create({
  baseURL: API_BASE,
});

client.interceptors.request.use((config) => {
  if (API_KEY) {
    // Simple API key header to match backend security
    // NOTE: For production, use a proper auth mechanism instead.
    config.headers["X-API-Key"] = API_KEY;
  }
  return config;
});

export const fetchFoods = () => client.get("/foods");
export const fetchRegions = () => client.get("/regions");

export const fetchTrends = (params) => client.get("/trends", { params });

export const fetchAnalysis = (params) => client.get("/analysis", { params });

export const fetchSavedInsights = (params) =>
  client.get("/analysis/saved", { params });

export const fetchSavedForecasts = (params) =>
  client.get("/analysis/forecasts", { params });

export const fetchComparison = (params) =>
  client.get("/analysis/compare", { params });
