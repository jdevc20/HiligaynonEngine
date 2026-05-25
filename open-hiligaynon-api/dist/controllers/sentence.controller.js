import * as sentenceService from "../services/sentence.service.js";
export const getSentences = async (req, res) => {
    try {
        const rawPage = req.query.page;
        const rawLimit = req.query.limit;
        const rawSearch = req.query.search;
        const page = typeof rawPage === "string" ? parseInt(rawPage) : 1;
        const limit = typeof rawLimit === "string" ? parseInt(rawLimit) : 50;
        const search = typeof rawSearch === "string" ? rawSearch : undefined;
        const skip = (page - 1) * limit;
        const result = await sentenceService.getAllSentences({
            skip,
            take: limit,
            search,
        });
        return res.status(200).json(result);
    }
    catch (error) {
        console.error("[getSentences Error]:", error);
        return res.status(500).json({ error: "Failed to fetch sentences" });
    }
};
export const getSentenceById = async (req, res) => {
    try {
        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;
        if (!id) {
            return res.status(400).json({ error: "Invalid sentence id" });
        }
        const data = await sentenceService.getSentenceById(id);
        if (!data) {
            return res.status(404).json({ error: "Sentence not found" });
        }
        return res.status(200).json({ data });
    }
    catch (error) {
        console.error("[getSentenceById Error]:", error);
        return res.status(500).json({ error: "Failed to fetch the sentence" });
    }
};
export const createSentence = async (req, res) => {
    try {
        const { english, hiligaynon } = req.body;
        if (!english || !hiligaynon) {
            return res.status(400).json({
                error: "Both 'english' and 'hiligaynon' fields are required.",
            });
        }
        const data = await sentenceService.createSentence({
            english,
            hiligaynon,
        });
        return res.status(201).json({ data });
    }
    catch (error) {
        console.error("[createSentence Error]:", error);
        if (error.code === "P2002") {
            return res.status(409).json({ error: "A sentence with this text already exists" });
        }
        return res.status(500).json({ error: "Failed to create the sentence" });
    }
};
export const deleteSentence = async (req, res) => {
    try {
        const rawId = req.params.id;
        const id = Array.isArray(rawId) ? rawId[0] : rawId;
        if (!id) {
            return res.status(400).json({ error: "Invalid sentence id" });
        }
        await sentenceService.deleteSentence(id);
        return res
            .status(200)
            .json({ message: "Sentence deleted successfully" });
    }
    catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({ error: "Sentence not found" });
        }
        console.error("[deleteSentence Error]:", error);
        return res
            .status(500)
            .json({ error: "Failed to delete the sentence" });
    }
};
