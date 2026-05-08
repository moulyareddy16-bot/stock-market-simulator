import api from "./api";

// GET ALL STOCKS
export const getAllStocks =
  async (page = 1, search = "") => {

    const response =
      await api.get(

        `/stocks?page=${page}&search=${search}`

      );

    return response.data;

};

// ADD STOCK
export const addStock =
  async (stockData) => {

    const response =
      await api.post(

        "/stocks",

        stockData

      );

    return response.data;

};

// DELETE STOCK
export const deleteStock =
  async (stockSymbol) => {

    const response =
      await api.delete(

        `/stocks/${stockSymbol}`

      );

    return response.data;

};

// TOGGLE STOCK STATUS
export const toggleStockStatus =
  async (stockSymbol) => {

    const response =
      await api.patch(

        `/stocks/toggle-status/${stockSymbol}`

      );

    return response.data;

};