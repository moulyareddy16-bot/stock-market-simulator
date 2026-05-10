import mongoose from "mongoose";
import { userModel } from "../models/UserModel.js";
import { transactionModel } from "../models/transactionModel.js";
import { stockCache } from "../services/cacheService.js";

// ──────────────────────────────────────────────
// LEADERBOARD — MongoDB Aggregation Pipeline
// Replaces the previous in-memory JS approach that loaded
// ALL transactions for ALL users into Node.js RAM.
// ──────────────────────────────────────────────
export const getLeaderboard = async (req, res) => {
    try {
        // ── STEP 1: Get all traders ──
        const traders = await userModel
            .find({ role: "trader" })
            .select("-password")
            .lean();

        if (!traders.length) {
            return res.status(200).json({ message: "Leaderboard fetched", payload: [] });
        }

        const traderIds = traders.map((t) => t._id);

        // ── STEP 2: Aggregate transaction stats per user via MongoDB pipeline ──
        // This runs in the DB, not in Node.js RAM — scales to millions of transactions
        const txStats = await transactionModel.aggregate([
            {
                $match: {
                    userId: { $in: traderIds },
                },
            },
            {
                $group: {
                    _id: { userId: "$userId", stockSymbol: "$stockSymbol", transactionType: "$transactionType" },
                    totalQty: { $sum: "$quantity" },
                    totalSpent: { $sum: { $multiply: ["$quantity", "$pricePerShare"] } },
                    count: { $sum: 1 },
                    lastPrice: { $last: "$pricePerShare" },
                    trades: { $push: { qty: "$quantity", price: "$pricePerShare", date: "$createdAt" } },
                },
            },
        ]);

        // ── STEP 3: Also aggregate sell data for win rate ──
        const sellStats = await transactionModel.aggregate([
            {
                $match: {
                    userId: { $in: traderIds },
                    transactionType: "SELL",
                },
            },
            {
                $group: {
                    _id: "$userId",
                    totalSells: { $sum: 1 },
                },
            },
        ]);

        const totalTradesPerUser = await transactionModel.aggregate([
            {
                $match: { userId: { $in: traderIds } },
            },
            {
                $group: {
                    _id: "$userId",
                    totalTrades: { $sum: 1 },
                },
            },
        ]);

        // Index for quick lookup
        const sellMap = Object.fromEntries(sellStats.map((s) => [s._id.toString(), s.totalSells]));
        const tradeCountMap = Object.fromEntries(totalTradesPerUser.map((s) => [s._id.toString(), s.totalTrades]));

        // ── STEP 4: Build per-trader leaderboard entry ──
        const leaderboard = traders.map((user) => {
            const uid = user._id.toString();
            const totalTrades = tradeCountMap[uid] || 0;

            // Build holdings from aggregated BUY/SELL groups
            const buyGroups = txStats.filter(
                (g) => g._id.userId.toString() === uid && g._id.transactionType === "BUY"
            );
            const sellGroups = txStats.filter(
                (g) => g._id.userId.toString() === uid && g._id.transactionType === "SELL"
            );

            const holdingsMap = {};
            for (const g of buyGroups) {
                const sym = g._id.stockSymbol;
                if (!holdingsMap[sym]) holdingsMap[sym] = { qty: 0, totalInvested: 0, lastBuyPrice: g.lastPrice };
                holdingsMap[sym].qty += g.totalQty;
                holdingsMap[sym].totalInvested += g.totalSpent;
                holdingsMap[sym].lastBuyPrice = g.lastPrice;
            }
            for (const g of sellGroups) {
                const sym = g._id.stockSymbol;
                if (holdingsMap[sym]) holdingsMap[sym].qty -= g.totalQty;
            }

            // Portfolio value using cache or last known price
            let portfolioValue = 0;
            for (const [sym, data] of Object.entries(holdingsMap)) {
                if (data.qty > 0) {
                    const cachedPrice = stockCache.get(`stock_${sym}`)?.currentPrice;
                    const price = cachedPrice || data.lastBuyPrice || 0;
                    portfolioValue += data.qty * price;
                }
            }

            const initialBalance = 100000;
            const currentWallet = user.walletBalance || 0;
            const totalProfit = portfolioValue + currentWallet - initialBalance;

            // ── WIN RATE: profitable sells / total sells ──
            // Simplified: if trader has positive overall P&L, estimated via profit sign
            // TODO Step 7: enhance with per-trade P&L tracking using avg cost basis
            const totalSells = sellMap[uid] || 0;
            // Estimate: if net profit is positive and they sold, count as wins proportional
            const estimatedWinRate = totalSells > 0
                ? Math.min(100, Math.max(0, 50 + (totalProfit / (initialBalance / 2)) * 30))
                : 0;

            const winRate = Number(estimatedWinRate.toFixed(2));

            // ── SCORE FORMULA: Normalized 0–100 before weighting ──
            // All components normalized to 0–100 range first — no dimensional mixing
            const profitScore = Math.min(100, Math.max(0, 50 + (totalProfit / initialBalance) * 50));
            const tradeActivityScore = Math.min(100, totalTrades * 2); // 50 trades = full score
            const consistencyScore = totalTrades > 10 ? winRate : winRate * 0.5;

            const score = Math.round(
                profitScore      * 0.50 +   // 50% weight: did they make money?
                winRate          * 0.25 +   // 25% weight: win rate
                consistencyScore * 0.15 +   // 15% weight: consistency
                tradeActivityScore * 0.10   // 10% weight: activity
            );

            return {
                _id: user._id,
                username: user.username,
                profileImage: user.profileImage || "",
                totalProfit: Number(totalProfit.toFixed(2)),
                totalTrades,
                winRate,
                portfolioValue: Number(portfolioValue.toFixed(2)),
                score: Math.max(0, score),
            };
        });

        // Sort by score descending
        leaderboard.sort((a, b) => b.score - a.score);

        res.status(200).json({
            message: "Leaderboard fetched",
            payload: leaderboard,
        });

    } catch (error) {
        console.error("Leaderboard error:", error);
        res.status(500).json({ message: "Unable to fetch leaderboard" });
    }
};
