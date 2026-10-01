import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://hiligaynonengine.onrender.com/api";

export const api = axios.create({
  baseURL,
  timeout: 15000,
});
