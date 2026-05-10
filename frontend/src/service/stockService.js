import api from "./api";

// GET ALL STOCKS
export const getAllStocks = async (page = 1, search = "", limit = 8) => {
  const response = await api.get(`/stocks?page=${page}&search=${search}&limit=${limit}`);
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


// GET SINGLE STOCK

export const getSingleStock =
async (stockSymbol) => {

   const response =
      await api.get(

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

// GET STOCK DETAILS LIVE
export const getStockDetails =
  async (stockSymbol) => {

    const response =
      await api.get(
        `/stocks/details/${stockSymbol}`
      );

    return response.data;

};