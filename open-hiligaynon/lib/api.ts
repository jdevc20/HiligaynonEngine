import axios, { type InternalAxiosRequestConfig } from "axios";
import {
  getStoredHilitechSession,
  refreshHilitechSession,
  storeHilitechSession,
} from "./auth";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _hilitechRetry?: boolean;
};

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://hiligaynonengine.onrender.com/api";

export const api = axios.create({
  baseURL,
  timeout: 15000,
});


api.interceptors.request.use((config) => {
  const token = getStoredHilitechSession()?.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableRequestConfig | undefined;
    const hasSession = Boolean(getStoredHilitechSession());

    if (
      error.response?.status === 401 &&
      config &&
      !config._hilitechRetry &&
      hasSession
    ) {
      config._hilitechRetry = true;

      try {
        const session = await refreshHilitechSession();
        config.headers.Authorization = `Bearer ${session.accessToken}`;
        return api.request(config);
      } catch {
        storeHilitechSession(null);
      }
    }

    return Promise.reject(error);
  }
);
