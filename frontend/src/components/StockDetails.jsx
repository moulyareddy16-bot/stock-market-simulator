import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import api from "../service/api";

import { getSingleStock } from "../service/stockService";
import { buyStock, sellStock } from "../service/tradeService";

import { socket } from "../socket/socket";
import StockChart from "./StockChart";
import Skeleton from "./Skeleton";
import { useToast } from "./Toast";
import CoinIcon from "./CoinIcon";

function StockDetails() {
  const { stockSymbol } = useParams();
  const [stock, setStock] = useState(null);
  
  // LIVE GRAPH STATES
  const [livePrice, setLivePrice] = useState(null);
  const [liveChartData, setLiveChartData] = useState([]);
  
  // HISTORICAL STATES
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("1D");
  const [showHistorical, setShowHistorical] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // TRADING STATES
  const [quantity, setQuantity] = useState(1);
  const [trading, setTrading] = useState(false);
  const [pendingTrade, setPendingTrade] = useState(null);
  const { addToast } = useToast();

  const role = localStorage.getItem("role");
  const historicalSectionRef = useRef(null);

  // 1. FETCH STOCK DETAILS
  const formatMarketCap = (num) => {
    if (!num || num === 0) return "N/A";
    // Finnhub provides market cap in Millions
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
           open: (fetchedStock.currentPrice * 0.99).toFixed(2),
           high: (fetchedStock.currentPrice * 1.05).toFixed(2),
           low: (fetchedStock.currentPrice * 0.95).toFixed(2),
           mktCap: formatMarketCap(fetchedStock.marketCapitalization),
           peRatio: fetchedStock.peRatio || "N/A",
           divYield: fetchedStock.divYield || "N/A"
        }
      });
      setLivePrice(Number(fetchedStock.currentPrice).toFixed(2));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [stockSymbol]);

  // 2. INITIAL LIVE GRAPH
  useEffect(() => {
    if (liveChartData.length === 0 && stock?.currentPrice) {
      const dummy = [];
      for (let i = 0; i < 15; i++) {
        dummy.push({
          date: new Date(Date.now() - (15 - i) * 60000).toTimeString().split(' ')[0],
          price: Number(stock.currentPrice) + (Math.random() * 2 - 1)
        });
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
          const updated = [
            ...prevData,
            {
              date: new Date().toTimeString().split(' ')[0],
              price: Number(latestPrice.toFixed(2))
            }
          ];
          return updated.slice(-10);
        });
        
        // Update stock current price so stats/terminal reflect it
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

  // 5. TRADING
  const handleTrade = async (type) => {
    const tradeQuantity = Number(quantity);
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
      setQuantity(0);
    }
  };

  // 6. RENDER
  if (!stock) return <div className="p-10"><Skeleton className="h-96 w-full" /></div>;

  return (
    <>
      {/* PENDING TRADE MODAL */}
      {pendingTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#020617] p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-white">
              Confirm {pendingTrade.type === "BUY" ? "Purchase" : "Sale"}
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-300">
              {pendingTrade.type === "BUY" ? "Buy" : "Sell"} {pendingTrade.quantity} {stockSymbol} share{pendingTrade.quantity === 1 ? "" : "s"} for approximately{" "}
              <span className={`font-black flex items-center justify-center gap-1 ${pendingTrade.type === "BUY" ? "text-emerald-400" : "text-red-400"}`}>
                ${(pendingTrade.quantity * stock.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              ?
            </p>
            
            <div className="mt-4 flex flex-col items-center justify-center py-2 border-y border-slate-800/50">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Exchange Rate:</span>
              <div className="flex items-center gap-2">
                <CoinIcon className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                  1 Coin = $1.00
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingTrade(null)}
                className="flex-1 rounded-xl bg-slate-800 py-3 font-semibold text-white hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmTrade}
                className={`flex-1 rounded-xl py-3 font-semibold text-black transition ${pendingTrade.type === "BUY" ? "bg-emerald-500 hover:bg-emerald-400" : "bg-red-500 hover:bg-red-400 text-white"}`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="animate-fade-in pt-6 space-y-12 pb-20 max-w-[1600px] mx-auto px-4 lg:px-8">
        
        {/* TOP NAVBAR: BACK LINK & LOGOUT SPACE */}
        <div className="flex items-center justify-between">
          <Link to={role === "stockmanager" ? "/manager" : "/stocks"} className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-emerald-400 transition group">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
            Back to Market
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR: SYMBOL, BUTTON, PROFILE */}
          <div className="flex flex-col gap-6 w-full lg:col-span-1">
             {/* SYMBOL BOX */}
             <div className="glass-card flex flex-col justify-center items-center p-8 bg-slate-800/40 rounded-[2.5rem] border border-slate-700/50 shadow-2xl relative overflow-hidden text-center">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full"></div>
                
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">{stock.stockSymbol}</h1>
                  {stock.change && (
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                      stock.change.includes('-') 
                        ? 'bg-red-500/10 text-red-400' 
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {stock.change}
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-400 mb-6">{stock.companyName}</p>
                
                <div className="w-full h-px bg-slate-700/50 mb-6"></div>
                
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 opacity-60">Current Price</p>
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-4xl font-black text-emerald-400">$</span>
                  <h2 className="text-5xl font-black text-emerald-400 tracking-tight">{livePrice}</h2>
                  <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]"></div>
                </div>
             </div>

             {/* COMPANY PROFILE */}
             <div className="glass-card p-8 bg-slate-800/20 rounded-[2.5rem] border border-slate-700/30 space-y-6">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-700/50 pb-3">Company Profile</h3>
               <div className="space-y-5">
                 {[
                   { label: "Sector", value: stock.sector },
                   { label: "Exchange", value: stock.exchange },
                   { label: "Country", value: stock.country },
                   { label: "IPO Date", value: stock.ipo }
                 ].map((item, idx) => (
                   <div key={idx}>
                     <p className="text-[10px] font-bold text-slate-600 uppercase mb-1">{item.label}</p>
                     <p className="text-xs font-black text-slate-300 uppercase truncate">{item.value || "N/A"}</p>
                   </div>
                 ))}
               </div>
             </div>

             {/* VIEW HISTORY BUTTON */}
             <button
               onClick={() => {
                  setShowHistorical(!showHistorical);
                  if (!showHistorical) {
                     setTimeout(() => {
                        historicalSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                     }, 200);
                  }
               }}
               className={`w-full rounded-[2rem] py-6 font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${showHistorical ? "bg-slate-700 text-white border border-slate-600" : "bg-emerald-500 text-black shadow-emerald-500/10 hover:bg-emerald-400"}`}
             >
               {showHistorical ? "Hide Historical Analysis" : "View Historical Analysis"}
             </button>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className={`space-y-10 ${role === "trader" ? "lg:col-span-2" : "lg:col-span-3"}`}>
            
            {/* LIVE MOMENTUM */}
            <div className="glass-card p-8 bg-slate-900/40 rounded-[2.5rem] border border-slate-700/50 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-base font-black text-white uppercase tracking-wider">Live Momentum</h3>
                 <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-tighter border border-emerald-500/20">Real-time Stream</span>
              </div>
              <div className="h-[320px]">
                 <StockChart chartData={liveChartData} range="LIVE" />
              </div>
            </div>

            {/* HISTORICAL (CONDITIONAL) */}
            {showHistorical && (
               <div ref={historicalSectionRef} className="space-y-8 animate-slide-up">
                  <div className="glass-card bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-700/50 shadow-2xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                      <h2 className="text-xl font-black text-white uppercase tracking-widest">Historical Performance</h2>
                      <div className="flex bg-slate-950/40 p-1 rounded-xl border border-slate-800">
                         {["1D", "5D", "1M", "3M", "1Y", "MAX"].map((item) => (
                            <button
                               key={item}
                               onClick={() => handleRangeChange(item)}
                               className={`rounded-lg px-4 py-1.5 text-[10px] font-black transition-all ${selectedRange === item ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-white"}`}
                            >
                               {item}
                            </button>
                         ))}
                      </div>
                    </div>
                    <div className="h-[380px] w-full">
                       {historyLoading ? (
                          <div className="flex h-full items-center justify-center">
                             <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Syncing data...</p>
                             </div>
                          </div>
                       ) : (
                          <StockChart chartData={historicalData} range={selectedRange} />
                       )}
                    </div>
                  </div>

                  {/* STATS GRID */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                     {stock.stats && Object.entries(stock.stats).map(([key, val]) => (
                       <div key={key} className="glass-card bg-slate-800/40 p-5 rounded-2xl border border-slate-700/30 text-center hover:border-emerald-500/30 transition-all group">
                         <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mb-1 group-hover:text-emerald-400">{key}</p>
                         <p className="text-sm font-black text-white">{val}</p>
                       </div>
                     ))}
                  </div>
               </div>
            )}
            
            {/* ABOUT SECTION */}
            <section className="glass-card p-10 bg-slate-800/10 rounded-[2.5rem] border border-slate-700/20 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-0.5 w-8 bg-emerald-500 rounded-full"></div>
                <h2 className="text-lg font-black text-white uppercase tracking-widest">About {stock.companyName}</h2>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                {stock.description || "No description available for this stock."}
              </p>
            </section>
          </div>


          {/* RIGHT: TRADING TERMINAL */}
          {role === "trader" && (
            <aside className="space-y-8">
              <div className="glass-card bg-slate-800 p-8 rounded-[2.5rem] sticky top-24">
                <h3 className="text-2xl font-black text-white mb-6">Trade Terminal</h3>
                
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Your Position</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-3xl font-black text-white">{stock.ownedQuantity}</p>
                        <p className="text-xs font-medium text-slate-400">Shares Owned</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-emerald-400 flex items-center justify-end gap-1">
                          ${(stock.ownedQuantity * livePrice).toLocaleString()}
                        </p>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-tighter">Market Value</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-xl font-black text-white outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <div className="py-4 border-y border-slate-700 space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-400">Total Investment</span>
                      <span className="text-white flex items-center gap-1">
                        ${(quantity * livePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-400">Trading Fee</span>
                      <span className="text-emerald-400">FREE</span>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex flex-col items-center justify-center">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Exchange Rate:</span>
                      <div className="flex items-center gap-2">
                        <CoinIcon className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                          1 Coin = $1.00
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      disabled={trading}
                      onClick={() => handleTrade("BUY")}
                      className="flex-1 rounded-2xl bg-emerald-500 py-4 text-lg font-bold text-black hover:bg-emerald-400 disabled:opacity-50"
                    >
                      {trading ? "..." : "BUY"}
                    </button>
                    <button
                      disabled={trading || stock.ownedQuantity < quantity}
                      onClick={() => handleTrade("SELL")}
                      className="flex-1 rounded-2xl bg-red-500/10 py-4 text-lg font-bold text-red-500 border border-red-500/30 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {trading ? "..." : "SELL"}
                    </button>
                  </div>

                  <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">
                    Real-time execution via simulated exchange
                  </p>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  );
}

export default StockDetails;