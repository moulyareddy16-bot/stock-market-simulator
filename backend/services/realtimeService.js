<<<<<<< HEAD
import { stockModel }
from "../models/StockModel.js";
=======
import axios from "axios";

import { stockModel }
from "../models/StockModel.js";

import { stockCache }
from "./cacheService.js";
>>>>>>> d7f48ec47f1a2d3667d7bc8b66a666856a5a76db


// ==========================================
// STORE LIVE PRICES
// ==========================================
const livePrices = {};


// ==========================================
// GENERATE SMALL FLUCTUATION
// ==========================================
const fluctuatePrice =
(price) => {

   // 2% fluctuation
   const percentageChange =

      (Math.random() - 0.5) * 0.04;


   const newPrice =

      price +

      (price * percentageChange);


   return Number(
      newPrice.toFixed(2)
   );

};


// ==========================================
// GET RANDOM INITIAL PRICE
// ==========================================
const generateInitialPrice =
() => {

   return Number(

      (
         200 +

         Math.random() * 800
      ).toFixed(2)

   );

};


// ==========================================
// GET LIVE STOCK UPDATES
<<<<<<< HEAD
// ==========================================
=======

>>>>>>> d7f48ec47f1a2d3667d7bc8b66a666856a5a76db
export const getLiveStockUpdates =
async () => {

   try {

<<<<<<< HEAD
      const stocks =
         await stockModel.find();


      const stockUpdates =
=======
      // FETCH STOCKS
      const stocks =
      await stockModel.find({

         isActive: true

      }).limit(10);


      // FETCH DATA
      const stockUpdates =
      await Promise.all(
>>>>>>> d7f48ec47f1a2d3667d7bc8b66a666856a5a76db

         stocks.map((stock) => {

            // initialize dynamically
            if (

               !livePrices[
                  stock.stockSymbol
               ]

            ) {

               livePrices[
                  stock.stockSymbol
               ] =

               generateInitialPrice();

            }


            // fluctuate existing price
            livePrices[
               stock.stockSymbol
            ] =

            fluctuatePrice(

               livePrices[
                  stock.stockSymbol
               ]

<<<<<<< HEAD
            );


            return {
=======
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
>>>>>>> d7f48ec47f1a2d3667d7bc8b66a666856a5a76db

               stockSymbol:
               stock.stockSymbol,

               currentPrice:
<<<<<<< HEAD

               livePrices[
                  stock.stockSymbol
               ]

            };

         });


=======
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

>>>>>>> d7f48ec47f1a2d3667d7bc8b66a666856a5a76db
      return stockUpdates;

   } catch(error) {

<<<<<<< HEAD
      console.log(

         "Realtime Service Error:",

=======
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
>>>>>>> d7f48ec47f1a2d3667d7bc8b66a666856a5a76db
         error.message

      );

      return [];

   }

};