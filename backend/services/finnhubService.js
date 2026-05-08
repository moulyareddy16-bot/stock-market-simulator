import axios from "axios";

export const validateStockSymbol =
async (symbol) => {

   try {

      const response = await axios.get(

         `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`

      );

      return response.data;

   } catch (error) {

      // FINNHUB RATE LIMIT
      if (error.response?.status === 429) {

         console.log(
            "Finnhub API rate limit exceeded"
         );

         return {
            rateLimited: true
         };

      }

      console.log(
         "Finnhub validation error:",
         error.message
      );

      return null;

   }

};