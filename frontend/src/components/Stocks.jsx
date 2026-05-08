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


  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
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

  // ADD STOCK
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

  // DELETE STOCK
  const handleDelete = async (stockSymbol) => {

    const confirmDelete =
      window.confirm(
        `Delete ${stockSymbol}?`
      );

    if (!confirmDelete) return;
    try {

      await deleteStock(stockSymbol);

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

  const formatMarketCap = (num) => {

    if (!num) return "N/A";

    if (num >= 1_000_000_000_000) {
      return (
        num / 1_000_000_000_000
      ).toFixed(2) + "T";
    }

    if (num >= 1_000_000_000) {
      return (
        num / 1_000_000_000
      ).toFixed(2) + "B";
    }

    return num;

  };

  const filteredStocks = stocks.filter((stock) => {

    if (statusFilter === "active") {
      return stock.isActive;
    }

    if (statusFilter === "inactive") {
      return !stock.isActive;
    }

    return true;

  });

  return (

    <div className="min-h-screen bg-[#0b1120] text-white">


      {/* FLOATING FILTER */}
      <div className="fixed bottom-6 right-6 z-50">

        {/* BUTTON */}
        <button
          onClick={() =>
            setShowFilters(!showFilters)
          }
          className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#111827]/90 text-2xl text-white shadow-2xl backdrop-blur-xl transition hover:scale-105 hover:border-green-500"
        >

          ⚙️

        </button>

        {/* PANEL */}
        {
          showFilters && (

            <div className="absolute bottom-20 right-0 w-64 rounded-3xl border border-white/10 bg-[#111827]/95 p-5 shadow-2xl backdrop-blur-xl">

              <h2 className="mb-4 text-lg font-bold text-white">

                Filters

              </h2>

              <div className="space-y-3">

                <button
                  onClick={() =>
                    setStatusFilter("all")
                  }
                  className={`w-full rounded-xl px-4 py-3 text-left transition

            ${statusFilter === "all"
                      ? "bg-green-600 text-white"
                      : "bg-[#1e293b] text-gray-300"
                    }
            `}
                >

                  All Stocks

                </button>

                <button
                  onClick={() =>
                    setStatusFilter("active")
                  }
                  className={`w-full rounded-xl px-4 py-3 text-left transition

            ${statusFilter === "active"
                      ? "bg-green-600 text-white"
                      : "bg-[#1e293b] text-gray-300"
                    }
            `}
                >

                  Active Stocks

                </button>

                <button
                  onClick={() =>
                    setStatusFilter("inactive")
                  }
                  className={`w-full rounded-xl px-4 py-3 text-left transition

            ${statusFilter === "inactive"
                      ? "bg-red-600 text-white"
                      : "bg-[#1e293b] text-gray-300"
                    }
            `}
                >

                  Inactive Stocks

                </button>

              </div>

            </div>

          )
        }

      </div>
      {/* TOP NAVBAR */}
      <div className="z-50 border-b border-white/10 bg-[#0f172a]/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* LEFT */}
          <div>

            <h1 className="text-2xl font-bold tracking-wide text-white">

              Stock Manager

            </h1>

            <p className="text-sm text-gray-400">

              Manage market inventory

            </p>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search stocks..."
              value={search}
              onChange={(e) => {

                setSearch(e.target.value);

                setPage(1);

              }}
              className="w-[260px] rounded-xl border border-white/10 bg-[#111827] px-4 py-2 text-sm text-white outline-none transition focus:border-green-500"
            />

            {/* ADD STOCK */}
            <form
              onSubmit={handleAddStock}
              className="flex items-center gap-2"
            >

              <input
                type="text"
                name="stockSymbol"
                placeholder="AAPL"
                value={stockData.stockSymbol}
                onChange={handleChange}
                autoComplete="off"
                className="w-[120px] rounded-xl border border-white/10 bg-[#111827] px-4 py-2 text-sm uppercase text-white outline-none transition focus:border-green-500"
              />

              <button
                type="submit"
                disabled={addingStock}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
              >

                {
                  addingStock
                    ? "Adding..."
                    : "+ Add"
                }

              </button>

            </form>

          </div>

        </div>

      </div>

      {/* DASHBOARD */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* STATS
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">

            <p className="text-sm text-gray-400">

              Total Stocks

            </p>

            <h2 className="mt-2 text-3xl font-bold">

              {stocks.length}

            </h2>

          </div> */}



        <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">

          <p className="text-sm text-gray-400">

            Active

          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-400">

            {
              stocks.filter(
                stock => stock.isActive
              ).length
            }

          </h2>

        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">

          <p className="text-sm text-gray-400">

            Inactive

          </p>

          <h2 className="mt-2 text-3xl font-bold text-red-400">

            {
              stocks.filter(
                stock => !stock.isActive
              ).length
            }

          </h2>

        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">

          <p className="text-sm text-gray-400">

            Exchanges

          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-400">

            {
              [...new Set(
                stocks.map(
                  stock => stock.exchange
                )
              )].length
            }

          </h2>

        </div>

      </div>

      {/* LOADING */}
      {
        fetchingStocks && (

          <div className="py-10 text-center text-gray-400">

            Loading stocks...

          </div>

        )
      }

      {/* EMPTY */}
      {
        !fetchingStocks &&
        stocks.length === 0 && (

          <div className="rounded-2xl border border-white/10 bg-[#111827] p-10 text-center text-gray-400">

            No stocks found

          </div>

        )
      }

      {/* STOCK GRID */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

       {filteredStocks.map((stock) => (

         <div
  key={stock._id}
  className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#111827] to-[#0f172a] p-5 shadow-xl transition duration-500 hover:-translate-y-2 hover:border-green-500/40"
>

  {/* GLOW EFFECT */}
  <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">

    <div className="absolute -top-20 right-[-60px] h-40 w-40 rounded-full bg-green-500/10 blur-3xl"></div>

  </div>

  {/* TOP */}
  <div className="relative z-10 flex items-start justify-between">

    {/* LEFT */}
    <div className="flex gap-4">

      {/* LOGO */}
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg">

        {
          stock.logo ? (

            <img
              src={stock.logo}
              alt={stock.companyName}
              className="h-full w-full object-contain"
            />

          ) : (

            <span className="text-2xl font-black text-black">

              {stock.stockSymbol[0]}

            </span>

          )
        }

      </div>

      {/* INFO */}
      <div>

        <div className="flex items-center gap-2">

          <h2 className="font-mono text-3xl font-black tracking-wider text-white">

            {stock.stockSymbol}

          </h2>

          {/* TREND */}
          <span className="text-lg text-green-400">

            ↗

          </span>

        </div>

        <p className="mt-1 max-w-[180px] truncate text-sm text-gray-400">

          {stock.companyName}

        </p>

      </div>

    </div>

    {/* STATUS */}
    <button
      disabled={
        loadingStock === stock.stockSymbol
      }
      onClick={() =>
        handleToggleStatus(
          stock.stockSymbol
        )
      }
      className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide

      ${
        stock.isActive
          ? "bg-green-500/20 text-green-400"
          : "bg-red-500/20 text-red-400"
      }
      `}
    >

      {
        stock.isActive
          ? "ACTIVE"
          : "INACTIVE"
      }

    </button>

  </div>

  {/* SPARKLINE */}
  <div className="relative z-10 mt-5">

    <svg
      viewBox="0 0 100 30"
      className="h-14 w-full"
    >

      <polyline
        fill="none"
        stroke="rgb(34 197 94)"
        strokeWidth="2"
        points="0,25 20,20 40,22 60,10 80,14 100,5"
      />

    </svg>

  </div>

  {/* DETAILS */}
  <div className="relative z-10 mt-5 grid grid-cols-2 gap-4">

    <div>

      <p className="text-xs uppercase tracking-widest text-gray-500">

        Sector

      </p>

      <p className="mt-1 text-sm font-semibold text-white">

        {stock.sector || "N/A"}

      </p>

    </div>

    <div>

      <p className="text-xs uppercase tracking-widest text-gray-500">

        Country

      </p>

      <p className="mt-1 text-sm font-semibold text-white">

        {stock.country || "N/A"}

      </p>

    </div>

    <div>

      <p className="text-xs uppercase tracking-widest text-gray-500">

        Market Cap

      </p>

      <p className="mt-1 text-sm font-semibold text-green-400">

        {formatMarketCap(
          stock.marketCapitalization
        )}

      </p>

    </div>

    <div>

      <p className="text-xs uppercase tracking-widest text-gray-500">

        IPO

      </p>

      <p className="mt-1 text-sm font-semibold text-white">

        {stock.ipo || "N/A"}

      </p>

    </div>

  </div>

  {/* FOOTER */}
  <div className="relative z-10 mt-6 flex items-center justify-between border-t border-white/10 pt-4">

    <p className="text-xs text-gray-500">

      Added:
      {" "}
      {
        new Date(stock.createdAt)
          .toLocaleDateString()
      }

    </p>

    <div className="flex gap-2">

      <button
        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-green-500"
      >

        View

      </button>

      <button
        onClick={() =>
          handleDelete(
            stock.stockSymbol
          )
        }
        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-red-500"
      >

        Delete

      </button>

    </div>

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

          className="rounded-xl border border-white/10 bg-[#111827] px-5 py-2 text-sm text-white transition hover:border-green-500 disabled:opacity-40"
        >

          Previous

        </button>

        <span className="text-sm text-gray-400">

          Page {page} of {totalPages}

        </span>

        <button

          disabled={page === totalPages}

          onClick={() =>
            setPage(page + 1)
          }

          className="rounded-xl border border-white/10 bg-[#111827] px-5 py-2 text-sm text-white transition hover:border-green-500 disabled:opacity-40"
        >

          Next

        </button>

      </div>

    </div>

    // </div >

  );
}

export default Stocks;