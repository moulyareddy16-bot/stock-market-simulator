import { userModel } from "../models/UserModel.js";
import { transactionModel } from "../models/transactionModel.js";
import { analyzePortfolioWithAI } from "../services/ai/aiPortfolioAnalyzer.js";
import { getCachedAIResponse, setCachedAIResponse } from "../services/ai/aiCacheService.js";

// ──────────────────────────────────────────────
// GET AI SUGGESTIONS — Full portfolio analysis
// ──────────────────────────────────────────────
export const getAiSuggestions = async (req, res) => {
    try {
        console.log("AI Controller: suggestion request for user:", req.user.id);

        const userId = req.user.id;

        // ── CACHE CHECK ──
        const cached = getCachedAIResponse(userId);
        if (cached) {
            console.log("AI Controller: returning cached response");
            return res.status(200).json({ success: true, payload: cached, cached: true });
        }

        // ── FETCH REAL USER DATA ──
        const user = await userModel.findById(userId).select("-password").lean();
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ── FETCH REAL TRANSACTIONS ──
        const transactions = await transactionModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        // ── BUILD REAL USER PROFILE (reads actual DB fields — not hardcoded) ──
        const userProfile = {
            username: user.username,
            balance: user.walletBalance,
            riskTolerance: user.riskTolerance || "Medium",   // real field from UserModel
            timeHorizon: user.timeHorizon || "Long Term",     // real field from UserModel
            primaryGoal: user.goal || "Growth",               // real field from UserModel
            totalTrades: transactions.length,
        };

        // ── BUILD PORTFOLIO FROM REAL TRANSACTIONS ──
        // Net holdings map (BUY - SELL aggregation)
        const holdingsMap = {};
        for (const tx of transactions) {
            const sym = tx.stockSymbol;
            if (!holdingsMap[sym]) holdingsMap[sym] = { symbol: sym, netQty: 0, totalInvested: 0 };
            if (tx.transactionType === "BUY") {
                holdingsMap[sym].netQty += tx.quantity;
                holdingsMap[sym].totalInvested += tx.totalAmount;
            } else {
                holdingsMap[sym].netQty -= tx.quantity;
                holdingsMap[sym].totalInvested -= tx.totalAmount;
            }
        }

        const portfolioData = Object.values(holdingsMap)
            .filter((h) => h.netQty > 0)
            .map((h) => ({
                symbol: h.symbol,
                quantity: h.netQty,
                avgBuyPrice: h.netQty > 0 ? h.totalInvested / h.netQty : 0,
                totalInvested: h.totalInvested,
            }));

        // ── MARKET DATA ──
        // TODO Step 7: Replace with real Finnhub RSI/sentiment pipeline
        // Currently uses a placeholder that will be replaced in STEP 7
        const marketData = portfolioData.map((p) => ({
            symbol: p.symbol,
            // These will be replaced by real Finnhub calculations in STEP 7
            currentPrice: 0,
            rsi: 50,            // neutral placeholder
            sentiment: 0.5,     // neutral placeholder
            volatility: "Medium",
            note: "Real market data coming in STEP 7",
        }));

        // ── AI ANALYSIS ──
        const aiResult = await analyzePortfolioWithAI({
            userProfile,
            portfolioData,
            marketData,
        });

        // ── CACHE RESULT ──
        setCachedAIResponse(userId, aiResult);

        return res.status(200).json({ success: true, payload: aiResult });

    } catch (err) {
        console.error("AI Controller ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "AI analysis failed. Please try again shortly.",
        });
    }
};