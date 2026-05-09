import express from "express";

import {

   getStockHistory

} from "../controllers/historicalController.js";

const historicalRouter = express.Router();


// HISTORICAL ROUTE
historicalRouter.get(

   "/history/:symbol",

   getStockHistory

);

export default historicalRouter;