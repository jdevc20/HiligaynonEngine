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


export const generateDataset = async (req: Request, res: Response) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const version =
      typeof req.body.version === "string" ? req.body.version.trim() : "1.0";
    const description =
      typeof req.body.description === "string" && req.body.description.trim()
        ? req.body.description.trim()
        : null;
    const license =
      typeof req.body.license === "string" && req.body.license.trim()
        ? req.body.license.trim()
        : null;
    const domain =
      typeof req.body.domain === "string" && req.body.domain.trim()
        ? req.body.domain.trim()
        : undefined;
    const register =
      typeof req.body.register === "string" && req.body.register.trim()
        ? req.body.register.trim()
        : undefined;

    const minConfidence =
      req.body.minConfidence === undefined ||
      req.body.minConfidence === null ||
      req.body.minConfidence === ""
        ? undefined
        : Number(req.body.minConfidence);

    const maxItems =
      req.body.maxItems === undefined ||
      req.body.maxItems === null ||
      req.body.maxItems === ""
        ? 10000
        : Number(req.body.maxItems);

    const trainPercent =
      req.body.trainPercent === undefined ? 80 : Number(req.body.trainPercent);
    const validationPercent =
      req.body.validationPercent === undefined
        ? 10
        : Number(req.body.validationPercent);
    const testPercent =
      req.body.testPercent === undefined ? 10 : Number(req.body.testPercent);

    const excludeSarcastic = req.body.excludeSarcastic !== false;
    const requireProvenance = req.body.requireProvenance === true;

    if (!name) {
      return res.status(400).json({
        error: "Validation failed",
        details: "Dataset name is required.",
      });
    }

    if (!version) {
      return res.status(400).json({
        error: "Validation failed",
        details: "Dataset version is required.",
      });
    }

    if (
      minConfidence !== undefined &&
      (Number.isNaN(minConfidence) ||
        minConfidence < 0 ||
        minConfidence > 1)
    ) {
      return res.status(400).json({
        error: "Validation failed",
        details: "Minimum confidence must be between 0 and 1.",
      });
    }

    if (
      !Number.isInteger(maxItems) ||
      maxItems < 1 ||
      maxItems > 100000
    ) {
      return res.status(400).json({
        error: "Validation failed",
        details: "Maximum records must be an integer between 1 and 100000.",
      });
    }

    const percentages = [trainPercent, validationPercent, testPercent];

    if (
      percentages.some(
        (value) =>
          Number.isNaN(value) ||
          value < 0 ||
          value > 100
      ) ||
      trainPercent + validationPercent + testPercent !== 100
    ) {
      return res.status(400).json({
        error: "Validation failed",
        details:
          "Train, validation, and test percentages must each be between 0 and 100 and total exactly 100.",
      });
    }

    const data = await engineService.generateDataset({
      name,
      version,
      description,
      license,
      domain,
      register,
      minConfidence,
      maxItems,
      excludeSarcastic,
      requireProvenance,
      trainPercent,
      validationPercent,
      testPercent,
    });

    if (!data) {
      return res.status(422).json({
        error: "No eligible translations",
        details:
          "No verified translations matched the selected dataset filters.",
      });
    }

    return res.status(201).json({ data });
  } catch (error: any) {
    console.error("[generateDataset Error]:", error);

    if (error?.code === "P2002") {
      return res.status(409).json({
        error: "Dataset already exists",
        details:
          "A dataset with the same name and version already exists. Choose a new version.",
      });
    }

    return res.status(500).json({
      error: "Dataset generation failed",
      details: error?.message || "An unexpected error occurred.",
    });
  }
};
