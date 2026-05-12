import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { chatWithAI, clearChatMemory } from "../controllers/aiChatController.js";

const router = exp.Router();

// POST /api/ai/chat — send a message to Alpha-Insight AI
router.post("/chat", verifyToken("trader"), chatWithAI);

// DELETE /api/ai/chat/clear — wipe server-side conversation memory
router.delete("/chat/clear", verifyToken("trader"), clearChatMemory);

export default router;