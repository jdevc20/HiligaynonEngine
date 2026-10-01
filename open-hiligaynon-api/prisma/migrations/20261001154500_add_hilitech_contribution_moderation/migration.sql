ALTER TABLE "Translation"
  ADD COLUMN IF NOT EXISTS "contributorIdentityId" TEXT,
  ADD COLUMN IF NOT EXISTS "contributorType" TEXT NOT NULL DEFAULT 'guest',
  ADD COLUMN IF NOT EXISTS "approvedByIdentityId" TEXT,
  ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "verifiedByIdentityId" TEXT,
  ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Translation_contributorIdentityId_idx"
  ON "Translation"("contributorIdentityId");
