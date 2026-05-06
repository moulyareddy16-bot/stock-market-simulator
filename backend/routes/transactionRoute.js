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
<<<<<<< HEAD
transactionRouter.post("/sell",verifyToken("trader", sellStock));
=======
transactionRouter.post("/sell",verifyToken("trader"), sellStock);
>>>>>>> 2dc15d36f1937eac903d6dcab2e62efa0ee45614

// Get transaction history
transactionRouter.get("/",verifyToken("trader"), getTransactions);


export default transactionRouter;
