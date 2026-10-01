import { api } from "./api";
import type { DictionarySearchResponse } from "@/types/engine";

export const searchDictionary = async (
  query: string,
  language = "hil",
  limit = 25
): Promise<DictionarySearchResponse> => {
  const res = await api.get("/engine/dictionary", {
    params: { q: query, language, limit },
  });

  return res.data;
};
