import exp from "express"
import { verifyToken } from "../middleware/verifyToken.js"
import { getAiSuggestions } from "../controllers/aiController.js"
import {
    chatWithAI
}
from "../controllers/aiChatController.js";

const aiRouter = exp.Router()

// Sanity check (Public/No-Auth)
aiRouter.get("/sanity", (req, res) => res.json({ success: true, message: "AI Server is reachable" }));

// Only traders can get personalized AI suggestions
aiRouter.get("/suggestions", verifyToken("trader"), getAiSuggestions)

aiRouter.post(
    "/chat",
    verifyToken("trader"),
    chatWithAI
);

export default aiRouter
