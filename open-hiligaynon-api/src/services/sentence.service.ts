import { Prisma } from "@prisma/client";
import { Sentence } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

/**
 * Advanced Normalization:
 * - Lowercases and trims.
 * - Strips punctuation EXCEPT hyphens and apostrophes (critical for 
 * Hiligaynon words like "adlaw-adlaw" or "wala'y").
 * - Collapses multiple spaces.
 */
const normalize = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\_`~()]/g, "")
    .replace(/\s{2,}/g, " ");
};

// 📈 Extended to support filtering by semantic and sentiment values
export interface SentenceQueryParams {
  skip?: number;
  take?: number;
  search?: string;
  sentiment?: number;    // Filter by 0 (Neg), 1 (Neu), 2 (Pos)
  isSarcastic?: boolean; // Isolate sarcastic training sets
  status?: string;       // pending | verified | rejected
}

// Dynamic Search + Paginated Transaction Fetch
export const getAllSentences = async (params: SentenceQueryParams = {}) => {
  const { skip = 0, take = 50, search, sentiment, isSarcastic, status } = params;

  // Build a highly targeted query object dynamically
  const where: Prisma.SentenceWhereInput = {};

  if (search) {
    where.OR = [
      { normalizedEnglish: { contains: normalize(search) } },
      { normalizedHiligaynon: { contains: normalize(search) } }
    ];
  }

  // Inject exact analytic filter matches if requested by the client pipeline
  if (sentiment !== undefined) where.sentiment = sentiment;
  if (isSarcastic !== undefined) where.isSarcastic = isSarcastic;
  if (status !== undefined) where.status = status;

  // The $transaction pattern: Fetches data AND total count concurrently
  const [sentences, totalCount] = await prisma.$transaction([
    prisma.sentence.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { tokens: true } } // Safely includes light metadata summary
      }
    }),
    prisma.sentence.count({ where })
  ]);

  return {
    items: sentences,
    meta: { total: totalCount, skip, take }
  };
};

export const getSentenceById = async (id: string) => {
  return prisma.sentence.findUnique({
    where: { id },
    include: { tokens: true } // Keeps relationship lookups intact
  });
};

// 🧠 DTO expanded to map semantic attributes during early record ingestions
type CreateSentenceInput = {
  english: string;
  hiligaynon: string;
  sentiment?: number;
  intent?: string;
  isSarcastic?: boolean;
  status?: string;
};

export const createSentence = async (data: CreateSentenceInput): Promise<Sentence> => {
  return prisma.sentence.create({
    data: {
      english: data.english,
      hiligaynon: data.hiligaynon,
      normalizedEnglish: normalize(data.english),
      normalizedHiligaynon: normalize(data.hiligaynon),
      sentiment: data.sentiment ?? 1,
      intent: data.intent,
      isSarcastic: data.isSarcastic ?? false,
      status: data.status ?? "pending"
    }
  });
};

export const deleteSentence = async (id: string): Promise<Sentence> => {
  return prisma.sentence.delete({
    where: { id }
  });
};

// Highly Optimized Bulk Delete Method (Cascade deletes dependent tokens automatically)
export const deleteSentencesBulk = async (ids: string[]): Promise<Prisma.BatchPayload> => {
  return prisma.sentence.deleteMany({
    where: {
      id: { in: ids }
    }
  });
};

export interface CastVoteInput {
  sentenceId: string;
  ipAddress: string;
  type: "UP" | "DOWN";
  userId?: string;
}

/**
 * ⚡ ATOMIC VOTING ENGINE
 * Prevents network duplicate injection attacks and handles counter toggling safely
 */
export const castVote = async (data: CastVoteInput): Promise<Sentence> => {
  const { sentenceId, ipAddress, type, userId } = data;

  return prisma.$transaction(async (tx) => {
    // 1. Verify if this exact network footprint has already logged a vote here
    const existingVote = await tx.vote.findUnique({
      where: {
        sentenceId_ipAddress: { sentenceId, ipAddress }
      }
    });

    if (existingVote) {
      // Case A: User clicked the same action button again -> Treat as toggle-off (Undo vote)
      if (existingVote.type === type) {
        await tx.vote.delete({ where: { id: existingVote.id } });
        return tx.sentence.update({
          where: { id: sentenceId },
          data: {
            [type === "UP" ? "upVotes" : "downVotes"]: { decrement: 1 }
          }
        });
      }

      // Case B: User switched their position (e.g., Changed Downvote directly to Upvote)
      await tx.vote.update({
        where: { id: existingVote.id },
        data: { type }
      });

      return tx.sentence.update({
        where: { id: sentenceId },
        data: {
          upVotes: { [type === "UP" ? "increment" : "decrement"]: 1 },
          downVotes: { [type === "DOWN" ? "increment" : "decrement"]: 1 }
        }
      });
    }

    // Case C: Fresh completely untracked vote
    await tx.vote.create({
      data: { sentenceId, ipAddress, type, userId }
    });

    return tx.sentence.update({
      where: { id: sentenceId },
      data: {
        [type === "UP" ? "upVotes" : "downVotes"]: { increment: 1 }
      }
    });
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
};
