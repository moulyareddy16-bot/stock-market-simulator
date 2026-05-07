import { stockModel } from "../models/StockModel.js";
import axios from "axios";
import { getHistoricalStockData } from "../services/stockService.js";
import { config } from "dotenv";
config();


//add stocks
export const addStock = async(req, res)=>{
     try {

      // get stock data
      const newStock = req.body;


      newStock.stockSymbol = newStock.stockSymbol.toUpperCase();

      // check existing stock
      const existingStock =
         await stockModel.findOne({

            stockSymbol:
            newStock.stockSymbol

         });


      // if stock already exists
      if (existingStock) {

         return res.status(400).json({

            message:
            "Stock already exists"

         });

      }


      // create stock
      const stock =
         await stockModel.create(newStock);


      // send response
      res.status(201).json({

         message:
         "Stock added successfully",

         payload: stock

      });

   } catch(error) {

      next(error);

   }

};

//get all stocks
export const getAllStocks = async(req,res)=>{
    try{

        const stocks = await stockModel.find()
        res.status(200).json({message:stocks, payload:stocks})

    }catch(error){

        res.status(500).json({message: error.message})

    }
}

//delete stocks
export const deleteStock = async (req, res, next) => {

   try {

      const { stockSymbol } =
         req.params;


      const deletedStock =
         await stockModel.findOneAndDelete({

            stockSymbol

         });


      if (!deletedStock) {

         return res.status(404).json({

            message:
            "Stock not found"

         });

      }


      res.status(200).json({

         message:
         "Stock deleted successfully"

      });

   } catch(error) {

      next(error);

   }

};

//get stock details live API
export const getStockDetails = async (req,res,next)=>{
    try{

        const symbol = req.params.stockSymbol;

        const response = await axios.get(

            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`

        );

        res.status(200).json({
            payload: response.data
        });

    } catch(error) {

      next(error);

   }

};


// GET HISTORICAL STOCK DATA

export const getStockHistory =
async (req, res, next) => {

   try {

      // 1. Get stock symbol
      const { symbol } = req.params;

      // Optional query param
      const days =
      Number(req.query.days) || 30;


      // 2. Check stock exists
      const stock =
      await stockModel.findOne({

         stockSymbol: symbol

      });

      if (!stock) {

         return res.status(404).json({

            message:
            "Stock not found"

         });

      }


      // 3. Fetch historical data
      const data =
      await getHistoricalStockData(
         symbol,
         days
      );


      // Finnhub failed
      if (data.s !== "ok") {

         return res.status(400).json({

            message:
            "Unable to fetch historical data"

         });

      }


      // 4. Format response
      const formattedData =
      data.t.map((timestamp, index) => {

         return {

            date:
            new Date(timestamp * 1000)
            .toISOString()
            .split("T")[0],

            open: data.o[index],

            high: data.h[index],

            low: data.l[index],

            close: data.c[index],

            volume: data.v[index]

         };

      });


      // 5. Send response
      res.status(200).json({

         message:
         "Historical stock data",

         stockSymbol:
         symbol,

         totalDays:
         days,

         payload:
         formattedData

      });

   } catch(error) {

      next(error);

   }

};

