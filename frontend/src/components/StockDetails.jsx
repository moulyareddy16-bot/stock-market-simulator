import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import api from "../service/api";

import { getSingleStock } from "../service/stockService";
import { buyStock, sellStock } from "../service/tradeService";

import { socket } from "../socket/socket";
import StockChart from "./StockChart";
import AdvancedChart from "./AdvancedChart";
import Skeleton from "./Skeleton";
import { useToast } from "./Toast";
import CoinIcon from "./CoinIcon";

function StockDetails() {
  const { stockSymbol } = useParams();
  const [stock, setStock] = useState(null);

  // LIVE GRAPH STATES
  const [livePrice, setLivePrice] = useState(null);
  const [liveChartData, setLiveChartData] = useState([]);
  const [liveChartView, setLiveChartView] = useState("basic"); // basic

  // HISTORICAL STATES
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("1D");
  const [showHistorical, setShowHistorical] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historicalChartView, setHistoricalChartView] = useState("basic"); // basic
  // COMPARISON STATES
  const [compareSymbol, setCompareSymbol] = useState("");
  const [compareData, setCompareData] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [loadingCompare, setLoadingCompare] = useState(false);

  // TRADING STATES
  // ... (rest of the states)
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState("");
  const [trading, setTrading] = useState(false);
  const [pendingTrade, setPendingTrade] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const { addToast } = useToast();

  const role = sessionStorage.getItem("role");
  const historicalSectionRef = useRef(null);

  // 1. FETCH STOCK DETAILS
  // ... (existing fetchStock and formatMarketCap)
  const formatMarketCap = (num) => {
    if (!num || num === 0) return "N/A";
    if (num >= 1000000) return (num / 1000000).toFixed(2) + "T";
    if (num >= 1000) return (num / 1000).toFixed(2) + "B";
    return num.toFixed(2) + "M";
  };

  const fetchStock = async () => {
    try {
      const data = await getSingleStock(stockSymbol);
      const fetchedStock = data.payload;

      let ownedQuantity = 0;
      try {
        const portfolioRes = await api.get("/portfolio");
        const portfolio = portfolioRes.data.payload || [];
        const ownedStock = portfolio.find(s => s.stockSymbol === stockSymbol);
        if (ownedStock) {
          ownedQuantity = ownedStock.ownedQuantity;
        }
      } catch (err) {
        console.log("Failed to fetch portfolio:", err);
      }

      setStock({
        ...fetchedStock,
        ownedQuantity,
        stats: {
          mktCap: formatMarketCap(fetchedStock.marketCapitalization),
          volume: fetchedStock.volume ? (fetchedStock.volume / 1000000).toFixed(2) + "M" : "12.4M",
          avgVol: "15.2M",
          high52: fetchedStock.high52 ? "$" + fetchedStock.high52 : "$142.50",
          low52: fetchedStock.low52 ? "$" + fetchedStock.low52 : "$89.20"
        }
      });
      setLivePrice(Number(fetchedStock.currentPrice).toFixed(2));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setHistoricalData([]);
    setShowHistorical(false);
    fetchStock();
  }, [stockSymbol]);

  // 2. INITIAL LIVE GRAPH
  useEffect(() => {
    if (liveChartData.length === 0 && stock?.currentPrice) {
      const dummy = [];
      const now = Date.now();
      let lastPrice = Number(stock.currentPrice);

      for (let i = 0; i < 50; i++) {
        const time = Math.floor((now - (50 - i) * 60000) / 1000);
        const open = lastPrice;
        // Smoother movement for initial data
        let movement = (Math.random() * 0.2 - 0.1);

        const close = open + movement;
        const high = Math.max(open, close) + Math.random() * 0.2;
        const low = Math.min(open, close) - Math.random() * 0.2;

        dummy.push({
          time,
          price: Number(close.toFixed(2)),
          value: Math.floor(Math.random() * 1000)
        });
        lastPrice = close;
      }
      setLiveChartData(dummy);
    }
  }, [stock]);

  // 3. SOCKET LIVE UPDATES
  useEffect(() => {
    socket.on("stockUpdates", (data) => {
      let liveStock = null;
      if (Array.isArray(data)) {
        liveStock = data.find((item) => item.stockSymbol === stockSymbol);
      } else if (data?.stockSymbol === stockSymbol) {
        liveStock = data;
      }

      if (liveStock) {
        const latestPrice = Number(liveStock.currentPrice);
        setLivePrice(latestPrice.toFixed(2));
        setLiveChartData((prevData) => {
          const nowSeconds = Math.floor(Date.now() / 1000);
          const updated = [
            ...prevData,
            {
              time: nowSeconds,
              price: Number(latestPrice.toFixed(2)),
              value: Math.floor(Math.random() * 1000)
            }
          ];
          return updated.slice(-50);
        });

        setStock(prev => prev ? { ...prev, currentPrice: latestPrice } : prev);
      }
    });

    return () => {
      socket.off("stockUpdates");
    };
  }, [stockSymbol]);

  // 4. FETCH HISTORICAL
  const fetchHistoricalData = async (rangeValue) => {
    try {
      setHistoryLoading(true);
      const response = await axios.get(`http://localhost:5000/api/historical/history/${stockSymbol}?range=${rangeValue}`);
      if (response.data.success) {
        setHistoricalData(response.data.data);
      } else {
        setHistoricalData([]);
      }
    } catch (error) {
      console.log(error);
      setHistoricalData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRangeChange = (rangeValue) => {
    if (rangeValue === selectedRange) return;
    setSelectedRange(rangeValue);
  };

  useEffect(() => {
    if (showHistorical) {
      fetchHistoricalData(selectedRange);
    }
  }, [selectedRange, stockSymbol, showHistorical]);

  const handleCompareSubmit = async (e) => {
    e.preventDefault();
    if (!compareSymbol) return;
    setLoadingCompare(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/historical/history/${compareSymbol.toUpperCase()}?range=${selectedRange}`
      );
      if (response.data && response.data.success) {
        setCompareData(response.data.data);
        setIsComparing(true);
      } else {
        addToast(`No data found for ${compareSymbol.toUpperCase()}`, "error");
      }
    } catch (err) {
      addToast("Error fetching comparison data", "error");
    } finally {
      setLoadingCompare(false);
    }
  };

  const clearCompare = () => {
    setCompareData(null);
    setCompareSymbol("");
    setIsComparing(false);
  };

  // 5. TRADING
  const handleTrade = async (type) => {
    const tradeQuantity = Number(quantity);
    if (tradeQuantity <= 0) {
      setQuantityError("Please provide a valid number of quantity first");
      return;
    }
    setPendingTrade({ type, quantity: tradeQuantity });
  };

  const confirmTrade = async () => {
    const { type, quantity: tradeQuantity } = pendingTrade;
    setPendingTrade(null);
    setTrading(true);

    try {
      if (type === "BUY") {
        await buyStock({ stockSymbol, quantity: tradeQuantity });
        addToast("Stock Bought Successfully", "success");
        setStock(prev => ({ ...prev, ownedQuantity: prev.ownedQuantity + tradeQuantity }));
      } else {
        await sellStock({ stockSymbol, quantity: tradeQuantity });
        addToast("Stock Sold Successfully", "success");
        setStock(prev => ({ ...prev, ownedQuantity: prev.ownedQuantity - tradeQuantity }));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Transaction failed";
      addToast(errorMessage, "error");
    } finally {
      setTrading(false);
      setQuantity(1);
      setShowTradeModal(false);
    }
  };

  // 6. RENDER
  if (!stock) return <div className="p-10"><Skeleton className="h-96 w-full" /></div>;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          overflow-x: hidden !important;
          max-width: 100vw !important;
        }
      ` }} />
      {/* PENDING TRADE MODAL */}
      {pendingTrade && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-slate-700/50 bg-[#020617] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-2xl ${pendingTrade.type === "BUY" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Confirm {pendingTrade.type === "BUY" ? "Buy" : "Sell"}
              </h2>
            </div>

            <p className="text-lg font-medium leading-relaxed text-slate-300">
              Are you sure you want to {pendingTrade.type === "BUY" ? "buy" : "sell"}{" "}
              <span className="text-white font-black">{pendingTrade.quantity}</span> {stockSymbol} shares?
            </p>

            <div className="mt-8 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Value</span>
                <span className={`text-2xl font-black ${pendingTrade.type === "BUY" ? "text-emerald-400" : "text-red-400"}`}>
                  ${(pendingTrade.quantity * stock.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Exchange Rate</span>
                <div className="flex items-center gap-2">
                  <CoinIcon className="w-3 h-3 text-amber-500" />
                  <span className="text-xs font-black text-amber-500 uppercase tracking-widest">1 Coin = $1.00</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => setPendingTrade(null)}
                className="flex-1 rounded-2xl bg-slate-800/50 border border-slate-700 py-4 font-black text-slate-300 hover:bg-slate-800 hover:text-white transition-all uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmTrade}
                className={`flex-1 rounded-2xl py-4 font-black text-black transition-all shadow-2xl uppercase tracking-widest text-xs ${pendingTrade.type === "BUY" ? "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20" : "bg-red-500 hover:bg-red-400 text-white shadow-red-500/20"}`}
              >
                Execute Trade
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="animate-fade-in min-h-screen bg-[#020617] text-slate-200">
        <div className="w-full pt-2 pb-10 overflow-hidden">
          {/* TOP NAVIGATION ROW */}
          <div className="px-6 lg:px-8 mb-4">
            <div className="flex items-center h-8">
              <Link 
                to={role === "stockmanager" ? "/manager" : "/stocks"} 
                className="flex items-center gap-2 text-slate-500 hover:text-emerald-400 transition-all group"
              >
                <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-900/50 border border-slate-800/50 group-hover:border-emerald-500/50 transition-all shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
                </div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Back to Market</span>
              </Link>
            </div>
          </div>
 
          {/* MAIN CONTENT */}
          <div className="px-6 lg:px-12 space-y-8">

          {/* UNIFIED COMPACT HERO SECTION */}
          <section className="glass-card bg-[#0a1120]/40 rounded-[2.5rem] border border-slate-800/50 shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-6 lg:p-8 border-b border-slate-800/40 bg-slate-900/10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">

                  <div className="flex items-center gap-6">
                    <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-none">{stock.stockSymbol}</h1>
                    <div className="flex flex-col">
                      {stock.change && (
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black w-fit mb-0.5 flex items-center gap-1 ${stock.change.includes('-')
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                          <span>{stock.change.includes('-') ? '▼' : '▲'}</span>
                          {stock.change}
                        </span>
                      )}
                      <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase truncate max-w-[150px]">{stock.companyName}</p>
                    </div>
                  </div>

                  <div className="hidden md:block h-12 w-px bg-slate-800/40"></div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-emerald-400">$</span>
                      <h2 className="text-4xl lg:text-5xl font-black text-emerald-400 tracking-tighter">{livePrice}</h2>
                      <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)] ml-1"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   {role === "trader" && (
                     <button
                       onClick={() => setShowTradeModal(true)}
                       className="px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black"
                     >
                       Trade Asset
                     </button>
                   )}
                   <button
                     onClick={() => {
                        setShowHistorical(!showHistorical);
                        if (!showHistorical) {
                           setTimeout(() => {
                              historicalSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                           }, 300);
                        }
                     }}
                     className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 border ${showHistorical ? "bg-slate-800 text-white border-slate-700" : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"}`}
                   >
                     {showHistorical ? "Hide Analysis" : "Historical Analysis"}
                   </button>
                </div>
              </div>
            </div>

            <div className="p-4 lg:p-6 bg-slate-950/20">
              <div className="flex items-center justify-between px-6 py-3 bg-slate-900/30 rounded-t-2xl border-x border-t border-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Market Momentum</h3>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/10">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Live</span>
                </div>
              </div>
              <div className="h-[380px] lg:h-[420px] w-full p-2 bg-slate-950/40 rounded-b-2xl border border-slate-800/30">
                <StockChart chartData={liveChartData} range="LIVE" />
              </div>
            </div>
          </section>

          <div className="space-y-12">

            {/* HISTORICAL CHART - MAXIMUM WIDTH */}
            {showHistorical && (
              <section ref={historicalSectionRef} className="glass-card bg-[#0a1120]/40 rounded-[2.5rem] border border-slate-800/50 shadow-2xl overflow-hidden animate-slide-up flex flex-col scroll-mt-10 max-w-full">
                
                {/* 1. HEADER SECTION */}
                <div className="p-6 lg:p-8 pb-5 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black text-white uppercase tracking-[0.1em]">Historical Analysis</h2>
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Institutional Grade Data Engine</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                       {/* Comparison Tool */}
                       <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                         <form onSubmit={handleCompareSubmit} className="flex items-center">
                           <input 
                             type="text"
                             placeholder="COMPARE..."
                             value={compareSymbol}
                             onChange={(e) => setCompareSymbol(e.target.value)}
                             className="bg-transparent px-4 py-2 text-[10px] font-black tracking-[0.2em] text-white outline-none w-28 md:w-36 transition-all placeholder:text-slate-600 uppercase"
                           />
                           <button 
                             type="submit"
                             disabled={loadingCompare}
                             className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-lg"
                           >
                             {loadingCompare ? '...' : 'ADD'}
                           </button>
                         </form>
                       </div>

                       {/* Range Selector */}
                       <div className="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner gap-1">
                         {["1D", "5D", "1M", "3M", "1Y", "MAX"].map((item) => (
                           <button
                             key={item}
                             onClick={() => handleRangeChange(item)}
                             className={`min-w-[60px] md:min-w-[70px] rounded-xl px-4 py-2.5 text-[10px] font-black transition-all ${selectedRange === item ? "bg-emerald-500 text-black shadow-[0_8px_20px_rgba(16,185,129,0.3)]" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
                           >
                             {item}
                           </button>
                         ))}
                       </div>
                    </div>
                  </div>

                  {/* Active Comparison Chip */}
                  {isComparing && (
                    <div className="mt-6 flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl w-fit animate-fade-in">
                       <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                       <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Comparing with {compareSymbol.toUpperCase()}</span>
                       <button onClick={clearCompare} className="ml-2 text-indigo-400 hover:text-white transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                       </button>
                    </div>
                  )}
                </div>

                {/* 2. CHART SECTION - Full Height and Width */}
                <div className="h-[450px] w-full relative">
                  {historyLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0a1120]/60 backdrop-blur-sm z-10">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Synchronizing Data...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full">
                       <AdvancedChart 
                         chartData={historicalData} 
                         range={selectedRange} 
                         mainSymbol={stockSymbol} 
                         compareData={compareData}
                         compareSymbol={compareSymbol}
                       />
                    </div>
                  )}
                </div>

               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 border-t border-slate-800/50 bg-slate-900/20 divide-x divide-slate-800/50">
                 {stock.stats && Object.entries(stock.stats).map(([key, val]) => (
                   <div key={key} className="px-4 py-6 hover:bg-slate-800/20 transition-colors text-center">
                     <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">{key}</p>
                     <p className="text-sm font-black text-white">{val}</p>
                   </div>
                 ))}
               </div>
             </section>
            )}
          </div>

          {/* 3. INFO & ABOUT - TWO COLUMNS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section className="glass-card p-10 bg-slate-900/20 rounded-[2.5rem] border border-slate-800/30 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-1.5 w-8 bg-emerald-500 rounded-full"></div>
                <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Company Analysis</h2>
              </div>
              <p className="text-base text-slate-400 leading-relaxed font-medium">
                {stock.description || `Comprehensive overview for ${stock.companyName}. This profile includes key financial metrics and sectoral positioning within the ${stock.sector} industry. It highlights the company's market dominance and growth potential in the current economic landscape.`}
              </p>
            </section>

            <section className="glass-card p-10 bg-slate-900/20 rounded-[2.5rem] border border-slate-800/30 h-full">
              <div className="flex items-center gap-4 mb-10 pb-4 border-b border-slate-800/50">
                <div className="h-1.5 w-6 bg-emerald-500 rounded-full"></div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Asset Profile</h3>
              </div>
              <div className="grid grid-cols-2 gap-y-10 gap-x-8">
                {[
                  { label: "Sector", value: stock.sector, icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
                  { label: "Exchange", value: stock.exchange, icon: "M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" },
                  { label: "Country", value: stock.country, icon: "M12 22s8-4.5 8-11.8A8 8 0 0 0 12 2a8 8 0 0 0-8 8.2c0 7.3 8 11.8 8 11.8z" },
                  { label: "IPO Date", value: stock.ipo, icon: "M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM3 10h18M8 2v4M16 2v4" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="p-2 bg-slate-800/50 rounded-lg text-slate-500 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
                      <p className="text-xs font-black text-slate-200 uppercase truncate max-w-[120px]">{item.value || "N/A"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* TRADE TERMINAL POPUP MODAL */}
      {showTradeModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 lg:p-10">
          <div
            className="absolute inset-0 bg-slate-950/10 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowTradeModal(false)}
          ></div>

          <div className="relative w-full max-w-lg bg-[#050914] rounded-[2.5rem] border border-slate-800/50 shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-zoom-in">
            {/* MODAL HEADER */}
            <div className="p-6 border-b border-slate-800/40 flex items-center justify-between bg-slate-900/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tighter uppercase mb-0.5">Trade Terminal</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Live Engine</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowTradeModal(false)}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* ASSET INFO MINI-BAR */}
              <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                <div className="flex flex-col">
                  <span className="text-lg font-black text-white leading-none">{stockSymbol}</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase mt-1">{stock.companyName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Market Price</span>
                  <span className="text-xl font-black text-emerald-400 leading-none">${livePrice}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* STATS */}
                <div className="p-5 rounded-3xl bg-black/40 border border-slate-800/50 flex flex-col justify-between h-full">
                  <div>
                    <p className="text-3xl font-black text-white tracking-tighter">{stock.ownedQuantity}</p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Shares Held</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-800/50">
                    <p className="text-lg font-black text-emerald-400 tracking-tight">
                      ${(stock.ownedQuantity * livePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Position Value</p>
                  </div>
                </div>

                {/* INPUT */}
                <div className="p-5 rounded-3xl bg-black/40 border border-slate-800/50 space-y-4">
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => {
                        setQuantity(e.target.value);
                        setQuantityError("");
                      }}
                      className={`w-full bg-slate-900/50 border-2 ${quantityError ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'} rounded-2xl p-4 text-3xl font-black text-white outline-none transition-all text-center`}
                      placeholder="1"
                    />
                  </div>
                  <div className="px-3 py-2 bg-white/5 rounded-xl border border-white/5 text-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Required</span>
                    <span className="text-sm font-black text-white">${(quantity * livePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pb-2">
                <button
                  disabled={trading}
                  onClick={() => handleTrade("BUY")}
                  className="flex-1 rounded-2xl bg-emerald-500 py-4 text-xs font-black text-black hover:bg-emerald-400 transition-all shadow-lg uppercase tracking-widest"
                >
                  {trading ? "..." : "Buy Asset"}
                </button>
                <button
                  disabled={trading || stock.ownedQuantity < quantity}
                  onClick={() => handleTrade("SELL")}
                  className="flex-1 rounded-2xl bg-transparent border-2 border-red-500/50 py-4 text-xs font-black text-red-500 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest"
                >
                  {trading ? "..." : "Sell Asset"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
    </>
  );
}

export default StockDetails;

