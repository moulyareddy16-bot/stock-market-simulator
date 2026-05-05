import exp from "express";

import {
   addStock,
   getAllStocks,
   deleteStock
} from "../controllers/stockController.js";

import verifyToken from "../middleware/verifyToken.js";

const stockRouter = exp.Router();


// Protected Routes
stockRouter.post(
   "/",
   verifyToken("stockManager"),
   addStock
);

stockRouter.delete(
   "/:symbol",
   verifyToken("stockManager"),
   deleteStock
);


// Public Route
stockRouter.get("/", getAllStocks);


export default stockRouter;