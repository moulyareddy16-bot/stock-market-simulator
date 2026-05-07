import { useEffect, useState } from "react";

import {
  getAllStocks,
  addStock,
  deleteStock,
  toggleStockStatus,
} from "../service/stockService";

function Stocks() {

  // STORE ALL STOCKS
  const [stocks, setStocks] = useState([]);

  // LOADING STOCK SYMBOL
  const [loadingStock, setLoadingStock] = useState("");

  // FORM DATA
  const [stockData, setStockData] = useState({
    stockSymbol: "",
    companyName: "",
  });

  // FETCH ALL STOCKS
  const fetchStocks = async () => {

    try {

      const data = await getAllStocks();

      setStocks(data.payload);

    } catch (error) {

      console.log(error);

    }

  };

  // LOAD STOCKS ON PAGE LOAD
  useEffect(() => {

    fetchStocks();

  }, []);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {

    setStockData({
      ...stockData,
      [e.target.name]: e.target.value,
    });

  };

  // ADD STOCK
  const handleAddStock = async (e) => {

    e.preventDefault();

    try {

      const response = await addStock(stockData);

      console.log(response);

      // REFRESH STOCKS
      fetchStocks();

      // CLEAR FORM
      setStockData({
        stockSymbol: "",
        companyName: "",
      });

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );

    }

  };

  // DELETE STOCK
  const handleDelete = async (stockSymbol) => {

    const confirmDelete = window.confirm(
      `Delete ${stockSymbol} ?`
    );

    if (!confirmDelete) return;

    try {

      await deleteStock(stockSymbol);

      fetchStocks();

    } catch (error) {

      console.log(error);

    }

  };

  // TOGGLE STOCK STATUS
  // TOGGLE STOCK STATUS
const handleToggleStatus = async (stockSymbol) => {

  try {

    // SET CURRENT LOADING STOCK
    setLoadingStock(stockSymbol);

    // API CALL
    const response =
      await toggleStockStatus(stockSymbol);

    // SUCCESS MESSAGE
    alert(
      response.message ||
      `${stockSymbol} status updated successfully`
    );

    // REFRESH STOCKS
    fetchStocks();

  } catch (error) {

    console.log(error);

    alert(
      error.response?.data?.message ||
      "Failed to update stock status"
    );

  } finally {

    // REMOVE LOADING
    setLoadingStock("");

  }

};

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">

//       {/* PAGE TITLE */}
//       <div className="mb-8 text-center">

//         <h1 className="text-4xl font-bold text-gray-800">
//           Stock Management
//         </h1>

//         <p className="mt-2 text-gray-500">
//           Add, view and manage market stocks
//         </p>

//       </div>

//       {/* ADD STOCK FORM */}
//       <div className="mx-auto mb-10 max-w-3xl rounded-2xl bg-white p-6 shadow-lg">

//         <form
//           onSubmit={handleAddStock}
//           className="flex flex-col gap-4 md:flex-row"
//         >

//           {/* STOCK SYMBOL */}
//           <input
//             type="text"
//             name="stockSymbol"
//             placeholder="Stock Symbol"
//             value={stockData.stockSymbol}
//             onChange={handleChange}
//             required
//             className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 text-black"
//           />

//           {/* COMPANY NAME */}
//           <input
//             type="text"
//             name="companyName"
//             placeholder="Company Name"
//             value={stockData.companyName}
//             onChange={handleChange}
//             required
//             className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 text-black"
//           />

//           {/* ADD BUTTON */}
//           <button
//             type="submit"
//             className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
//           >
//             Add Stock
//           </button>

//         </form>

//       </div>

//       {/* STOCK GRID */}
//       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

//         {stocks.map((stock) => (

//           <div
//             key={stock._id}
//             className="relative rounded-2xl bg-white p-6 shadow-md transition hover:shadow-xl"
//           >

//             {/* STATUS BUTTON */}
//             <div className="absolute right-4 top-4">

//               <button

//                 disabled={
//                   loadingStock === stock.stockSymbol
//                 }

//                 onClick={() =>
//                   handleToggleStatus(
//                     stock.stockSymbol
//                   )
//                 }

//                 className={`rounded-full px-3 py-1 text-xs font-bold text-white transition

//                 ${
//                   stock.isActive
//                     ? "bg-green-500 hover:bg-green-700"
//                     : "bg-red-500 hover:bg-red-700"
//                 }

//                 ${
//                   loadingStock === stock.stockSymbol
//                     ? "cursor-not-allowed opacity-70"
//                     : ""
//                 }
//                 `}
//               >

//                 {
//                   loadingStock === stock.stockSymbol
//                     ? "Updating..."
//                     : stock.isActive
//                       ? "🟢 ACTIVE"
//                       : "🔴 INACTIVE"
//                 }

//               </button>

//             </div>

//             {/* STOCK SYMBOL */}
//             <h2 className="text-2xl font-bold text-gray-800">
//               {stock.stockSymbol}
//             </h2>

//             {/* COMPANY NAME */}
//             <p className="mt-2 text-gray-500">
//               {stock.companyName}
//             </p>

//             {/* ACTION BUTTONS */}
//             <div className="mt-6 flex gap-3">

//               <button
//                 className="flex-1 rounded-xl bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700"
//               >
//                 View
//               </button>

//               <button
//                 onClick={() =>
//                   handleDelete(stock.stockSymbol)
//                 }
//                 className="flex-1 rounded-xl bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
//               >
//                 Delete
//               </button>

//             </div>

//           </div>

//         ))}

//       </div>

//     </div>
//   );
// }

return (
  <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#081c15] via-[#0f2d24] to-[#1b4332] p-6">

    {/* BACKGROUND WATERMARK */}
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

      <h1 className="select-none text-[180px] font-black tracking-widest text-white/5">
        STOCKS
      </h1>

    </div>

    {/* GLOW EFFECTS */}
    <div className="absolute left-[-120px] top-[-120px] h-[300px] w-[300px] rounded-full bg-green-500/10 blur-3xl"></div>

    <div className="absolute bottom-[-120px] right-[-120px] h-[300px] w-[300px] rounded-full bg-emerald-400/10 blur-3xl"></div>

    {/* MAIN CONTENT */}
    <div className="relative z-10">

      {/* PAGE TITLE */}
      <div className="mb-10 text-center">

        <h1 className="bg-gradient-to-r from-green-300 to-emerald-500 bg-clip-text text-5xl font-extrabold text-transparent">
          Stock Management
        </h1>

        <p className="mt-3 text-green-100/70">
          Add, manage and monitor live market stocks
        </p>

      </div>

      {/* ADD STOCK FORM */}
      <div className="mx-auto mb-10 max-w-4xl rounded-3xl border border-green-500/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg">

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
            className="flex-1 rounded-xl border border-green-400/20 bg-black/20 px-4 py-3 text-white placeholder:text-gray-400 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-500"
          />

          {/* COMPANY NAME */}
          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            value={stockData.companyName}
            onChange={handleChange}
            required
            className="flex-1 rounded-xl border border-green-400/20 bg-black/20 px-4 py-3 text-white placeholder:text-gray-400 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-500"
          />

          {/* ADD BUTTON */}
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-700 px-6 py-3 font-semibold text-white shadow-lg transition duration-300 hover:scale-105 hover:from-green-400 hover:to-emerald-600"
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
            className="group relative overflow-hidden rounded-3xl border border-green-500/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg transition duration-300 hover:-translate-y-2 hover:border-green-400 hover:shadow-green-500/20"
          >

            {/* CARD OVERLAY */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent opacity-0 transition duration-300 group-hover:opacity-100"></div>

            {/* STATUS BUTTON */}
            <div className="absolute right-4 top-4 z-20">

              <button

                disabled={
                  loadingStock === stock.stockSymbol
                }

                onClick={() =>
                  handleToggleStatus(
                    stock.stockSymbol
                  )
                }

                className={`rounded-full px-3 py-1 text-xs font-bold text-white transition duration-300

                ${
                  stock.isActive
                    ? "bg-green-500 hover:bg-green-700"
                    : "bg-red-500 hover:bg-red-700"
                }

                ${
                  loadingStock === stock.stockSymbol
                    ? "cursor-not-allowed opacity-70"
                    : ""
                }
                `}
              >

                {
                  loadingStock === stock.stockSymbol
                    ? "Updating..."
                    : stock.isActive
                      ? "🟢 ACTIVE"
                      : "🔴 INACTIVE"
                }

              </button>

            </div>

            {/* STOCK SYMBOL */}
            <h2 className="relative z-10 text-3xl font-extrabold tracking-wide text-white">

              {stock.stockSymbol}

            </h2>

            {/* COMPANY NAME */}
            <p className="relative z-10 mt-2 text-green-100/70">

              {stock.companyName}

            </p>

            {/* MARKET TAG */}
            <div className="relative z-10 mt-4 inline-block rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">

              📈 Live Market

            </div>

            {/* STOCK DECORATION */}
            <div className="absolute bottom-[-15px] right-[-10px] text-7xl font-black text-white/5">

              $

            </div>

            {/* ACTION BUTTONS */}
            <div className="relative z-10 mt-6 flex gap-3">

              {/* VIEW BUTTON */}
              <button
                className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-700 px-4 py-2 font-medium text-white transition duration-300 hover:scale-105"
              >
                View
              </button>

              {/* DELETE BUTTON */}
              <button
                onClick={() =>
                  handleDelete(stock.stockSymbol)
                }
                className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-700 px-4 py-2 font-medium text-white transition duration-300 hover:scale-105"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  </div>
);
}
export default Stocks;