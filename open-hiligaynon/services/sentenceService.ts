import * as sentenceApi from "@/lib/sentences";
import type { TranslationInput } from "@/types/sentence";

export const SentenceService = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sentiment?: number;
    isSarcastic?: boolean;
    status?: string;
  }) {
    return sentenceApi.getSentences(params);
  },

  async get(id: string) {
    return sentenceApi.getSentenceById(id);
  },

  async create(data: TranslationInput) {
    return sentenceApi.createSentence(data);
  },

  async remove(id: string) {
    return sentenceApi.deleteSentence(id);
  },

  async update(id: string, data: Partial<TranslationInput>) {
    return sentenceApi.updateSentence(id, data);
  },

  async removeBulk(ids: string[]) {
    return sentenceApi.deleteSentencesBulk(ids);
  },

  async vote(data: {
    sentenceId: string;
    type: "UP" | "DOWN";
    userId?: string;
  }) {
    return sentenceApi.castVote(data);
  },
};
