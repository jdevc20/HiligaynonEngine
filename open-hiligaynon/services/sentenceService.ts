import * as sentenceApi from "@/lib/sentences";
import type { Sentence } from "@/types/sentence";

export const SentenceService = {
  // 1. Parameters for pagination and search
  async list(params?: { page?: number; limit?: number; search?: string }) {
    return await sentenceApi.getSentences(params);
  },

  // 2. Standard REST mapping for single resource lookup
  async get(id: string) {
    return await sentenceApi.getSentenceById(id);
  },

  // 3. Type-safe configuration for creating records
  async create(data: { english: string; hiligaynon: string }) {
    return await sentenceApi.createSentence(data);
  },

  async remove(id: string) {
    return await sentenceApi.deleteSentence(id);
  },

  async update(id: string, data: Partial<Sentence>) {
    return await sentenceApi.updateSentence(id, data);
  },

  // 🆕 NEW: Highly Optimized Bulk Removal API Call
  async removeBulk(ids: string[]) {
    return await sentenceApi.deleteSentencesBulk(ids);
  },
};