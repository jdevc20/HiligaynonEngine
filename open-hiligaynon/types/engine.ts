import type { LexemeSense } from "./sentence";

export interface DictionaryLanguage {
  id: string;
  code: string;
  name: string;
  nativeName: string | null;
}

export interface DictionaryLexeme {
  id: string;
  lemma: string;
  normalizedLemma: string;
  partOfSpeech: string | null;
  register: string | null;
  notes: string | null;
  language: DictionaryLanguage;
  senses: LexemeSense[];
  outgoingTranslations: Array<{
    id: string;
    relationType: string;
    confidence: number | null;
    targetLexeme: {
      id: string;
      lemma: string;
      partOfSpeech: string | null;
      language: DictionaryLanguage;
      senses: LexemeSense[];
    };
  }>;
  incomingTranslations: Array<{
    id: string;
    relationType: string;
    confidence: number | null;
    sourceLexeme: {
      id: string;
      lemma: string;
      partOfSpeech: string | null;
      language: DictionaryLanguage;
      senses: LexemeSense[];
    };
  }>;
}

export interface DictionarySearchResponse {
  query: string;
  language: string;
  count: number;
  items: DictionaryLexeme[];
}


export interface DatasetExportItem {
  id: string;
  split: string;
  weight: number;
  labels: Record<string, unknown> | null;
  translationId: string;
  source: {
    language: string;
    text: string;
    annotation: unknown;
  };
  target: {
    language: string;
    text: string;
    annotation: unknown;
    tokens: unknown[];
    grammar: unknown[];
  };
  translationType: string;
  confidence: number | null;
  status: string;
  provenance: Array<{
    id: string;
    title: string;
    sourceType: string;
    license: string | null;
  }>;
}

export interface DatasetExportResponse {
  dataset: {
    id: string;
    name: string;
    version: string;
    description: string | null;
    license: string | null;
  };
  split: string;
  count: number;
  items: DatasetExportItem[];
}


export interface GenerateDatasetInput {
  name: string;
  version: string;
  description?: string | null;
  license?: string | null;
  domain?: string;
  register?: string;
  minConfidence?: number;
  maxItems: number;
  excludeSarcastic: boolean;
  requireProvenance: boolean;
  trainPercent: number;
  validationPercent: number;
  testPercent: number;
}

export interface GeneratedDatasetResult {
  dataset: {
    id: string;
    name: string;
    version: string;
    description: string | null;
    license: string | null;
    generatedByIdentityId: string | null;
    generatedAt: string | null;
    generationConfig: Record<string, unknown> | null;
  };
  count: number;
  splits: {
    train: number;
    validation: number;
    test: number;
  };
}
