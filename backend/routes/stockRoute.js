import exp from "express";

import {
   addStock,
   getAllStocks,
   deleteStock,
   getStockDetails
} from "../controllers/stockController.js";

import { getStockHistory } from "../controllers/stockController.js";

import {verifyToken} from "../middleware/verifyToken.js";

import { toggleStockStatus } from "../controllers/stockController.js";

const stockRouter = exp.Router();


// Protected Routes
stockRouter.post(
   "/",
   verifyToken("stockmanager"),
   addStock
);

stockRouter.delete(

   "/:stockSymbol",

   verifyToken("admin","stockmanager"),

   deleteStock

);


// Public Route to get all stocks
stockRouter.get("/", getAllStocks);

//  Historical analysis
stockRouter.get(
   "/history/:symbol",
   getStockHistory
);


//Public Route to get stock details
stockRouter.get("/:stockSymbol", getStockDetails );




stockRouter.patch(
   "/toggle-status/:symbol",
   verifyToken("stockmanager"),
   toggleStockStatus
);

export default stockRouter;