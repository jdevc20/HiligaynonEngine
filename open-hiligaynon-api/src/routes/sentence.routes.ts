import { Router } from "express";
import {
  createSentence,
  getSentences,
  getSentenceById,
  deleteSentence,
  deleteSentencesBulk, // 1. Import the new controller function
  migrateDatabase
} from "../controllers/sentence.controller.js";

const router = Router();

// Collection routes (Plural/Bulk actions)
router.get("/", getSentences);
router.post("/", createSentence);
router.post("/bulk-delete", deleteSentencesBulk); // 2. Added the bulk delete route
router.post("/migrate", migrateDatabase);

// Individual item routes (Resource ID actions)
router.get("/:id", getSentenceById);
router.delete("/:id", deleteSentence);

export default router;