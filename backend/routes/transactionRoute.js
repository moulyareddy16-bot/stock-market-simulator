import exp from "express"

import {verifyToken} from "../middleware/verifyToken.js"

import {
    buyStock,
    sellStock,
    getTransactions
} from "../controllers/transactionController.js"

const transactionRouter = exp.Router()

// Buy stock 
transactionRouter.post("/buy",verifyToken("trader"), buyStock);

// Sell stock
transactionRouter.post("/sell", verifyToken("trader"), sellStock);

// Get transaction history
transactionRouter.get("/history",verifyToken("trader"), getTransactions);


export default transactionRouter;
