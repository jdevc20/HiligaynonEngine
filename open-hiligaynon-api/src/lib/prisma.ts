import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { execFile } from "child_process";
import { readFile } from "fs/promises";
import { promisify } from "util";
import { fileURLToPath } from "url";
import pg from "pg";

const execFileAsync = promisify(execFile);
const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
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

const LINGUISTIC_MIGRATION =
  "20261001070000_refactor_linguistic_engine";

const REPAIRED_MIGRATIONS = [
  "20261001063000_repair_production_schema",
  LINGUISTIC_MIGRATION,
] as const;

async function ensureLegacySchema() {
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

async function forceLinguisticSchema() {
  const migrationUrl = new URL(
    `../../prisma/migrations/${LINGUISTIC_MIGRATION}/migration.sql`,
    import.meta.url
  );

  const migrationSql = await readFile(migrationUrl, "utf8");

  console.log(
    `🛠️ Force-applying idempotent schema repair: ${LINGUISTIC_MIGRATION}`
  );

  await pool.query(migrationSql);
}

async function runPrismaCli(args: string[]) {
  const executable = process.platform === "win32" ? "npx.cmd" : "npx";

  return execFileAsync(executable, ["prisma", ...args], {
    cwd: projectRoot,
    env: process.env,
  });
}

async function reconcileMigrationHistory() {
  for (const migration of REPAIRED_MIGRATIONS) {
    try {
      const { stdout, stderr } = await runPrismaCli([
        "migrate",
        "resolve",
        "--applied",
        migration,
      ]);

      if (stdout.trim()) console.log(stdout.trim());
      if (stderr.trim()) console.warn(stderr.trim());
    } catch (error: any) {
      const output = [
        error?.stdout,
        error?.stderr,
        error?.message,
      ]
        .filter(Boolean)
        .join("\n");

      // "already applied" is expected after the first successful repair.
      if (!/already applied|already recorded/i.test(output)) {
        console.warn(
          `⚠️ Could not mark migration ${migration} as applied. Continuing because the schema repair itself succeeded.`
        );
        if (output) console.warn(output);
      }
    }
  }

  try {
    const { stdout, stderr } = await runPrismaCli(["migrate", "deploy"]);
    if (stdout.trim()) console.log(stdout.trim());
    if (stderr.trim()) console.warn(stderr.trim());
  } catch (error: any) {
    const output = [
      error?.stdout,
      error?.stderr,
      error?.message,
    ]
      .filter(Boolean)
      .join("\n");

    throw new Error(
      `Prisma migration reconciliation failed after schema repair.\n${output}`
    );
  }
}

/**
 * Production-safe forced migration:
 * 1. repairs the legacy schema needed for backfill,
 * 2. force-runs the idempotent linguistic migration SQL,
 * 3. reconciles Prisma migration history,
 * 4. deploys any remaining/future migrations.
 *
 * The HTTP server is not started unless all required schema work succeeds.
 */
export async function ensureDatabaseSchema() {
  await ensureLegacySchema();
  await forceLinguisticSchema();
  await reconcileMigrationHistory();

  const verification = await pool.query<{
    translation: string | null;
    text_unit: string | null;
    language: string | null;
  }>(`
    SELECT
      to_regclass('"Translation"')::text AS translation,
      to_regclass('"TextUnit"')::text AS text_unit,
      to_regclass('"Language"')::text AS language;
  `);

  const row = verification.rows[0];

  if (!row?.translation || !row?.text_unit || !row?.language) {
    throw new Error(
      "Forced migration completed without all required linguistic tables."
    );
  }
}
