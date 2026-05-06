import axios from "axios";

// FETCH HISTORICAL STOCK DATA

export const getHistoricalStockData =
async (symbol, days = 30) => {

   // current unix timestamp
   const to =
   Math.floor(Date.now() / 1000);

   // subtract days
   const from =
   to - (days * 24 * 60 * 60);


   // Finnhub candle API
   const response = await axios.get(

      `https://finnhub.io/api/v1/stock/candle`,

      {
         params: {

            symbol,

            resolution: "D",

            from,

            to,

            token:
            process.env.FINNHUB_API_KEY

         }
      }

   );


   return response.data;

};