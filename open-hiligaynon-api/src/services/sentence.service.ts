import { Prisma } from "@prisma/client";
import { Sentence } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

/**W
 * Advanced Normalization:
 * - Lowercases and trims.
 * - Strips punctuation EXCEPT hyphens and apostrophes (critical for 
 *   Hiligaynon words like "adlaw-adlaw" or "wala'y").
 * - Collapses multiple spaces.
 */
const normalize = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\_`~()]/g, "") // Removed ' and - from the strip list
    .replace(/\s{2,}/g, " ");
};

// 1. Parameter Interfaces: Much cleaner than passing 5 different arguments
export interface SentenceQueryParams {
  skip?: number;
  take?: number;
  search?: string;
}

// 2. Explicit Return Types & Transactions
export const getAllSentences = async (params: SentenceQueryParams = {}) => {
  const { skip = 0, take = 50, search } = params;

  // Build a dynamic search query if a search term is provided
  const where: Prisma.SentenceWhereInput = search
    ? {
        OR: [
          { normalizedEnglish: { contains: normalize(search) } },
          { normalizedHiligaynon: { contains: normalize(search) } }
        ]
      }
    : {};

  // 3. The $transaction pattern: Fetches data AND total count concurrently
  const [sentences, totalCount] = await prisma.$transaction([
    prisma.sentence.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.sentence.count({ where }) // Required for frontend pagination!
  ]);

  return {
    items: sentences,
    meta: { total: totalCount, skip, take }
  };
};

// 4. Return types (Promise<Sentence | null>) make TypeScript strictly enforce your code
export const getSentenceById = async (id: string) => {
  return prisma.sentence.findUnique({
    where: { id },
    include: { tokens: true } // Usually, you want the tokens when viewing one sentence
  });
};

// 5. Use a DTO (Data Transfer Object) instead of loose parameters
type CreateSentenceInput = {
  english: string;
  hiligaynon: string;
};

export const createSentence = async (data: CreateSentenceInput): Promise<Sentence> => {
  return prisma.sentence.create({
    data: {
      english: data.english,
      hiligaynon: data.hiligaynon,
      normalizedEnglish: normalize(data.english),
      normalizedHiligaynon: normalize(data.hiligaynon)
    }
  });
};

export const deleteSentence = async (id: string): Promise<Sentence> => {
  return prisma.sentence.delete({
    where: { id }
  });
};

import { exec } from "child_process";
import util from "util";
const execPromise = util.promisify(exec);
/**
 * Runs production-safe Prisma migrations
 */
export const runMigrations = async (): Promise<string> => {
  try {
    const { stdout, stderr } = await execPromise(
      "npx prisma migrate deploy"
    );

    return stdout || stderr || "Migration completed";
  } catch (error: any) {
    throw new Error(`Migration failed: ${error.message}`);
  }