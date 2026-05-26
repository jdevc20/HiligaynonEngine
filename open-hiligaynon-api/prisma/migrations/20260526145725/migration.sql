/*
  Warnings:

  - Made the column `normalizedEnglish` on table `Sentence` required. This step will fail if there are existing NULL values in that column.
  - Made the column `normalizedHiligaynon` on table `Sentence` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_sentenceId_fkey";

-- AlterTable
ALTER TABLE "Sentence" ADD COLUMN     "intent" TEXT,
ADD COLUMN     "isSarcastic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sentiment" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "normalizedEnglish" SET NOT NULL,
ALTER COLUMN "normalizedHiligaynon" SET NOT NULL;

-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "contextNote" TEXT,
ADD COLUMN     "isSlang" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Idiom" (
    "id" TEXT NOT NULL,
    "phrase" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'colloquial',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Idiom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "sentenceId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Idiom_phrase_key" ON "Idiom"("phrase");

-- CreateIndex
CREATE INDEX "Idiom_phrase_idx" ON "Idiom"("phrase");

-- CreateIndex
CREATE INDEX "Vote_sentenceId_idx" ON "Vote"("sentenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_sentenceId_ipAddress_key" ON "Vote"("sentenceId", "ipAddress");

-- CreateIndex
CREATE INDEX "Sentence_normalizedEnglish_idx" ON "Sentence"("normalizedEnglish");

-- CreateIndex
CREATE INDEX "Sentence_normalizedHiligaynon_idx" ON "Sentence"("normalizedHiligaynon");

-- CreateIndex
CREATE INDEX "Sentence_sentiment_idx" ON "Sentence"("sentiment");

-- CreateIndex
CREATE INDEX "Sentence_createdAt_idx" ON "Sentence"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Token_sentenceId_idx" ON "Token"("sentenceId");

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "Sentence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "Sentence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
