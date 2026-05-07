import api from "./api";


// =========================================
// GET ALL STOCKS
// =========================================
export const getAllStocks = async () => {

   const response =
      await api.get("/stocks");

   return response.data;

};


// =========================================
// ADD STOCK
// =========================================
export const addStock = async (stockData) => {

   const response =
      await api.post(
         "/stocks",
         stockData
      );

   return response.data;

};


// =========================================
// DELETE STOCK
// =========================================
export const deleteStock = async (stockId) => {

   const response =
      await api.delete(
         `/stocks/${stockId}`
      );

   return response.data;

};