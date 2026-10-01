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
