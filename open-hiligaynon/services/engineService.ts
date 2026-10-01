import * as engineApi from "@/lib/engine";

export const EngineService = {
  async dictionary(query: string, language = "hil", limit = 25) {
    return engineApi.searchDictionary(query, language, limit);
  },

  async exportDataset(datasetId: string, split?: string) {
    return engineApi.exportDataset(datasetId, split);
  },
};
