import { useEffect, useState } from "react";

import {
  getAllStocks,
  addStock,
  deleteStock,
} from "../service/stockService";

function Stocks() {
  // store all stocks
  const [stocks, setStocks] = useState([]);

  // form data
  const [stockData, setStockData] = useState({
    stockSymbol: "",
    companyName: "",
  });

  // =====================================
  // FETCH STOCKS
  // =====================================
  const fetchStocks = async () => {
    try {
      const data = await getAllStocks();

      setStocks(data.payload);
    } catch (error) {
      console.log(error);
    }
  };

  // load stocks on mount
  useEffect(() => {
    fetchStocks();
  }, []);

  // =====================================
  // HANDLE INPUT CHANGE
  // =====================================
  const handleChange = (e) => {
    setStockData({
      ...stockData,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================
  // ADD STOCK
  // =====================================
  const handleAddStock = async (e) => {

   e.preventDefault();

   console.log("Submitting:", stockData);

   try {

      const response =
         await addStock(stockData);

      console.log(response);

      // refresh stocks
      fetchStocks();

      // clear form
      setStockData({
         stockSymbol: "",
         companyName: "",
      });

   } catch (error) {

      console.log(error);

   }

  };
  // =====================================
  // DELETE STOCK
  // =====================================
  const handleDelete = async (stockId) => {
    try {
      await deleteStock(stockId);

      fetchStocks();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* PAGE TITLE */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          Stock Management
        </h1>

        <p className="mt-2 text-gray-500">
          Add, view and manage market stocks
        </p>
      </div>

      {/* ADD STOCK FORM */}
      <div className="mx-auto mb-10 max-w-3xl rounded-2xl bg-white p-6 shadow-lg">
        <form
          onSubmit={handleAddStock}
          className="flex flex-col gap-4 md:flex-row"
        >
          {/* STOCK SYMBOL */}
          <input
            type="text"
            name="stockSymbol"
            placeholder="Stock Symbol"
            value={stockData.stockSymbol}
            onChange={handleChange}
            required
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 text-black"
          />

          {/* COMPANY NAME */}
          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={stockData.companyName}
            onChange={handleChange}
            required
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 text-black"
          />

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Add Stock
          </button>
        </form>
      </div>

      {/* STOCKS GRID */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stocks.map((stock) => (
          <div
            key={stock._id}
            className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-xl"
          >
            {/* STOCK SYMBOL */}
            <h2 className="text-2xl font-bold text-gray-800">
              {stock.stockSymbol}
            </h2>

            {/* COMPANY NAME */}
            <p className="mt-2 text-gray-500">
              {stock.companyName}
            </p>

            {/* ACTION BUTTONS */}
            <div className="mt-6 flex gap-3">
              <button className="flex-1 rounded-xl bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700">
                View
              </button>

              <button
                onClick={() => handleDelete(stock._id)}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stocks;