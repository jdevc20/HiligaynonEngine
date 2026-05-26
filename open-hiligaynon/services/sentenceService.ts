import * as sentenceApi from "@/lib/sentences";
import type { Sentence } from "@/types/sentence";

export const SentenceService = {
  // 1. Parameters expanded to support semantic filtering and pipeline extraction
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sentiment?: number;    // 0 = Negative, 1 = Neutral, 2 = Positive
    isSarcastic?: boolean;
    status?: string;       // pending | verified | rejected
  }) {
    return await sentenceApi.getSentences(params);
  },

  // 2. Standard REST mapping for single resource lookup
  async get(id: string) {
    return await sentenceApi.getSentenceById(id);
  },

  // 3. Type-safe configuration supporting early analytical tagging during creation
  async create(data: {
    english: string;
    hiligaynon: string;
    sentiment?: number;
    intent?: string | null; // Match the "string | null" type from the interface
    isSarcastic?: boolean;
    status?: Sentence["status"]; // 👈 References the strict union type automatically!
  }) {
    return await sentenceApi.createSentence(data);
  },

  async remove(id: string) {
    return await sentenceApi.deleteSentence(id);
  },

  async update(id: string, data: Partial<Sentence>) {
    return await sentenceApi.updateSentence(id, data);
  },

  // Highly Optimized Bulk Removal API Call
  async removeBulk(ids: string[]) {
    return await sentenceApi.deleteSentencesBulk(ids);
  },

  // 🆕 NEW: Triggers the thread-safe database voting state transition
  async vote(data: {
    sentenceId: string;
    type: "UP" | "DOWN";
    userId?: string;
  }) {
    return await sentenceApi.castVote(data);
  },
};
