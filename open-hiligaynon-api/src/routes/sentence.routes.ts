import { Router } from "express";
import {
  createSentence,
  getSentences,
  getSentenceById,
  deleteSentence,
  migrateDatabase
} from "../controllers/sentence.controller.js";

const router = Router();

router.get("/", getSentences);
router.get("/:id", getSentenceById);
router.post("/", createSentence);
router.delete("/:id", deleteSentence);
router.post("/migrate", migrateDatabase);

export default router;