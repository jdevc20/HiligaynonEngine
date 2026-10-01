import { Router } from "express";
import {
  castVote,
  createSentence,
  deleteSentence,
  deleteSentencesBulk,
  getSentenceById,
  getSentences,
  updateSentence,
  updateSentenceStatus,
} from "../controllers/sentence.controller.js";
import {
  optionalHilitechAuth,
  requireHilitechAdmin,
  requireHilitechAuth,
} from "../middleware/hilitech-auth.middleware.js";

const router = Router();

router.use(optionalHilitechAuth);

router.get("/", getSentences);
router.post("/", createSentence);
router.post("/bulk-delete", requireHilitechAdmin, deleteSentencesBulk);
router.post("/vote", castVote);

router.get("/:id", getSentenceById);
router.patch("/:id/status", requireHilitechAuth, updateSentenceStatus);
router.patch("/:id", requireHilitechAuth, updateSentence);
router.delete("/:id", requireHilitechAdmin, deleteSentence);

export default router;
