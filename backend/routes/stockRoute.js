import exp from "express";

import {
   addStock,
   getAllStocks,
   deleteStock,
   getStockDetails,
   getSingleStock
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

<<<<<<< HEAD
// Get single stock details
stockRouter.get("/:stockSymbol", getStockDetails);
=======
// Get single stock (MUST BE LAST GET ROUTE TO PREVENT CLASHES)
stockRouter.get("/:stockSymbol", getSingleStock);
>>>>>>> 56ff13212639e746a17c0aeb3b9e942cd71f55b5


stockRouter.patch(
   "/toggle-status/:symbol",
   verifyToken("stockmanager"),
   toggleStockStatus
);

export default stockRouter;