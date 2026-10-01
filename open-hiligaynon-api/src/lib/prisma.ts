import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

export const pool = new pg.Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});

export async function ensureDatabaseSchema() {
  await pool.query(`
    ALTER TABLE "Sentence"
      ADD COLUMN IF NOT EXISTS "sentiment" INTEGER NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS "intent" TEXT,
      ADD COLUMN IF NOT EXISTS "isSarcastic" BOOLEAN NOT NULL DEFAULT false;
  `);

  await pool.query(`
    ALTER TABLE "Token"
      ADD COLUMN IF NOT EXISTS "isSlang" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "contextNote" TEXT;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "Idiom" (
      "id" TEXT NOT NULL,
      "phrase" TEXT NOT NULL,
      "meaning" TEXT NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'colloquial',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Idiom_pkey" PRIMARY KEY ("id")
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "Vote" (
      "id" TEXT NOT NULL,
      "sentenceId" TEXT NOT NULL,
      "userId" TEXT,
      "ipAddress" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Idiom_phrase_key" ON "Idiom"("phrase");
    CREATE INDEX IF NOT EXISTS "Idiom_phrase_idx" ON "Idiom"("phrase");
    CREATE INDEX IF NOT EXISTS "Vote_sentenceId_idx" ON "Vote"("sentenceId");
    CREATE UNIQUE INDEX IF NOT EXISTS "Vote_sentenceId_ipAddress_key" ON "Vote"("sentenceId", "ipAddress");
    CREATE INDEX IF NOT EXISTS "Sentence_normalizedEnglish_idx" ON "Sentence"("normalizedEnglish");
    CREATE INDEX IF NOT EXISTS "Sentence_normalizedHiligaynon_idx" ON "Sentence"("normalizedHiligaynon");
    CREATE INDEX IF NOT EXISTS "Sentence_sentiment_idx" ON "Sentence"("sentiment");
    CREATE INDEX IF NOT EXISTS "Sentence_createdAt_idx" ON "Sentence"("createdAt" DESC);
    CREATE INDEX IF NOT EXISTS "Token_sentenceId_idx" ON "Token"("sentenceId");
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Vote_sentenceId_fkey'
      ) THEN
        ALTER TABLE "Vote"
          ADD CONSTRAINT "Vote_sentenceId_fkey"
          FOREIGN KEY ("sentenceId") REFERENCES "Sentence"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$;
  `);
}
