import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllStocks,
  addStock,
  deleteStock,
  toggleStockStatus,
} from "../service/stockService";

import StockCard from "./StockCard";
import { CardSkeleton } from "./Skeleton";

function Stocks() {
  const navigate = useNavigate();

  const role = sessionStorage.getItem("role");

  // STOCK DATA
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);

  // SEARCH + PAGINATION
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStocks, setTotalStocks] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalInactive, setTotalInactive] = useState(0);
  const [totalExchanges, setTotalExchanges] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // LOADING STATES
  const [loadingStock, setLoadingStock] = useState("");
  const [addingStock, setAddingStock] = useState(false);
  const [fetchingStocks, setFetchingStocks] = useState(false);
  // FILTER STATES
// MAIN LOADING
const [loading, setLoading] = useState(false);

  // FORM DATA
  const [stockData, setStockData] = useState({
    stockSymbol: "",
  });

  // FETCH STOCKS
  const fetchStocks = async () => {
    try {
      setLoading(true);

      const data = await getAllStocks(page, search, 9);
      console.log("Stocks data received:", data);

      const allStocks = data.payload || [];

      setStocks(allStocks);
      setTotalPages(data.totalPages || 1);
      setTotalStocks(data.totalStocks || 0);
      setTotalActive(data.totalActive || 0);
      setTotalInactive(data.totalInactive || 0);
      setTotalExchanges(data.totalExchanges || 0);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // FETCH ON LOAD
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchStocks();
    }, 400);

    return () => clearTimeout(debounce);
  }, [page, search]);

  // FILTER STOCKS
  useEffect(() => {
    let filtered = [...stocks];

    // SEARCH FILTER
    filtered = filtered.filter(
      (stock) =>
        stock.stockSymbol
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        stock.companyName
          ?.toLowerCase()
          .includes(search.toLowerCase())
    );

    // STATUS FILTER
    if (role === "trader") {
      filtered = filtered.filter((stock) => stock.isActive);
    } else {
      if (statusFilter === "active") {
        filtered = filtered.filter((stock) => stock.isActive);
      }
      if (statusFilter === "inactive") {
        filtered = filtered.filter((stock) => !stock.isActive);
      }
    }

    setFilteredStocks(filtered);
  }, [stocks, search, statusFilter, role]);

  // HANDLE INPUT
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  const handleChange = (e) => {

    const { name, value } = e.target;

    setStockData({
      ...stockData,

    [name]:
      name === "stockSymbol"
        ? value.toUpperCase()
        : value,
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
        stockData.stockSymbol.trim().toUpperCase();

      const symbolRegex = /^[A-Z.]{1,10}$/;

      if (!cleanedSymbol) {
        return alert("Stock symbol is required");
      }

      if (!symbolRegex.test(cleanedSymbol)) {
        return alert("Enter valid stock symbol");
      }

      await addStock({
        stockSymbol: cleanedSymbol,
      });

      fetchStocks();

      setStockData({

        stockSymbol: ""

      });

      alert("Stock added successfully");
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
    const confirmDelete = window.confirm(
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
  const handleToggleStatus = async (stock) => {
    if (stock.isActive && !window.confirm(`Are you sure you want to make ${stock.stockSymbol} inactive?`)) {
      return;
    }
    try {
      setLoadingStock(stock.stockSymbol);

      await toggleStockStatus(stock.stockSymbol);

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

  // FORMAT MARKET CAP
  const formatMarketCap = (num) => {
    if (!num || num === 0) return "N/A";
    
    // Finnhub provides market cap in Millions.
    // 1,000,000 Millions = 1 Trillion
    // 1,000 Millions = 1 Billion
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "T";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + "B";
    }
    return num.toFixed(2) + "M";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-8 space-y-8">

      {/* HEADER */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">

        {/* LEFT */}
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            Market Explorer
          </h1>

          <p className="mt-2 text-slate-400">
            Discover and manage global assets
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col md:flex-row items-center gap-3">

          {/* SEARCH */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search stocks..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
          </div>

          {/* FILTER BUTTON */}
          {role !== "trader" && (
            <button
              onClick={() =>
                setShowFilters(!showFilters)
              }
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 hover:border-emerald-500 transition"
            >
              ⚙️ Filters
            </button>
          )}
        </div>
      </header>

      {/* FILTER PANEL */}
      {role !== "trader" && showFilters && (
        <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur">
          <h2 className="mb-4 text-lg font-bold">
            Filter Stocks
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-xl px-5 py-2 font-semibold transition
              ${
                statusFilter === "all"
                  ? "bg-emerald-500 text-black"
                  : "bg-slate-800 text-white"
              }`}
            >
              All
            </button>

            <button
              onClick={() =>
                setStatusFilter("active")
              }
              className={`rounded-xl px-5 py-2 font-semibold transition
              ${
                statusFilter === "active"
                  ? "bg-emerald-500 text-black"
                  : "bg-slate-800 text-white"
              }`}
            >
              Active
            </button>

            <button
              onClick={() =>
                setStatusFilter("inactive")
              }
              className={`rounded-xl px-5 py-2 font-semibold transition
              ${
                statusFilter === "inactive"
                  ? "bg-red-500 text-white"
                  : "bg-slate-800 text-white"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      )}

      {/* STATS */}
      {/* <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"> */}
       <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
        
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">
            Total Stocks
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {role === "trader" ? totalActive : totalStocks}
          </h2>
        </div>

        {role !== "trader" && (
          <>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Active
              </p>

              <h2 className="mt-2 text-3xl font-bold text-emerald-400">
                {totalActive}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">
                Inactive
              </p>

              <h2 className="mt-2 text-3xl font-bold text-red-400">
                {totalInactive}
              </h2>
            </div>
          </>
        )}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">
            Exchanges
          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-400">
            {totalExchanges}
          </h2>
        </div>
      </section>

      {/* MANAGER TOOLS */}
      {role === "stockmanager" && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="mb-5 text-xl font-bold">
            Stock Management
          </h2>

          <form
            onSubmit={handleAddStock}
            // className="grid grid-cols-1 md:grid-cols-3 gap-4"
            className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4"
          >

            <input
              type="text"
              name="stockSymbol"
              placeholder="Stock Symbols ex:AAPL"
              value={stockData.stockSymbol}
              onChange={handleChange}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
            />

           
            <button
              type="submit"
              disabled={addingStock}
              className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-black transition hover:bg-emerald-400"
            >
              {addingStock
                ? "Adding..."
                : "+ Add Stock"}
            </button>
          </form>
        </section>
      )}

      {/* STOCK GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {loading ? (
          [...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))
        ) : filteredStocks.length > 0 ? (
          [...filteredStocks]
            .sort((a, b) => (b.isActive === a.isActive ? 0 : b.isActive ? 1 : -1))
            .map((stock) => (
            <div
              key={stock._id}
              className={`group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-4 transition hover:-translate-y-1 hover:border-emerald-500/40`}
            >

              {/* TOP */}
              <div className="flex items-start justify-between">

                <div className={`flex gap-4 transition-opacity ${!stock.isActive ? 'opacity-30 grayscale' : 'opacity-100'}`}>

                  {/* LOGO */}
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white">
                    {stock.logo ? (
                      <img
                        src={stock.logo}
                        alt={stock.companyName}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-2xl font-black text-black">
                        {stock.stockSymbol[0]}
                      </span>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="min-w-0">
                    <h2 className="text-2xl font-black">
                      {stock.stockSymbol}
                    </h2>

                    <p className="mt-1 text-sm text-slate-400 truncate" title={stock.companyName}>
                      {stock.companyName}
                    </p>
                  </div>
                </div>

                {/* STATUS (FOR MANAGERS) */}
                {role !== "trader" && (
                  <button
                    disabled={
                      loadingStock ===
                      stock.stockSymbol
                    }
                    onClick={() =>
                      handleToggleStatus(stock)
                    }
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-all ${
                      stock.isActive
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${stock.isActive ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                    {stock.isActive
                      ? "Active"
                      : "Inactive"}
                  </button>
                )}
              </div>

              {/* CHART */}
              <div className={`mt-5 transition-opacity ${!stock.isActive ? 'opacity-30' : 'opacity-100'}`}>
                <svg
                  viewBox="0 0 100 30"
                  className="h-10 w-full"
                >
                  <polyline
                    fill="none"
                    stroke={stock.isActive ? "rgb(34 197 94)" : "rgb(239 68 68)"}
                    strokeWidth="2"
                    points="0,25 20,20 40,22 60,10 80,14 100,5"
                  />
                </svg>
              </div>

              {/* DETAILS */}
              <div className={`mt-5 grid grid-cols-2 gap-4 transition-opacity ${!stock.isActive ? 'opacity-30' : 'opacity-100'}`}>

                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    Sector
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {stock.sector || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    Country
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {stock.country || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    Market Cap
                  </p>

                  <p className="mt-1 text-sm font-semibold text-emerald-400">
                    {formatMarketCap(
                      stock.marketCapitalization
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    IPO
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {stock.ipo || "N/A"}
                  </p>
                </div>
              </div>

              {/* FOOTER (Dimmed when inactive) */}
              <div className={`mt-6 flex items-center justify-between border-t border-slate-800 pt-4 transition-opacity ${!stock.isActive ? 'opacity-40' : 'opacity-100'}`}>

                <p className="text-xs text-slate-500">
                  Added{" "}
                  {new Date(
                    stock.createdAt
                  ).toLocaleDateString()}
                </p>

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      navigate(
                        `/stocks/${stock.stockSymbol}`
                      )
                    }
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
                  >
                    View
                  </button>

                  {role === "stockmanager" && (
                    <button
                      onClick={() =>
                        handleDelete(
                          stock.stockSymbol
                        )
                      }
                      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-3xl border border-slate-800 bg-slate-900 py-20 text-center">
            <div className="text-5xl">
              🔍
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              No Stocks Found
            </h2>

            <p className="mt-2 text-slate-400">
              Try changing search or filters
            </p>

            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-4 text-emerald-400 hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* PAGINATION */}
      <div className="flex items-center justify-center gap-4 pt-6">

        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2 transition hover:border-emerald-500 disabled:opacity-40"
        >
          Previous
        </button>

        <span className="text-sm text-slate-400">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2 transition hover:border-emerald-500 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Stocks;
