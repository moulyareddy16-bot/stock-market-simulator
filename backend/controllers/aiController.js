import { userModel } from "../models/UserModel.js";
import { transactionModel } from "../models/transactionModel.js";
import { analyzePortfolioWithAI } from "../services/ai/aiPortfolioAnalyzer.js";
import { getCachedAIResponse, setCachedAIResponse } from "../services/ai/aiCacheService.js";
import axios from "axios";

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

        // ── MARKET DATA (REAL-TIME FINNHUB PIPELINE) ──
        const marketData = await Promise.all(portfolioData.map(async (p) => {
            try {
                // Fetch real-time quote
                const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${p.symbol}&token=${process.env.FINNHUB_API_KEY}`);
                const data = response.data;
                
                const currentPrice = data.c || 0;
                const dp = data.dp || 0; // Daily percentage change

                // Heuristic RSI based on daily momentum (0 to 100)
                // A neutral day (0%) gives RSI 50. +5% gives 75. -5% gives 25.
                const rsi = Math.min(100, Math.max(0, 50 + (dp * 5)));

                // Heuristic Sentiment based on daily momentum (0 to 1)
                const sentiment = Math.min(1, Math.max(0, 0.5 + (dp / 10)));

                // Determine volatility class based on magnitude of change
                let volatility = "Medium";
                if (Math.abs(dp) > 4) volatility = "High";
                else if (Math.abs(dp) < 1) volatility = "Low";

                return {
                    symbol: p.symbol,
                    currentPrice,
                    rsi: Number(rsi.toFixed(2)),
                    sentiment: Number(sentiment.toFixed(2)),
                    volatility,
                    note: `Real-time Finnhub data (dp: ${dp.toFixed(2)}%)`,
                };
            } catch (err) {
                console.error(`Failed to fetch Finnhub data for ${p.symbol}:`, err.message);
                return {
                    symbol: p.symbol,
                    currentPrice: p.avgBuyPrice, // Fallback
                    rsi: 50,
                    sentiment: 0.5,
                    volatility: "Medium",
                    note: "Fallback data (API error)",
                };
            }
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