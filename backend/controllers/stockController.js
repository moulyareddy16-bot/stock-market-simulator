import { stockModel } from "../models/StockModel.js";
import axios from "axios";
import { getHistoricalStockData } from "../services/stockService.js";
import { config } from "dotenv";
config();


//add stocks
export const addStock = async(req, res)=>{
    try{

        const stock = await stockModel.create(req.body)
        res.status(201).json({message:"Stock created", payload:stock})

    }catch(error){

        res.status(500).json({message: error.message})
    }
}

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
export const deleteStock = async(req,res)=>{
    try{

        await stockModel.findOneAndDelete({
            symbol:req.params.symbol
        })
        res.status(200).json({message: "Stock Deleted"})

    }catch(error){
        
        res.status(500).json({message: error.message})

    }
}

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

