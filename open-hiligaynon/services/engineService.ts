import * as engineApi from "@/lib/engine";
import type { GenerateDatasetInput } from "@/types/engine";

export const EngineService = {
  async dictionary(query: string, language = "hil", limit = 25) {
    return engineApi.searchDictionary(query, language, limit);
  },

  async exportDataset(datasetId: string, split?: string) {
    return engineApi.exportDataset(datasetId, split);
  },

  async generateDataset(input: GenerateDatasetInput) {
    return engineApi.generateDataset(input);
  },
};
