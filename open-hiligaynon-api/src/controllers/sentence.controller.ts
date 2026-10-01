import { Request, Response } from "express";
import type { HilitechRequest } from "../middleware/hilitech-auth.middleware.js";
import * as sentenceService from "../services/sentence.service.js";

const ALLOWED_STATUSES = new Set(["pending", "verified", "approved", "rejected"]);

const parseSentiment = (value: unknown) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? NaN : parsed;
};

const validateSemanticInput = (
  sentiment: number | undefined,
  status?: string,
  confidence?: number | null
) => {
  if (sentiment !== undefined && (Number.isNaN(sentiment) || sentiment < 0 || sentiment > 2)) {
    return "'sentiment' must be 0 (negative), 1 (neutral), or 2 (positive).";
  }

  if (status !== undefined && !ALLOWED_STATUSES.has(status)) {
    return "'status' must be pending, verified, approved, or rejected.";
  }

  if (
    confidence !== undefined &&
    confidence !== null &&
    (Number.isNaN(confidence) || confidence < 0 || confidence > 1)
  ) {
    return "'confidence' must be a number between 0 and 1.";
  }

  return null;
};

export const getSentences = async (req: Request, res: Response) => {
  try {
    const page = typeof req.query.page === "string" ? Number.parseInt(req.query.page, 10) : 1;
    const limit = typeof req.query.limit === "string" ? Number.parseInt(req.query.limit, 10) : 50;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const sentiment = parseSentiment(req.query.sentiment);
    const isSarcastic =
      typeof req.query.isSarcastic === "string"
        ? req.query.isSarcastic === "true"
        : undefined;

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 200) {
      return res.status(400).json({
        error: "Invalid pagination parameter",
        details: "'page' must be positive and 'limit' must be between 1 and 200.",
      });
    }

    const validationError = validateSemanticInput(sentiment, status);
    if (validationError) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationError,
      });
    }

    const result = await sentenceService.getAllSentences({
      skip: (page - 1) * limit,
      take: limit,
      search,
      sentiment,
      isSarcastic,
      status,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[getSentences Error]:", error);
    return res.status(500).json({
      error: "Failed to fetch translations",
      details: error?.message || "An unexpected error occurred.",
    });
  }
};

export const getSentenceById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      return res.status(400).json({
        error: "Missing required parameter",
        details: "A valid translation ID is required.",
      });
    }

    const data = await sentenceService.getSentenceById(id);

    if (!data) {
      return res.status(404).json({
        error: "Resource not found",
        details: `No translation found with ID: ${id}`,
      });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("[getSentenceById Error]:", error);
    return res.status(500).json({
      error: "Failed to fetch the translation",
      details: error?.message || "An unexpected error occurred.",
    });
  }
};

export const createSentence = async (req: HilitechRequest, res: Response) => {
  try {
    const {
      english,
      hiligaynon,
      intent,
      translationType,
      confidence,
      notes,
      register,
      domain,
    } = req.body;

    const sentiment = parseSentiment(req.body.sentiment);
    const parsedConfidence =
      confidence === undefined || confidence === null ? confidence : Number(confidence);
    const isSarcastic =
      req.body.isSarcastic === true || req.body.isSarcastic === "true";

    if (typeof english !== "string" || !english.trim() || typeof hiligaynon !== "string" || !hiligaynon.trim()) {
      return res.status(400).json({
        error: "Validation failed",
        details: "Both 'english' and 'hiligaynon' must be non-empty strings.",
      });
    }

    const validationError = validateSemanticInput(sentiment, undefined, parsedConfidence);
    if (validationError) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationError,
      });
    }

    const data = await sentenceService.createSentence({
      english: english.trim(),
      hiligaynon: hiligaynon.trim(),
      sentiment,
      intent,
      isSarcastic,
      contributorIdentityId: req.hilitechUser?.identityId ?? null,
      contributorType: req.hilitechUser ? "registered" : "guest",
      translationType,
      confidence: parsedConfidence,
      notes,
      register,
      domain,
    });

    return res.status(201).json({ data });
  } catch (error: any) {
    console.error("[createSentence Error]:", error);

    if (error?.code === "P2002") {
      return res.status(409).json({
        error: "Conflict",
        details: "This translation pair already exists.",
        code: error.code,
      });
    }

    return res.status(500).json({
      error: "Failed to create the translation",
      details: error?.message || "An unexpected error occurred.",
    });
  }
};

export const updateSentence = async (req: HilitechRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({
        error: "Missing required parameter",
        details: "A valid translation ID is required.",
      });
    }

    if (req.body.status !== undefined) {
      return res.status(400).json({
        error: "Use the moderation endpoint",
        details: "Translation status can only be changed through PATCH /api/sentences/:id/status.",
      });
    }

    const sentiment = parseSentiment(req.body.sentiment);
    const parsedConfidence =
      req.body.confidence === undefined || req.body.confidence === null
        ? req.body.confidence
        : Number(req.body.confidence);

    if (
      (req.body.english !== undefined && !String(req.body.english).trim()) ||
      (req.body.hiligaynon !== undefined && !String(req.body.hiligaynon).trim())
    ) {
      return res.status(400).json({
        error: "Validation failed",
        details: "Updated English/Hiligaynon text cannot be empty.",
      });
    }

    const validationError = validateSemanticInput(sentiment, undefined, parsedConfidence);

    if (validationError) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationError,
      });
    }

    const data = await sentenceService.updateSentence(id, {
      ...(req.body.english !== undefined ? { english: String(req.body.english).trim() } : {}),
      ...(req.body.hiligaynon !== undefined ? { hiligaynon: String(req.body.hiligaynon).trim() } : {}),
      ...(sentiment !== undefined ? { sentiment } : {}),
      ...(req.body.intent !== undefined ? { intent: req.body.intent } : {}),
      ...(req.body.isSarcastic !== undefined
        ? { isSarcastic: req.body.isSarcastic === true || req.body.isSarcastic === "true" }
        : {}),
      ...(req.body.translationType !== undefined
        ? { translationType: String(req.body.translationType) }
        : {}),
      ...(req.body.confidence !== undefined
        ? { confidence: parsedConfidence }
        : {}),
      ...(req.body.notes !== undefined ? { notes: req.body.notes } : {}),
      ...(req.body.register !== undefined ? { register: req.body.register } : {}),
      ...(req.body.domain !== undefined ? { domain: req.body.domain } : {}),
    });

    if (!data) {
      return res.status(404).json({
        error: "Resource not found",
        details: `No translation found with ID: ${id}`,
      });
    }

    return res.status(200).json({ data });
  } catch (error: any) {
    console.error("[updateSentence Error]:", error);

    if (error?.code === "P2002") {
      return res.status(409).json({
        error: "Conflict",
        details: "The updated translation would duplicate an existing translation pair.",
      });
    }

    return res.status(500).json({
      error: "Failed to update the translation",
      details: error?.message || "An unexpected error occurred.",
    });
  }
};

export const deleteSentence = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      return res.status(400).json({
        error: "Missing required parameter",
        details: "A valid translation ID is required.",
      });
    }

    await sentenceService.deleteSentence(id);
    return res.status(200).json({ message: "Translation deleted successfully" });
  } catch (error: any) {
    console.error("[deleteSentence Error]:", error);

    if (error?.code === "P2025") {
      return res.status(404).json({
        error: "Resource not found",
        details: "The specified translation does not exist.",
      });
    }

    return res.status(500).json({
      error: "Failed to delete the translation",
      details: error?.message || "An unexpected error occurred.",
    });
  }
};

export const deleteSentencesBulk = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0 || !ids.every((id) => typeof id === "string")) {
      return res.status(400).json({
        error: "Validation failed",
        details: "'ids' must be a non-empty array of translation IDs.",
      });
    }

    const result = await sentenceService.deleteSentencesBulk(ids);

    return res.status(200).json({
      message: "Translations deleted successfully",
      deletedCount: result.count,
    });
  } catch (error: any) {
    console.error("[deleteSentencesBulk Error]:", error);
    return res.status(500).json({
      error: "Failed to perform bulk deletion",
      details: error?.message || "An unexpected error occurred.",
    });
  }
};

export const castVote = async (req: HilitechRequest, res: Response) => {
  try {
    const { sentenceId, type } = req.body;

    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      "anonymous_client";

    if (!sentenceId || (type !== "UP" && type !== "DOWN")) {
      return res.status(400).json({
        error: "Validation failed",
        details: "'sentenceId' is required and 'type' must be 'UP' or 'DOWN'.",
      });
    }

    const data = await sentenceService.castVote({
      sentenceId,
      ipAddress,
      type,
      userId: req.hilitechUser?.identityId,
    });

    if (!data) {
      return res.status(404).json({
        error: "Resource not found",
        details: "The specified translation does not exist.",
      });
    }

    return res.status(200).json({ data });
  } catch (error: any) {
    console.error("[castVote Error]:", error);
    return res.status(500).json({
      error: "Failed to register vote",
      details: error?.message || "An unexpected error occurred.",
    });
  }
};


export const updateSentenceStatus = async (
  req: HilitechRequest,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const targetStatus = req.body.status as string | undefined;
    const actor = req.hilitechUser;

    if (!id) {
      return res.status(400).json({
        error: "Missing required parameter",
        details: "A valid translation ID is required.",
      });
    }

    if (!actor) {
      return res.status(401).json({
        error: "Authentication required",
        details: "Sign in with Hilitech Authentication to moderate contributions.",
      });
    }

    if (targetStatus !== "approved" && targetStatus !== "verified") {
      return res.status(400).json({
        error: "Invalid moderation status",
        details: "Registered users may approve pending contributions; admins may verify approved contributions.",
      });
    }

    const existing = await sentenceService.getSentenceById(id);

    if (!existing) {
      return res.status(404).json({
        error: "Resource not found",
        details: `No translation found with ID: ${id}`,
      });
    }

    if (targetStatus === "approved") {
      if (existing.status !== "pending") {
        return res.status(409).json({
          error: "Invalid status transition",
          details: `Only pending contributions can be approved. Current status: ${existing.status}.`,
        });
      }
    } else {
      const isAdmin = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";

      if (!isAdmin) {
        return res.status(403).json({
          error: "Admin permission required",
          details: "Only Hilitech ADMIN or SUPER_ADMIN accounts can verify contributions.",
        });
      }

      if (existing.status !== "approved") {
        return res.status(409).json({
          error: "Invalid status transition",
          details: `Only approved contributions can be verified. Current status: ${existing.status}.`,
        });
      }
    }

    const data = await sentenceService.setModerationStatus(
      id,
      targetStatus,
      actor.identityId
    );

    if (!data) {
      return res.status(409).json({
        error: "Status changed concurrently",
        details: "The contribution changed while it was being moderated. Refresh and try again.",
      });
    }

    return res.status(200).json({ data });
  } catch (error: any) {
    console.error("[updateSentenceStatus Error]:", error);
    return res.status(500).json({
      error: "Failed to update moderation status",
      details: error?.message || "An unexpected error occurred.",
    });
  }
};
