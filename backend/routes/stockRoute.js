import exp from "express"

import {
    addStock,
    getAllStocks,
    deleteStock
} from "../controllers/stockController.js"

const stockRouter = exp.Router()

stockRouter.post("/",addStock)

stockRouter.get("/",getAllStocks)

stockRouter.get("/:symbol", deleteStock)

export default stockRouter