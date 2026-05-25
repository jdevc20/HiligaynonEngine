import * as sentenceApi from "@/lib/sentences";
import type { Sentence } from "@/app/types/sentence";

export const SentenceService = {
  // 1. Added parameters for pagination and search
  async list(params?: { page?: number; limit?: number; search?: string }) {
    return await sentenceApi.getSentences(params);
  },

  // 2. Renamed to 'get' to match standard REST naming and your UI
  async get(id: string) {
    return await sentenceApi.getSentenceById(id);
  },

  // 3. Replaced 'any' with explicit types for safety
  async create(data: { english: string; hiligaynon: string }) {
    return await sentenceApi.createSentence(data);
  },

  async remove(id: string) {
    return await sentenceApi.deleteSentence(id);
  },

  // Add this inside the SentenceService object
async update(id: string, data: Partial<Sentence>) {
  return await sentenceApi.updateSentence(id, data);
},
};