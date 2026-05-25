import { api } from "./api";
import type { Sentence } from "@/app/types/sentence";

// Define the shape of your paginated API response
export interface PaginatedSentences {
  items: Sentence[];
  meta: {
    total: number;
    skip: number;
    take: number;
  };
}

export const getSentences = async (
  params?: { page?: number; limit?: number; search?: string }
): Promise<PaginatedSentences> => {
  // Assuming 'api' is an Axios instance, it automatically converts the 'params' object into a query string (e.g., ?page=1&limit=30)
  const res = await api.get("/sentences", { params });
  
  // If your 'api' is a custom fetch wrapper that DOES NOT support the Axios { params } object, use this instead:
  // const query = new URLSearchParams(params as Record<string, string>).toString();
  // const res = await api.get(`/sentences?${query}`);

  return res.data; 
};

export const getSentenceById = async (id: string): Promise<Sentence> => {
  const res = await api.get(`/sentences/${id}`);
  return res.data;
};

export const createSentence = async (data: Partial<Sentence>) => {
  return api.post("/sentences", data);
};

export const deleteSentence = async (id: string) => {
  return api.delete(`/sentences/${id}`);
};

// Add this below your create and delete methods
export const updateSentence = async (id: string, data: Partial<Sentence>) => {
  // Uses PATCH or PUT depending on how your backend API is built
  return api.patch(`/sentences/${id}`, data); 
};