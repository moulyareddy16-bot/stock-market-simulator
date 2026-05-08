import { stockModel }
from "../models/StockModel.js";


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
// ==========================================
export const getLiveStockUpdates =
async () => {

   try {

      const stocks =
         await stockModel.find();


      const stockUpdates =

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

            );


            return {

               stockSymbol:
               stock.stockSymbol,

               currentPrice:

               livePrices[
                  stock.stockSymbol
               ]

            };

         });


      return stockUpdates;

   } catch(error) {

      console.log(

         "Realtime Service Error:",

         error.message

      );

      return [];

   }

};