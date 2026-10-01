import { api } from "./api";
import type { Sentence, TranslationInput } from "@/types/sentence";

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
    sentiment?: number;
    isSarcastic?: boolean;
    status?: string;
  }
): Promise<PaginatedSentences> => {
  const res = await api.get("/sentences", { params });
  return res.data;
};

export const getSentenceById = async (id: string): Promise<Sentence> => {
  const res = await api.get(`/sentences/${id}`);
  return res.data;
};

export const createSentence = async (data: TranslationInput) => {
  const res = await api.post("/sentences", data);
  return res.data;
};

export const updateSentence = async (
  id: string,
  data: Partial<TranslationInput>
) => {
  const res = await api.patch(`/sentences/${id}`, data);
  return res.data;
};

export const deleteSentence = async (id: string) => {
  return api.delete(`/sentences/${id}`);
};

export const deleteSentencesBulk = async (ids: string[]) => {
  const res = await api.post("/sentences/bulk-delete", { ids });
  return res.data;
};

export const castVote = async (data: {
  sentenceId: string;
  type: "UP" | "DOWN";
  userId?: string;
}) => {
  const res = await api.post("/sentences/vote", data);
  return res.data;
};


export const moderateSentence = async (
  id: string,
  status: "approved" | "verified"
) => {
  const res = await api.patch(`/sentences/${id}/status`, { status });
  return res.data;
};
