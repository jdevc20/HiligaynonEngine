import axios from "axios";
import { getStoredHilitechSession } from "./auth";

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
