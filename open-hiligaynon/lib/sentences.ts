import { api } from "./api";
import type { Sentence } from "@/types/sentence";

// Shape of your paginated API response
export interface PaginatedSentences {
  items: Sentence[];
  meta: {
    total: number;
    skip: number;
    take: number;
  };
}

export const getSentences = async (
  params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    sentiment?: number;    // 0 = Negative, 1 = Neutral, 2 = Positive
    isSarcastic?: boolean; // Filters for isolating training sets
    status?: string;       // pending | verified | approved | rejected
  }
): Promise<PaginatedSentences> => {
  const res = await api.get("/sentences", { params });
  return res.data; 
};

export const getSentenceById = async (id: string): Promise<Sentence> => {
  const res = await api.get(`/sentences/${id}`);
  return res.data;
};

export const createSentence = async (data: Partial<Sentence>) => {
  return api.post("/sentences", data);
};

export const updateSentence = async (id: string, data: Partial<Sentence>) => {
  return api.patch(`/sentences/${id}`, data); 
};

export const deleteSentence = async (id: string) => {
  return api.delete(`/sentences/${id}`);
};

// Cleaned up to use your unified API instance instead of mixed raw fetch calls
export const deleteSentencesBulk = async (ids: string[]) => {
  const res = await api.post("/sentences/bulk-delete", { ids });
  return res.data; // Returns { message, deletedCount }
};

// 🆕 NEW: Dispatches vote event to the atomic tracking backend engine
export const castVote = async (data: {
  sentenceId: string;
  type: "UP" | "DOWN";
  userId?: string;
}) => {
  const res = await api.post("/sentences/vote", data);
  return res.data; // Returns the updated Sentence object with new vote totals
};
