import exp from "express"

import {verifyToken} from "../middleware/verifyToken.js"

import {
    buyStock,
    sellStock,
    getTransactions
} from "../controllers/transactionController.js"

const transactionRouter = exp.Router()

// Buy stock 
transactionRouter.post("/buy",verifyToken("user"), buyStock);

// Sell stock
transactionRouter.post("/sell",verifyToken("user", sellStock));

// Get transaction history
transactionRouter.get("/",verifyToken("user"), getTransactions);


export default transactionRouter;
