import exp from "express";

import {
   addStock,
   getAllStocks,
   deleteStock,
   getStockDetails
} from "../controllers/stockController.js";

<<<<<<< HEAD
import verifyToken from "../middleware/verifyToken.js";
=======
import {verifyToken} from "../middleware/verifyToken.js";
>>>>>>> 55ef4d5c5efc3e123d7cdb1b68c88687c940363a

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


export default stockRouter;