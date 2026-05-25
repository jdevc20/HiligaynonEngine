-- CreateTable
CREATE TABLE "Sentence" (
    "id" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "hiligaynon" TEXT NOT NULL,
    "normalizedEnglish" TEXT,
    "normalizedHiligaynon" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "upVotes" INTEGER NOT NULL DEFAULT 0,
    "downVotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sentence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "sentenceId" TEXT NOT NULL,
    "tokenOrder" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "normalized" TEXT,
    "root" TEXT,
    "pos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "Sentence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
