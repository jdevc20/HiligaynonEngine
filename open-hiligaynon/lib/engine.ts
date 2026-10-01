import { api } from "./api";
import type {
  DatasetExportResponse,
  DictionarySearchResponse,
  GeneratedDatasetResult,
  GenerateDatasetInput,
} from "@/types/engine";

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


export const generateDataset = async (
  input: GenerateDatasetInput
): Promise<GeneratedDatasetResult> => {
  const res = await api.post("/engine/datasets/generate", input);
  return res.data.data;
};
