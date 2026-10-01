export type TranslationStatus =
  | "pending"
  | "verified"
  | "approved"
  | "rejected";

export interface LexemeSense {
  id: string;
  definition: string;
  gloss: string | null;
  register: string | null;
  usageNote: string | null;
}

export interface SentenceToken {
  id: string;
  tokenOrder: number;
  text: string;
  normalized: string;
  lemma: string | null;
  lexemeId: string | null;
  pos: string | null;
  morphologicalFeatures: Record<string, unknown> | null;
  dependencyRelation: string | null;
  headTokenOrder: number | null;
  isSlang: boolean;
  contextNote: string | null;
  senses: LexemeSense[];
}

export interface GrammarAnnotation {
  id: string;
  category: string;
  label: string;
  value: string | null;
  startTokenOrder: number | null;
  endTokenOrder: number | null;
  features: Record<string, unknown> | null;
  notes: string | null;
  createdAt: string;
}

export interface Sentence {
  id: string;
  english: string;
  hiligaynon: string;
  normalizedEnglish: string;
  normalizedHiligaynon: string;
  status: TranslationStatus;

  upVotes: number;
  downVotes: number;

  sentiment: number;
  intent: string | null;
  isSarcastic: boolean;
  register: string | null;
  domain: string | null;

  translationType: string;
  confidence: number | null;
  notes: string | null;

  sourceLanguage: string;
  targetLanguage: string;
  sourceTextId: string;
  targetTextId: string;

  tokens: SentenceToken[];
  grammarAnnotations: GrammarAnnotation[];

  createdAt: string;
  updatedAt: string;
}

export interface TranslationInput {
  english: string;
  hiligaynon: string;
  sentiment?: number;
  intent?: string | null;
  isSarcastic?: boolean;
  status?: TranslationStatus;
  translationType?: string;
  confidence?: number | null;
  notes?: string | null;
  register?: string | null;
  domain?: string | null;
}
