ALTER TABLE "Dataset"
  ADD COLUMN IF NOT EXISTS "generationConfig" JSONB,
  ADD COLUMN IF NOT EXISTS "generatedByIdentityId" TEXT,
  ADD COLUMN IF NOT EXISTS "generatedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Dataset_generatedByIdentityId_idx"
  ON "Dataset"("generatedByIdentityId");
