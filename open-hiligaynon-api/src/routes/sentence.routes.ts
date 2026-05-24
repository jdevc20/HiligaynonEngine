import { Router } from "express";
import {
  createSentence,
  getSentences,
  getSentenceById,
  deleteSentence
} from "../controllers/sentence.controller.js";

const router = Router();

router.get("/", getSentences);
router.get("/:id", getSentenceById);
router.post("/", createSentence);
router.delete("/:id", deleteSentence);

export default router;