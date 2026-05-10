import { userModel } from "../models/UserModel.js";
import { transactionModel } from "../models/transactionModel.js";
import { generateAIChatResponse } from "../services/ai/aiConversationService.js";

// ──────────────────────────────────────────────
// CHAT WITH AI
// POST /api/ai/chat
// ──────────────────────────────────────────────
export const chatWithAI = async (req, res) => {
    try {
        const userId = req.user.id;
        const { message } = req.body;

        // ── INPUT VALIDATION ──
        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Message is required and must be a non-empty string",
            });
        }

        // Limit message length to prevent prompt injection / abuse
        if (message.length > 1000) {
            return res.status(400).json({
                success: false,
                message: "Message too long. Please keep it under 1000 characters.",
            });
        }

        const sanitizedMessage = message.trim();

        // ── FETCH USER ──
        const user = await userModel.findById(userId).select("-password").lean();
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ── FETCH PORTFOLIO CONTEXT ──
        const transactions = await transactionModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .limit(50)   // Last 50 transactions are enough for context
            .lean();

        // Build net holdings for AI context
        const holdingsMap = {};
        for (const tx of transactions) {
            const sym = tx.stockSymbol;
            if (!holdingsMap[sym]) holdingsMap[sym] = { symbol: sym, quantity: 0, totalInvested: 0 };
            if (tx.transactionType === "BUY") {
                holdingsMap[sym].quantity += tx.quantity;
                holdingsMap[sym].totalInvested += tx.totalAmount;
            } else {
                holdingsMap[sym].quantity -= tx.quantity;
            }
        }

        const portfolioData = Object.values(holdingsMap)
            .filter((h) => h.quantity > 0)
            .map((h) => ({
                symbol: h.symbol,
                quantity: h.quantity,
                totalInvested: h.totalInvested,
            }));

        // Market data — neutral placeholders until STEP 7 real Finnhub pipeline
        const marketData = portfolioData.map((p) => ({
            symbol: p.symbol,
            rsi: 50,
            sentiment: 0.5,
        }));

        // ── GENERATE RESPONSE ──
        const response = await generateAIChatResponse({
            userId,
            message: sanitizedMessage,
            portfolioData,
            marketData,
        });

        return res.status(200).json({
            success: true,
            response,  // ← key is "response" — matches AIChatPanel.jsx expectation
        });

    } catch (err) {
        console.error("AI Chat Controller ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "AI chat service temporarily unavailable. Please try again shortly.",
        });
    }
};