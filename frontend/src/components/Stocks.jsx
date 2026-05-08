import { useEffect, useState } from "react";

import {
  getAllStocks,
  addStock,
  deleteStock,
  toggleStockStatus,
} from "../service/stockService";

function Stocks() {

  // STOCK DATA
  const [stocks, setStocks] = useState([]);

  // SEARCH + PAGINATION
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // LOADING STATES
  const [loadingStock, setLoadingStock] = useState("");
  const [addingStock, setAddingStock] = useState(false);
  const [fetchingStocks, setFetchingStocks] = useState(false);

  // FORM DATA
  const [stockData, setStockData] = useState({
    stockSymbol: "",
  });

  // FETCH STOCKS
  const fetchStocks = async () => {

    try {

      setFetchingStocks(true);

      const data =
        await getAllStocks(
          page,
          search
        );

      setStocks(data.payload || []);

      setTotalPages(
        data.totalPages || 1
      );

    } catch (error) {

      console.log(error);

    } finally {

      setFetchingStocks(false);

    }

  };

  // FETCH ON LOAD
  useEffect(() => {

    const delayDebounce = setTimeout(() => {

      fetchStocks();

    }, 400);

    return () =>
      clearTimeout(delayDebounce);

  }, [page, search]);

  // HANDLE INPUT
  const handleChange = (e) => {

    const value =
      e.target.value.toUpperCase();

    setStockData({

      ...stockData,

      [e.target.name]: value,

    });

  };

  // =====================================
  // ADD STOCK
  // =====================================
  const handleAddStock = async (e) => {

    e.preventDefault();

    try {

      setAddingStock(true);

      const cleanedSymbol =
        stockData.stockSymbol
          .trim()
          .toUpperCase();

      const symbolRegex =
        /^[A-Z.]{1,10}$/;

      if (!cleanedSymbol) {

        return alert(
          "Stock symbol is required"
        );

      }

      if (!symbolRegex.test(cleanedSymbol)) {

        return alert(
          "Enter valid stock symbol"
        );

      }

      const response =
        await addStock({

          stockSymbol:
            cleanedSymbol

        });

      alert(
        response.message ||
        "Stock added successfully"
      );

      fetchStocks();

      setStockData({

        stockSymbol: ""

      });

    } catch (error) {

      console.log(error);

      alert(

        error.response?.data?.message ||

        "Unable to add stock"

      );

    } finally {

      setAddingStock(false);

    }

  };
  // =====================================
  // DELETE STOCK
  const handleDelete = async (stockSymbol) => {

    const confirmDelete =
      window.confirm(
        `Delete ${stockSymbol}?`
      );

    if (!confirmDelete) return;
    try {
      await deleteStock(stockId);

      fetchStocks();

    } catch (error) {

      console.log(error);

      alert(

        error.response?.data?.message ||

        "Failed to delete stock"

      );

    }

  };

  // TOGGLE STATUS
  const handleToggleStatus =
    async (stockSymbol) => {

      try {

        setLoadingStock(stockSymbol);

        const response =
          await toggleStockStatus(
            stockSymbol
          );

        alert(

          response.message ||

          `${stockSymbol} updated`

        );

        fetchStocks();

      } catch (error) {

        console.log(error);

        alert(

          error.response?.data?.message ||

          "Failed to update stock"

        );

      } finally {

        setLoadingStock("");

      }

    };

  return (

    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#081c15] via-[#0f2d24] to-[#1b4332] p-6">

      {/* WATERMARK */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

        <h1 className="select-none text-[180px] font-black tracking-widest text-white/5">

          STOCKS

        </h1>

      </div>

      {/* GLOW */}
      <div className="absolute left-[-120px] top-[-120px] h-[300px] w-[300px] rounded-full bg-green-500/10 blur-3xl"></div>

      <div className="absolute bottom-[-120px] right-[-120px] h-[300px] w-[300px] rounded-full bg-emerald-400/10 blur-3xl"></div>

      {/* CONTENT */}
      <div className="relative z-10">

        {/* TITLE */}
        <div className="mb-10 text-center">

          <h1 className="bg-gradient-to-r from-green-300 to-emerald-500 bg-clip-text text-5xl font-extrabold text-transparent">

            Stock Management

          </h1>

          <p className="mt-3 text-green-100/70">

            Add, manage and monitor live market stocks

          </p>

        </div>

        {/* ADD STOCK */}
        <div className="mx-auto mb-10 max-w-4xl rounded-3xl border border-green-500/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg">

          <form
            onSubmit={handleAddStock}
            className="flex flex-col gap-4 md:flex-row"
          >

            <input
              type="text"
              name="stockSymbol"
              placeholder="Enter Symbol (AAPL, TSLA, NVDA)"
              value={stockData.stockSymbol}
              onChange={handleChange}
              autoComplete="off"
              required
              className="flex-1 rounded-xl border border-green-400/20 bg-black/20 px-4 py-3 text-white placeholder:text-gray-400 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-500"
            />

            <button
              type="submit"
              disabled={addingStock}
              className={`rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition duration-300

              ${
                addingStock
                  ? "cursor-not-allowed bg-gray-500"
                  : "bg-gradient-to-r from-green-500 to-emerald-700 hover:scale-105 hover:from-green-400 hover:to-emerald-600"
              }
              `}
            >

              {
                addingStock
                  ? "Adding..."
                  : "Add Stock"
              }

            </button>

          </form>

          <p className="mt-3 text-sm text-green-100/50">

            Only valid Finnhub market symbols are accepted.

          </p>

        </div>

        {/* SEARCH */}
        <div className="mx-auto mb-8 max-w-4xl">

          <input
            type="text"
            placeholder="Search stocks..."
            value={search}
            onChange={(e) => {

              setSearch(e.target.value);

              setPage(1);

            }}
            className="w-full rounded-2xl border border-green-500/20 bg-white/10 px-5 py-4 text-white placeholder:text-gray-400 outline-none backdrop-blur-lg focus:border-green-400"
          />

        </div>

        {/* LOADING */}
        {
          fetchingStocks && (

            <div className="mb-6 text-center text-green-200">

              Loading stocks...

            </div>

          )
        }

        {/* EMPTY */}
        {
          !fetchingStocks &&
          stocks.length === 0 && (

            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-gray-300">

              No stocks found

            </div>

          )
        }

        {/* GRID */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {stocks.map((stock) => (

            <div
              key={stock._id}
              className="group relative overflow-hidden rounded-3xl border border-green-500/20 bg-white/10 p-6 shadow-2xl backdrop-blur-lg transition duration-300 hover:-translate-y-2 hover:border-green-400 hover:shadow-green-500/20"
            >

              {/* STATUS */}
              <div className="absolute right-4 top-4 z-20">

                <button

                  disabled={
                    loadingStock ===
                    stock.stockSymbol
                  }

                  onClick={() =>
                    handleToggleStatus(
                      stock.stockSymbol
                    )
                  }

                  className={`rounded-full px-3 py-1 text-xs font-bold text-white

                  ${
                    stock.isActive
                      ? "bg-green-500"
                      : "bg-red-500"
                  }
                  `}
                >

                  {
                    loadingStock ===
                      stock.stockSymbol

                      ? "Updating..."

                      : stock.isActive

                        ? "🟢 ACTIVE"

                        : "🔴 INACTIVE"
                  }

                </button>

              </div>

              {/* HEADER */}
              <div className="flex items-center gap-4">

                {/* LOGO */}
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-2">

                  {
                    stock.logo ? (

                      <img
                        src={stock.logo}
                        alt={stock.companyName}
                        className="h-full w-full object-contain"
                        onError={(e) => {

                          e.target.style.display = "none";

                        }}
                      />

                    ) : (

                      <span className="text-lg font-bold text-black">

                        {stock.stockSymbol[0]}

                      </span>

                    )
                  }

                </div>

                {/* INFO */}
                <div>

                  <h2 className="text-3xl font-extrabold tracking-wide text-white">

                    {stock.stockSymbol}

                  </h2>

                  <p className="text-green-100/70">

                    {stock.companyName}

                  </p>

                </div>

              </div>

              {/* TAGS */}
              <div className="mt-4 flex flex-wrap gap-2">

                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">

                  📈 Live Market

                </span>

                {
                  stock.exchange && (

                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">

                      {stock.exchange}

                    </span>

                  )
                }

              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex gap-3">

                <button
                  className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-700 px-4 py-2 font-medium text-white transition duration-300 hover:scale-105"
                >

                  View

                </button>

                <button
                  onClick={() =>
                    handleDelete(
                      stock.stockSymbol
                    )
                  }
                  className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-700 px-4 py-2 font-medium text-white transition duration-300 hover:scale-105"
                >

                  Delete

                </button>

              </div>

            </div>

          ))}

        </div>

        {/* PAGINATION */}
        <div className="mt-10 flex items-center justify-center gap-4">

          <button

            disabled={page === 1}

            onClick={() =>
              setPage(page - 1)
            }

            className="rounded-xl bg-green-600 px-4 py-2 text-white disabled:opacity-40"
          >

            Previous

          </button>

          <span className="text-white">

            Page {page} of {totalPages}

          </span>

          <button

            disabled={page === totalPages}

            onClick={() =>
              setPage(page + 1)
            }

            className="rounded-xl bg-green-600 px-4 py-2 text-white disabled:opacity-40"
          >

            Next

          </button>

        </div>

      </div>

    </div>

  );

}

export default Stocks;