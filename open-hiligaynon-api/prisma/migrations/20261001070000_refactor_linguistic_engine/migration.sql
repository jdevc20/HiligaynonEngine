-- Introduce a normalized linguistic data model without destructively dropping legacy tables.
-- Existing Sentence IDs are reused as Translation IDs so current UI links remain stable.

CREATE TABLE IF NOT EXISTS "Language" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "nativeName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TextUnit" (
  "id" TEXT NOT NULL,
  "languageId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "normalizedText" TEXT NOT NULL,
  "unitType" TEXT NOT NULL DEFAULT 'sentence',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TextUnit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Translation" (
  "id" TEXT NOT NULL,
  "sourceTextId" TEXT NOT NULL,
  "targetTextId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "translationType" TEXT NOT NULL DEFAULT 'natural',
  "confidence" DOUBLE PRECISION,
  "notes" TEXT,
  "upVotes" INTEGER NOT NULL DEFAULT 0,
  "downVotes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LinguisticAnnotation" (
  "id" TEXT NOT NULL,
  "textUnitId" TEXT NOT NULL,
  "sentiment" INTEGER NOT NULL DEFAULT 1,
  "intent" TEXT,
  "isSarcastic" BOOLEAN NOT NULL DEFAULT false,
  "register" TEXT,
  "domain" TEXT,
  "notes" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LinguisticAnnotation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Lexeme" (
  "id" TEXT NOT NULL,
  "languageId" TEXT NOT NULL,
  "lemma" TEXT NOT NULL,
  "normalizedLemma" TEXT NOT NULL,
  "partOfSpeech" TEXT,
  "register" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Lexeme_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LexemeSense" (
  "id" TEXT NOT NULL,
  "lexemeId" TEXT NOT NULL,
  "definition" TEXT NOT NULL,
  "gloss" TEXT,
  "register" TEXT,
  "usageNote" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LexemeSense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LexemeTranslation" (
  "id" TEXT NOT NULL,
  "sourceLexemeId" TEXT NOT NULL,
  "targetLexemeId" TEXT NOT NULL,
  "relationType" TEXT NOT NULL DEFAULT 'translation',
  "confidence" DOUBLE PRECISION,
  "notes" TEXT,
  CONSTRAINT "LexemeTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TokenAnnotation" (
  "id" TEXT NOT NULL,
  "textUnitId" TEXT NOT NULL,
  "tokenOrder" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "normalized" TEXT NOT NULL,
  "startOffset" INTEGER,
  "endOffset" INTEGER,
  "lexemeId" TEXT,
  "partOfSpeech" TEXT,
  "morphologicalFeatures" JSONB,
  "dependencyRelation" TEXT,
  "headTokenOrder" INTEGER,
  "isSlang" BOOLEAN NOT NULL DEFAULT false,
  "contextNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TokenAnnotation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GrammarAnnotation" (
  "id" TEXT NOT NULL,
  "textUnitId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "value" TEXT,
  "startTokenOrder" INTEGER,
  "endTokenOrder" INTEGER,
  "features" JSONB,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GrammarAnnotation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SourceRecord" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL DEFAULT 'community',
  "author" TEXT,
  "url" TEXT,
  "license" TEXT,
  "citation" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SourceRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TextSource" (
  "id" TEXT NOT NULL,
  "textUnitId" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "externalRef" TEXT,
  "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TextSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TranslationSource" (
  "id" TEXT NOT NULL,
  "translationId" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "externalRef" TEXT,
  "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TranslationSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Dataset" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "version" TEXT NOT NULL DEFAULT '1.0',
  "description" TEXT,
  "license" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DatasetItem" (
  "id" TEXT NOT NULL,
  "datasetId" TEXT NOT NULL,
  "translationId" TEXT NOT NULL,
  "split" TEXT NOT NULL DEFAULT 'unassigned',
  "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "labels" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DatasetItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TranslationVote" (
  "id" TEXT NOT NULL,
  "translationId" TEXT NOT NULL,
  "userId" TEXT,
  "ipAddress" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TranslationVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Language_code_key" ON "Language"("code");
CREATE UNIQUE INDEX IF NOT EXISTS "TextUnit_languageId_normalizedText_unitType_key" ON "TextUnit"("languageId", "normalizedText", "unitType");
CREATE INDEX IF NOT EXISTS "TextUnit_languageId_normalizedText_idx" ON "TextUnit"("languageId", "normalizedText");
CREATE INDEX IF NOT EXISTS "TextUnit_unitType_idx" ON "TextUnit"("unitType");
CREATE INDEX IF NOT EXISTS "Translation_sourceTextId_targetTextId_idx" ON "Translation"("sourceTextId", "targetTextId");
CREATE INDEX IF NOT EXISTS "Translation_status_idx" ON "Translation"("status");
CREATE INDEX IF NOT EXISTS "Translation_createdAt_idx" ON "Translation"("createdAt" DESC);
CREATE UNIQUE INDEX IF NOT EXISTS "LinguisticAnnotation_textUnitId_key" ON "LinguisticAnnotation"("textUnitId");
CREATE INDEX IF NOT EXISTS "LinguisticAnnotation_sentiment_idx" ON "LinguisticAnnotation"("sentiment");
CREATE INDEX IF NOT EXISTS "LinguisticAnnotation_intent_idx" ON "LinguisticAnnotation"("intent");
CREATE UNIQUE INDEX IF NOT EXISTS "Lexeme_languageId_normalizedLemma_key" ON "Lexeme"("languageId", "normalizedLemma");
CREATE INDEX IF NOT EXISTS "Lexeme_languageId_partOfSpeech_idx" ON "Lexeme"("languageId", "partOfSpeech");
CREATE INDEX IF NOT EXISTS "LexemeSense_lexemeId_idx" ON "LexemeSense"("lexemeId");
CREATE UNIQUE INDEX IF NOT EXISTS "LexemeTranslation_sourceLexemeId_targetLexemeId_relationType_key" ON "LexemeTranslation"("sourceLexemeId", "targetLexemeId", "relationType");
CREATE INDEX IF NOT EXISTS "LexemeTranslation_targetLexemeId_idx" ON "LexemeTranslation"("targetLexemeId");
CREATE UNIQUE INDEX IF NOT EXISTS "TokenAnnotation_textUnitId_tokenOrder_key" ON "TokenAnnotation"("textUnitId", "tokenOrder");
CREATE INDEX IF NOT EXISTS "TokenAnnotation_lexemeId_idx" ON "TokenAnnotation"("lexemeId");
CREATE INDEX IF NOT EXISTS "GrammarAnnotation_textUnitId_category_idx" ON "GrammarAnnotation"("textUnitId", "category");
CREATE UNIQUE INDEX IF NOT EXISTS "TextSource_textUnitId_sourceId_key" ON "TextSource"("textUnitId", "sourceId");
CREATE INDEX IF NOT EXISTS "TextSource_sourceId_idx" ON "TextSource"("sourceId");
CREATE UNIQUE INDEX IF NOT EXISTS "TranslationSource_translationId_sourceId_key" ON "TranslationSource"("translationId", "sourceId");
CREATE INDEX IF NOT EXISTS "TranslationSource_sourceId_idx" ON "TranslationSource"("sourceId");
CREATE UNIQUE INDEX IF NOT EXISTS "Dataset_name_version_key" ON "Dataset"("name", "version");
CREATE UNIQUE INDEX IF NOT EXISTS "DatasetItem_datasetId_translationId_key" ON "DatasetItem"("datasetId", "translationId");
CREATE INDEX IF NOT EXISTS "DatasetItem_datasetId_split_idx" ON "DatasetItem"("datasetId", "split");
CREATE UNIQUE INDEX IF NOT EXISTS "TranslationVote_translationId_ipAddress_key" ON "TranslationVote"("translationId", "ipAddress");
CREATE INDEX IF NOT EXISTS "TranslationVote_translationId_idx" ON "TranslationVote"("translationId");

INSERT INTO "Language" ("id", "code", "name", "nativeName", "updatedAt")
VALUES
  ('lang-en', 'en', 'English', 'English', CURRENT_TIMESTAMP),
  ('lang-hil', 'hil', 'Hiligaynon', 'Hiligaynon', CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

-- Backfill the existing English/Hiligaynon sentence corpus.
INSERT INTO "TextUnit" ("id", "languageId", "text", "normalizedText", "unitType", "createdAt", "updatedAt")
SELECT DISTINCT ON ("normalizedEnglish")
  'tu-en-' || md5("normalizedEnglish"), 'lang-en', "english", "normalizedEnglish", 'sentence', "createdAt", "updatedAt"
FROM "Sentence"
ORDER BY "normalizedEnglish", "createdAt"
ON CONFLICT DO NOTHING;

INSERT INTO "TextUnit" ("id", "languageId", "text", "normalizedText", "unitType", "createdAt", "updatedAt")
SELECT DISTINCT ON ("normalizedHiligaynon")
  'tu-hil-' || md5("normalizedHiligaynon"), 'lang-hil', "hiligaynon", "normalizedHiligaynon", 'sentence', "createdAt", "updatedAt"
FROM "Sentence"
ORDER BY "normalizedHiligaynon", "createdAt"
ON CONFLICT DO NOTHING;

INSERT INTO "Translation" (
  "id", "sourceTextId", "targetTextId", "status", "translationType",
  "upVotes", "downVotes", "createdAt", "updatedAt"
)
SELECT
  "id",
  'tu-en-' || md5("normalizedEnglish"),
  'tu-hil-' || md5("normalizedHiligaynon"),
  "status", 'natural', "upVotes", "downVotes", "createdAt", "updatedAt"
FROM "Sentence"
ON CONFLICT DO NOTHING;

INSERT INTO "LinguisticAnnotation" (
  "id", "textUnitId", "sentiment", "intent", "isSarcastic", "createdAt", "updatedAt"
)
SELECT
  'annotation-' || md5("normalizedHiligaynon"),
  'tu-hil-' || md5("normalizedHiligaynon"),
  "sentiment", "intent", "isSarcastic", "createdAt", "updatedAt"
FROM "Sentence"
ON CONFLICT ("textUnitId") DO NOTHING;

INSERT INTO "TokenAnnotation" (
  "id", "textUnitId", "tokenOrder", "text", "normalized",
  "partOfSpeech", "isSlang", "contextNote", "createdAt"
)
SELECT
  t."id",
  'tu-hil-' || md5(s."normalizedHiligaynon"),
  t."tokenOrder", t."text", COALESCE(t."normalized", lower(t."text")),
  t."pos", t."isSlang", t."contextNote", t."createdAt"
FROM "Token" t
JOIN "Sentence" s ON s."id" = t."sentenceId"
ON CONFLICT DO NOTHING;

INSERT INTO "TranslationVote" ("id", "translationId", "userId", "ipAddress", "type", "createdAt")
SELECT "id", "sentenceId", "userId", "ipAddress", "type", "createdAt"
FROM "Vote"
ON CONFLICT DO NOTHING;

-- Foreign keys are added after backfill so existing data is copied first.
ALTER TABLE "TextUnit"
  ADD CONSTRAINT "TextUnit_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Translation"
  ADD CONSTRAINT "Translation_sourceTextId_fkey" FOREIGN KEY ("sourceTextId") REFERENCES "TextUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Translation_targetTextId_fkey" FOREIGN KEY ("targetTextId") REFERENCES "TextUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LinguisticAnnotation"
  ADD CONSTRAINT "LinguisticAnnotation_textUnitId_fkey" FOREIGN KEY ("textUnitId") REFERENCES "TextUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Lexeme"
  ADD CONSTRAINT "Lexeme_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LexemeSense"
  ADD CONSTRAINT "LexemeSense_lexemeId_fkey" FOREIGN KEY ("lexemeId") REFERENCES "Lexeme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LexemeTranslation"
  ADD CONSTRAINT "LexemeTranslation_sourceLexemeId_fkey" FOREIGN KEY ("sourceLexemeId") REFERENCES "Lexeme"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "LexemeTranslation_targetLexemeId_fkey" FOREIGN KEY ("targetLexemeId") REFERENCES "Lexeme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TokenAnnotation"
  ADD CONSTRAINT "TokenAnnotation_textUnitId_fkey" FOREIGN KEY ("textUnitId") REFERENCES "TextUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "TokenAnnotation_lexemeId_fkey" FOREIGN KEY ("lexemeId") REFERENCES "Lexeme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GrammarAnnotation"
  ADD CONSTRAINT "GrammarAnnotation_textUnitId_fkey" FOREIGN KEY ("textUnitId") REFERENCES "TextUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TextSource"
  ADD CONSTRAINT "TextSource_textUnitId_fkey" FOREIGN KEY ("textUnitId") REFERENCES "TextUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "TextSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TranslationSource"
  ADD CONSTRAINT "TranslationSource_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "TranslationSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "SourceRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DatasetItem"
  ADD CONSTRAINT "DatasetItem_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "DatasetItem_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TranslationVote"
  ADD CONSTRAINT "TranslationVote_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
