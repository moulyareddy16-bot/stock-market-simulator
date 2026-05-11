import api from "./api";


// BUY STOCK
export const buyStock = async (tradeData) => {

   const response = await api.post(
      "/transactions/buy",
      tradeData
   );

   return response.data;
};


// SELL STOCK
export const sellStock = async (tradeData) => {

   const response = await api.post(
      "/transactions/sell",
      tradeData
   );

   return response.data;
};
