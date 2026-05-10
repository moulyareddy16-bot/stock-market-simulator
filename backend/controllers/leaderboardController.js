import { userModel } from "../models/UserModel.js";
import { transactionModel } from "../models/TransactionModel.js";
import { stockCache } from "../services/cacheService.js";

export const getLeaderboard = async (req, res) => {
  try {
    const traders = await userModel.find({ role: "trader" }).select("-password");
    const transactions = await transactionModel.find();

    const leaderboard = traders.map((user) => {
      const userTxs = transactions.filter(tx => tx.userId.toString() === user._id.toString());
      
      const totalTrades = userTxs.length;
      
      // Calculate portfolio and profit
      const portfolio = {};
      userTxs.forEach((tx) => {
        const symbol = tx.stockSymbol;
        if (!portfolio[symbol]) {
          portfolio[symbol] = { ownedQuantity: 0, totalInvestment: 0 };
        }
        if (tx.transactionType === "BUY") {
          portfolio[symbol].ownedQuantity += tx.quantity;
          portfolio[symbol].totalInvestment += tx.quantity * tx.pricePerShare;
        } else if (tx.transactionType === "SELL") {
          const avgCost = portfolio[symbol].totalInvestment / portfolio[symbol].ownedQuantity;
          portfolio[symbol].ownedQuantity -= tx.quantity;
          portfolio[symbol].totalInvestment -= tx.quantity * avgCost;
        }
      });

      let portfolioValue = 0;
      Object.entries(portfolio).forEach(([symbol, data]) => {
        if (data.ownedQuantity > 0) {
          // Fallback to last trade price if not in cache
          const cachedPrice = stockCache.get(`stock_${symbol}`)?.currentPrice;
          const lastTradePrice = userTxs.filter(tx => tx.stockSymbol === symbol).pop()?.pricePerShare || 0;
          const currentPrice = cachedPrice || lastTradePrice;
          portfolioValue += data.ownedQuantity * currentPrice;
        }
      });

      // Assuming 100000 is the initial balance
      const initialBalance = 100000;
      const currentWallet = user.walletBalance || 0;
      const totalProfit = (portfolioValue + currentWallet) - initialBalance;

      // Calculate win rate (percentage of profitable sells)
      const sells = userTxs.filter(tx => tx.transactionType === "SELL");
      let profitableSells = 0;
      sells.forEach(sell => {
        // Find average buy price before this sell (simplified)
        const symbol = sell.stockSymbol;
        const buysBefore = userTxs.filter(tx => tx.stockSymbol === symbol && tx.transactionType === "BUY" && tx.createdAt < sell.createdAt);
        const totalBought = buysBefore.reduce((acc, b) => acc + b.quantity, 0);
        const totalSpent = buysBefore.reduce((acc, b) => acc + (b.quantity * b.pricePerShare), 0);
        const avgBuyPrice = totalBought > 0 ? totalSpent / totalBought : 0;
        
        if (sell.pricePerShare > avgBuyPrice) {
          profitableSells++;
        }
      });
      const winRate = sells.length > 0 ? (profitableSells / sells.length) * 100 : 0;

      // CONSISTENCY
      const consistency = totalTrades > 10 ? Math.min(winRate, 100) : winRate * 0.5;

      // FINAL SCORE
      const score = Math.floor(
        totalProfit * 0.45 +
        winRate * 0.25 +
        portfolioValue * 0.15 +
        consistency * 0.10 +
        totalTrades * 0.05
      );

      return {
        _id: user._id,
        username: user.username,
        totalProfit,
        totalTrades,
        winRate: Number(winRate.toFixed(2)),
        portfolioValue,
        score,
      };
    });

    leaderboard.sort((a, b) => b.score - a.score);

    res.status(200).send({
      message: "Leaderboard fetched",
      payload: leaderboard,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Unable to fetch leaderboard",
    });
  }
};
