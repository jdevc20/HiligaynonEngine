import * as sentenceService from "../services/sentence.service.js";

export const getSentences = async (req, res) => {
    try {
        const rawPage = req.query.page;
        const rawLimit = req.query.limit;
        const rawSearch = req.query.search;

        // Added radix 10 to parseInt for safety
        const page = typeof rawPage === "string" ? parseInt(rawPage, 10) : 1;
        const limit = typeof rawLimit === "string" ? parseInt(rawLimit, 10) : 50;
        const search = typeof rawSearch === "string" ? rawSearch : undefined;

        // Added validation to prevent NaN or negative values from crashing the query
        if (isNaN(page) || page < 1) {
            return res.status(400).json({ 
                error: "Invalid pagination parameter", 
                details: "'page' must be a valid positive integer." 
            });
        }
        if (isNaN(limit) || limit < 1) {
            return res.status(400).json({ 
                error: "Invalid pagination parameter", 
                details: "'limit' must be a valid positive integer." 
            });
        }

        const skip = (page - 1) * limit;

        const result = await sentenceService.getAllSentences({
            skip,
            take: limit,
            search,
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error("[getSentences Error]:", error);
        return res.status(500).json({ 
            error: "Failed to fetch sentences",
            details: error.message || "An unexpected error occurred while querying the database." 
        });
    }
};

export const getSentenceById = async (req, res) => {
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
    } catch (error) {
        console.error("[getSentenceById Error]:", error);
        return res.status(500).json({ 
            error: "Failed to fetch the sentence",
            details: error.message || "An unexpected error occurred while retrieving the record."
        });
    }
};

export const createSentence = async (req, res) => {
    try {
        const { english, hiligaynon } = req.body;

        if (!english || !hiligaynon) {
            return res.status(400).json({
                error: "Validation failed",
                details: "Both 'english' and 'hiligaynon' fields are strictly required to create a sentence."
            });
        }

        const data = await sentenceService.createSentence({
            english,
            hiligaynon,
        });

        return res.status(201).json({ data });
    } catch (error) {
        console.error("[createSentence Error]:", error);
        
        // Detailed handling for Prisma's unique constraint violation
        if (error.code === "P2002") {
            return res.status(409).json({ 
                error: "Conflict", 
                details: "A sentence with this text already exists in the database.",
                code: error.code
            });
        }

        return res.status(500).json({ 
            error: "Failed to create the sentence", 
            details: error.message || "An unexpected error occurred during insertion." 
        });
    }
};

export const deleteSentence = async (req, res) => {
    try {
        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;

        if (!id) {
            return res.status(400).json({ 
                error: "Missing required parameter",
                details: "A valid sentence ID is required to perform a deletion." 
            });
        }

        await sentenceService.deleteSentence(id);
        
        return res.status(200).json({ message: "Sentence deleted successfully" });
    } catch (error) {
        console.error("[deleteSentence Error]:", error);

        // Detailed handling for Prisma's record not found error
        if (error.code === "P2025") {
            return res.status(404).json({ 
                error: "Resource not found",
                details: "Cannot delete because the specified sentence does not exist.",
                code: error.code
            });
        }

        return res.status(500).json({ 
            error: "Failed to delete the sentence",
            details: error.message || "An unexpected error occurred during deletion."
        });
    }
};
