import express from "express";

import {
  getLeaderboard,
} from "../controllers/leaderboardController.js";

const leaderboardApp = express.Router();

leaderboardApp.get(
  "/leaderboard",
  getLeaderboard
);

export default leaderboardApp;