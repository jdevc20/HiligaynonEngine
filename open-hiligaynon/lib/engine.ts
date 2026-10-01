import { api } from "./api";
import type { DatasetExportResponse, DictionarySearchResponse } from "@/types/engine";

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


export const exportDataset = async (
  datasetId: string,
  split?: string
): Promise<DatasetExportResponse> => {
  const res = await api.get("/engine/datasets/" + datasetId + "/export", {
    params: split ? { split } : undefined,
  });

  return res.data;
};
