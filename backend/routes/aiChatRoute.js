import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { chatWithAI } from "../controllers/aiChatController.js";

const router = exp.Router();

// POST /api/ai/chat — AI conversational assistant
router.post(
    "/chat",
    verifyToken("trader"),
    chatWithAI
);

export default router;