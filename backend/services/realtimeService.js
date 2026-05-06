import axios from "axios";
import { stockModel } from "../models/StockModel.js";


// GET LIVE STOCK UPDATES

export const getLiveStockUpdates = async () => {

   try {

      // Fetch stocks from DB (limit for safety)
      const stocks = await stockModel.find().limit(10);


      // Fetch all stock prices in parallel (FASTER 🔥)
      const stockUpdates = await Promise.all(

         stocks.map(async (stock) => {

            const response = await axios.get(
               `https://finnhub.io/api/v1/quote?symbol=${stock.stockSymbol}&token=${process.env.FINNHUB_API_KEY}`
            );

            return {
               stockSymbol: stock.stockSymbol,
               currentPrice: response.data.c
            };

         })

      );


      // Return prepared data
      return stockUpdates;

   } catch (error) {

      console.log("Service error:", error.message);

      return [];

   }

};