import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getAiSuggestions } from "../controllers/aiController.js";
import { chatWithAI } from "../controllers/aiChatController.js";

const aiRouter = exp.Router();

// Sanity check (public — no auth required)
aiRouter.get("/sanity", (req, res) =>
    res.json({ success: true, message: "AI Server is reachable" })
);

// GET /api/ai/suggestions — personalized portfolio AI analysis
aiRouter.get("/suggestions", verifyToken("trader"), getAiSuggestions);

// POST /api/ai/chat — AI conversational assistant (also in aiChatRoute but kept here for clarity)
// Note: actual implementation is in aiChatRoute.js, this avoids double-mounting
// The POST /chat in aiChatRouter handles /api/ai/chat via the separate mount in app.js

export default aiRouter;
