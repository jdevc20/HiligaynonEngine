import { Request, Response } from "express";
import * as engineService from "../services/engine.service.js";

export const dictionaryLookup = async (req: Request, res: Response) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const language =
      typeof req.query.language === "string" ? req.query.language.trim() : "hil";
    const limit =
      typeof req.query.limit === "string"
        ? Number.parseInt(req.query.limit, 10)
        : 25;

    if (!query) {
      return res.status(400).json({
        error: "Validation failed",
        details: "Query parameter 'q' is required.",
      });
    }

    const result = await engineService.searchDictionary(
      query,
      language || "hil",
      Number.isNaN(limit) ? 25 : limit
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[dictionaryLookup Error]:", error);
    return res.status(500).json({
      error: "Dictionary lookup failed",
      details: error?.message || "An unexpected error occurred.",
    });
  }
};

export const textAnalysis = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      return res.status(400).json({
        error: "Missing required parameter",
        details: "A text-unit ID is required.",
      });
    }

    const data = await engineService.getTextAnalysis(id);

    if (!data) {
      return res.status(404).json({
        error: "Resource not found",
        details: `No text unit found with ID: ${id}`,
      });
    }

    return res.status(200).json({ data });
  } catch (error: any) {
    console.error("[textAnalysis Error]:", error);
    return res.status(500).json({
      error: "Text analysis lookup failed",
      details: error?.message || "An unexpected error occurred.",
    });
  }
};

export const datasetExport = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const split = typeof req.query.split === "string" ? req.query.split : undefined;

    if (!id) {
      return res.status(400).json({
        error: "Missing required parameter",
        details: "A dataset ID is required.",
      });
    }

    const data = await engineService.exportDataset(id, split);

    if (!data) {
      return res.status(404).json({
        error: "Resource not found",
        details: `No dataset found with ID: ${id}`,
      });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("[datasetExport Error]:", error);
    return res.status(500).json({
      error: "Dataset export failed",
      details: error?.message || "An unexpected error occurred.",
    });
  }
};
