import { Request, Response } from "express";
import * as sentenceService from "../services/sentence.service.js";

export const getSentences = async (req: Request, res: Response) => {
  try {
    const rawPage = req.query.page;
    const rawLimit = req.query.limit;
    const rawSearch = req.query.search;
    const rawSentiment = req.query.sentiment;
    const rawIsSarcastic = req.query.isSarcastic;
    const rawStatus = req.query.status;

    // Radix parameters and basic data transformations
    const page = typeof rawPage === "string" ? parseInt(rawPage, 10) : 1;
    const limit = typeof rawLimit === "string" ? parseInt(rawLimit, 10) : 50;
    const search = typeof rawSearch === "string" ? rawSearch : undefined;
    const status = typeof rawStatus === "string" ? rawStatus : undefined;
    
    // Evaluate explicit filters safely
    const sentiment = typeof rawSentiment === "string" ? parseInt(rawSentiment, 10) : undefined;
    const isSarcastic = typeof rawIsSarcastic === "string" ? rawIsSarcastic === "true" : undefined;

    // Validation layers to safeguard database pipelines
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return res.status(400).json({ 
        error: "Invalid pagination parameter", 
        details: "'page' and 'limit' must be positive integers." 
      });
    }

    if (sentiment !== undefined && (isNaN(sentiment) || sentiment < 0 || sentiment > 2)) {
      return res.status(400).json({
        error: "Invalid analytics parameter",
        details: "'sentiment' must be an integer: 0 (Negative), 1 (Neutral), or 2 (Positive)."
      });
    }

    const skip = (page - 1) * limit;

    const result = await sentenceService.getAllSentences({
      skip,
      take: limit,
      search,
      sentiment,
      isSarcastic,
      status
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[getSentences Error]:", error);
    return res.status(500).json({ 
      error: "Failed to fetch sentences",
      details: error?.message || "An unexpected error occurred."
    });
  }
};

export const getSentenceById = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      return res.status(400).json({ 
        error: "Missing required parameter",
        details: "A valid sentence ID is required."
      });
    }

    const data = await sentenceService.getSentenceById(id);

    if (!data) {
      return res.status(404).json({ 
        error: "Resource not found",
        details: `No sentence found with the ID: ${id}`
      });
    }

    return res.status(200).json({ data });
  } catch (error: any) {
    console.error("[getSentenceById Error]:", error);
    return res.status(500).json({ 
      error: "Failed to fetch the sentence",
      details: error?.message || "An unexpected error occurred."
    });
  }
};

export const createSentence = async (req: Request, res: Response) => {
  try {
    const { english, hiligaynon, sentiment, intent, isSarcastic, status } = req.body;

    if (!english || !hiligaynon) {
      return res.status(400).json({
        error: "Validation failed",
        details: "Both 'english' and 'hiligaynon' fields are required.",
      });
    }

    const data = await sentenceService.createSentence({
      english,
      hiligaynon,
      sentiment: sentiment !== undefined ? parseInt(sentiment, 10) : undefined,
      intent,
      isSarcastic: isSarcastic === true || isSarcastic === "true",
      status
    });

    return res.status(201).json({ data });
  } catch (error: any) {
    console.error("[createSentence Error]:", error);
    
    if (error?.code === "P2002") {
      return res.status(409).json({ 
        error: "Conflict", 
        details: "A sentence with this text already exists.",
        code: error.code
      });
    }

    return res.status(500).json({ 
      error: "Failed to create the sentence",
      details: error?.message || "An unexpected error occurred." 
    });
  }
};

export const deleteSentence = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
      return res.status(400).json({ 
        error: "Missing required parameter",
        details: "A valid sentence ID is required."
      });
    }

    await sentenceService.deleteSentence(id);

    return res.status(200).json({ message: "Sentence deleted successfully" });
  } catch (error: any) {
    console.error("[deleteSentence Error]:", error);

    if (error?.code === "P2025") {
      return res.status(404).json({ 
        error: "Resource not found",
        details: "Cannot delete because the specified sentence does not exist.",
        code: error.code
      });
    }

    return res.status(500).json({ 
      error: "Failed to delete the sentence",
      details: error?.message || "An unexpected error occurred."
    });
  }
};

export const deleteSentencesBulk = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: "The 'ids' field must be a non-empty array of strings."
      });
    }

    const result = await sentenceService.deleteSentencesBulk(ids);

    return res.status(200).json({
      message: "Sentences deleted successfully",
      deletedCount: result.count
    });
  } catch (error: any) {
    console.error("[deleteSentencesBulk Error]:", error);
    return res.status(500).json({
      error: "Failed to perform bulk deletion",
      details: error?.message || "An unexpected error occurred."
    });
  }
};

// 🆕 NEW: Thread-safe voting controller endpoint
export const castVote = async (req: Request, res: Response) => {
  try {
    const { sentenceId, type, userId } = req.body;
    
    // Fallbacks to extract network identifier accurately across reverse proxies (e.g., Nginx, Cloudflare)
    const ipAddress = 
      (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || 
      req.ip || 
      req.socket.remoteAddress || 
      "anonymous_client";

    if (!sentenceId || !type || (type !== "UP" && type !== "DOWN")) {
      return res.status(400).json({
        error: "Validation failed",
        details: "'sentenceId' is required, and 'type' must be explicitly 'UP' or 'DOWN'."
      });
    }

    const updatedSentence = await sentenceService.castVote({
      sentenceId,
      ipAddress,
      type,
      userId
    });

    return res.status(200).json({ data: updatedSentence });
  } catch (error: any) {
    console.error("[castVote Error]:", error);
    return res.status(500).json({
      error: "Failed to register vote",
      details: error?.message || "An unexpected error occurred."
    });
  }
};

export const migrateDatabase = async (req: Request, res: Response) => {
  try {
    const result = await sentenceService.runMigrations();

    res.status(200).json({
      message: "Migration executed successfully",
      output: result,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Migration failed",
      error: error.message,
    });
  }
};

