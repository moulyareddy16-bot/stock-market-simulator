import { userModel } from "../models/UserModel.js";
import { transactionModel } from "../models/transactionModel.js";

import { analyzePortfolioWithAI }
from "../services/ai/aiPortfolioAnalyzer.js";

import {
    getCachedAIResponse,
    setCachedAIResponse,
}
from "../services/ai/aiCacheService.js";

export const getAiSuggestions = async (req, res) => {

    try {

        console.log("AI Controller hit");

        const userId = req.user.id;

        // ============================
        // CACHE CHECK
        // ============================

        const cached =
            getCachedAIResponse(userId);

        if (cached) {

            console.log("Returning AI cache");

            return res.status(200).json({
                success: true,
                payload: cached,
                cached: true,
            });
        }

        // ============================
        // USER DATA
        // ============================

        const user =
            await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // ============================
        // TRANSACTIONS
        // ============================

        const transactions =
            await transactionModel.find({
                userId,
            });

        // ============================
        // USER PROFILE
        // ============================

        const userProfile = {

            riskTolerance: "Medium",

            timeHorizon: "Long Term",

            primaryGoal: "Growth",

            username: user.username,

            balance: user.walletBalance,
        };

        // ============================
        // PORTFOLIO DATA
        // ============================

        const portfolioData =
            transactions.map((tx) => ({

                symbol: tx.stockSymbol,

                quantity: tx.quantity,

                price: tx.pricePerShare,

                type: tx.transactionType,

                total: tx.totalAmount,
            }));

        // ============================
        // MOCK MARKET DATA
        // STEP 7 => REAL FINNHUB
        // ============================

        const marketData = [
            {
                symbol: "AAPL",
                currentPrice: 210,
                rsi: 62,
                movingAverage50: 195,
                sentiment: 0.82,
                volatility: "Medium",
            },
            {
                symbol: "TSLA",
                currentPrice: 171,
                rsi: 78,
                movingAverage50: 165,
                sentiment: 0.42,
                volatility: "High",
            },
            {
                symbol: "NVDA",
                currentPrice: 980,
                rsi: 69,
                movingAverage50: 910,
                sentiment: 0.91,
                volatility: "Medium",
            },
        ];

        // ============================
        // AI ANALYSIS
        // ============================

        const aiResult =
            await analyzePortfolioWithAI({

                userProfile,

                portfolioData,

                marketData,
            });

        // ============================
        // SAVE CACHE
        // ============================

        setCachedAIResponse(
            userId,
            aiResult
        );

        // ============================
        // RESPONSE
        // ============================

        return res.status(200).json({
            success: true,
            payload: aiResult,
        });

    } catch (err) {

        console.log("AI ERROR:", err);

        return res.status(500).json({

            success: false,

            message:
                "AI analysis failed",
        });
    }
};