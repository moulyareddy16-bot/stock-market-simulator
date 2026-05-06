import express from 'express';

import { verifyToken } from '../middleware/verifyToken.js';
import { getPortfolio } from '../controllers/portfolioController.js';

const portfolioRouter = express.Router();

// Get user's portfolio
portfolioRouter.get("/", verifyToken("trader"), getPortfolio);

export default portfolioRouter;