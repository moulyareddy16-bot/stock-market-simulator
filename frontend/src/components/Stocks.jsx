import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStocks, addStock, deleteStock } from "../service/stockService";
import StockCard from "./StockCard";
import { CardSkeleton } from "./Skeleton";

function Stocks() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stockData, setStockData] = useState({ stockSymbol: "", companyName: "" });

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const data = await getAllStocks();
      setStocks(data.payload);
      setFilteredStocks(data.payload);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    const filtered = stocks.filter(s => 
      s.stockSymbol.toLowerCase().includes(search.toLowerCase()) || 
      s.companyName.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStocks(filtered);
  }, [search, stocks]);

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await addStock(stockData);
      fetchStocks();
      setStockData({ stockSymbol: "", companyName: "" });
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (stockSymbol) => {
    if (!window.confirm("Are you sure you want to delete this stock?")) return;
    try {
      await deleteStock(stockSymbol);
      fetchStocks();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Market Explorer</h1>
          <p className="text-slate-400 mt-1 font-medium">Discover and trade over 500+ global assets</p>
        </div>
        
        {/* SEARCH & FILTERS */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input
              type="text"
              placeholder="Search by symbol or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
            />
          </div>
          <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          </button>
        </div>
      </header>

      {/* MANAGER TOOLS */}
      {role === "stockmanager" && (
        <section className="glass-card p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Stock Management Tools
          </h2>
          <form onSubmit={handleAddStock} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Symbol (e.g. AAPL)"
              value={stockData.stockSymbol}
              onChange={(e) => setStockData({ ...stockData, stockSymbol: e.target.value.toUpperCase() })}
              required
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 transition-all"
            />
            <input
              type="text"
              placeholder="Company Name"
              value={stockData.companyName}
              onChange={(e) => setStockData({ ...stockData, companyName: e.target.value })}
              required
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 transition-all"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">
              Add New Asset
            </button>
          </form>
        </section>
      )}

      {/* STOCKS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => <CardSkeleton key={i} />)
        ) : filteredStocks.length > 0 ? (
          filteredStocks.map((stock) => (
            <div key={stock._id} className="relative group">
              <StockCard stock={stock} />
              {role === "stockmanager" && (
                <button
                  onClick={() => handleDelete(stock.stockSymbol)}
                  className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                  title="Delete Stock"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4 glass-card rounded-3xl">
            <div className="text-4xl text-slate-700">🔍</div>
            <div>
              <p className="text-xl font-bold text-white">No assets found</p>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
            <button onClick={() => setSearch("")} className="text-emerald-400 font-bold hover:underline">
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Stocks;