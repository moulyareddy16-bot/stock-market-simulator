import axios from "axios";

import { stockModel }
from "../models/StockModel.js";

import { stockCache }
from "./cacheService.js";


// GET LIVE STOCK UPDATES

export const getLiveStockUpdates =
async () => {

   try {

      // FETCH STOCKS
      const stocks =
      await stockModel.find({

         isActive: true

      }).limit(10);


      // FETCH DATA
      const stockUpdates =
      await Promise.all(

         stocks.map(async (stock) => {

            // CACHE KEY
            const cacheKey =
            `stock_${stock.stockSymbol}`;

            // CHECK CACHE
            const cachedData =
            stockCache.get(cacheKey);

            // RETURN CACHE
            if (cachedData) {

               console.log(

                  `Cache hit: ${stock.stockSymbol}`

               );

               return cachedData;

            }

            // API REQUEST
            const response =
            await axios.get(

               `https://finnhub.io/api/v1/quote?symbol=${stock.stockSymbol}&token=${process.env.FINNHUB_API_KEY}`

            );

            const stockData = {

               stockSymbol:
               stock.stockSymbol,

               currentPrice:
               response.data.c,

               high:
               response.data.h,

               low:
               response.data.l,

               open:
               response.data.o,

               previousClose:
               response.data.pc

            };

            // SAVE CACHE
            stockCache.set(

               cacheKey,

               stockData

            );

            console.log(

               `Fresh API: ${stock.stockSymbol}`

            );

            return stockData;

         })

      );

      return stockUpdates;

   } catch (error) {

      // RATE LIMIT
      if (
         error.response?.status === 429
      ) {

         console.log(

            "Finnhub rate limit exceeded"

         );

         return [];

      }

      console.log(

         "Realtime service error:",
         error.message

      );

      return [];

   }

};