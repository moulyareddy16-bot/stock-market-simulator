import {userModel} from "../models/userModel.js";

export const getLeaderboard = async (req, res) => {

  try {

    const traders = await userModel.find({
      role: "trader",
    }).select("-password");

    const leaderboard = traders.map((user) => {

      const totalProfit = user.totalProfit || 0;
      const totalTrades = user.totalTrades || 0;
      const winRate = user.winRate || 0;
      const portfolioValue = user.portfolioValue || 0;

      // CONSISTENCY
      const consistency =
        totalTrades > 10
          ? Math.min(winRate, 100)
          : winRate * 0.5;

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
        winRate,
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
