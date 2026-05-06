import exp from "express";

import {
   addStock,
   getAllStocks,
   deleteStock,
   getStockDetails
} from "../controllers/stockController.js";

import { getStockHistory } from "../controllers/stockController.js";

import {verifyToken} from "../middleware/verifyToken.js";

const stockRouter = exp.Router();


// Protected Routes
stockRouter.post(
   "/",
   verifyToken("stockmanager"),
   addStock
);

stockRouter.delete(
   "/:symbol",
   verifyToken("stockmanager"),
   deleteStock
);


// Public Route to get all stocks
stockRouter.get("/", getAllStocks);

//Public Route to get stock details
stockRouter.get("/:stockSymbol", getStockDetails );


//  Historical analysis
stockRouter.get(
   "/history/:symbol",
   getStockHistory
);

export default stockRouter;