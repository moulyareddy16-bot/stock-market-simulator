import exp from "express";

import {

   addStock,
   getAllStocks,
   deleteStock,
   getSingleStock,
   getStockHistory

} from "../controllers/stockController.js";

import {
   verifyToken
} from "../middleware/verifyToken.js";


import { toggleStockStatus } from "../controllers/stockController.js";

const stockRouter = exp.Router();


// ==========================================
// ADD STOCK
// ==========================================
stockRouter.post(

   "/",

   verifyToken("stockmanager"),

   addStock

);


// ==========================================
// DELETE STOCK
// ==========================================
stockRouter.delete(

   "/:stockSymbol",

   verifyToken(
      "admin",
      "stockmanager"
   ),

   deleteStock

);


// ==========================================
// GET ALL STOCKS
// ==========================================
// Public Route to get all stocks
stockRouter.get("/", getAllStocks);

//  Historical analysis
stockRouter.get(

   "/",

   getAllStocks

);


// ==========================================
// GET SINGLE STOCK
// ==========================================
stockRouter.get(

   "/:stockSymbol",

   getSingleStock

);


// ==========================================
// GET STOCK HISTORY
// ==========================================
stockRouter.get(

   "/history/:symbol",

   getStockHistory

);


stockRouter.patch(
   "/toggle-status/:symbol",
   verifyToken("stockmanager"),
   toggleStockStatus
);

export default stockRouter;