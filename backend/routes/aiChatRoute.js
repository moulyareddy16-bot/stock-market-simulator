import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { askAIChat } from "../controllers/aiChatController.js";

const router = exp.Router();

router.post(
  "/chat",
  verifyToken("trader"),
  askAIChat
);

export default router;