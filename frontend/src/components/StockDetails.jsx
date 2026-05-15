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
  const [liveChartView, setLiveChartView] = useState("basic"); // basic
  
  // HISTORICAL STATES
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("1D");
  const [showHistorical, setShowHistorical] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historicalChartView, setHistoricalChartView] = useState("basic"); // basic

  // TRADING STATES
  // ... (rest of the states)
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState("");
  const [trading, setTrading] = useState(false);
  const [pendingTrade, setPendingTrade] = useState(null);
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
      setQuantity(0);
    }
  };

  // 6. RENDER
  if (!stock) return <div className="p-10"><Skeleton className="h-96 w-full" /></div>;

  return (
    <>
      {/* PENDING TRADE MODAL */}
      {pendingTrade && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-slate-700/50 bg-[#020617] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4 mb-6">
               <div className={`p-3 rounded-2xl ${pendingTrade.type === "BUY" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
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
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-10 space-y-12">
          
          {/* 1. TOP PREMIUM HEADER */}
          <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-slate-800/50">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
              <Link to={role === "stockmanager" ? "/manager" : "/stocks"} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all group">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
              </Link>

              <div className="space-y-1">
                <div className="flex items-center gap-4">
                   <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-none">{stock.stockSymbol}</h1>
                   <div className="flex flex-col">
                      {stock.change && (
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black w-fit ${
                          stock.change.includes('-') 
                            ? 'bg-red-500/10 text-red-400' 
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {stock.change}
                        </span>
                      )}
                      <p className="text-sm font-bold text-slate-500 tracking-tight">{stock.companyName}</p>
                   </div>
                </div>
              </div>

              <div className="hidden md:block h-16 w-px bg-slate-800/50"></div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-60">Market Value</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl lg:text-5xl font-black text-emerald-400">$</span>
                   <h2 className="text-5xl lg:text-6xl font-black text-emerald-400 tracking-tight">{livePrice}</h2>
                   <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] ml-2"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <button
                 onClick={() => {
                    setShowHistorical(!showHistorical);
                    if (!showHistorical) {
                       setTimeout(() => {
                          historicalSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                       }, 300);
                    }
                 }}
                 className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 border ${showHistorical ? "bg-slate-800 text-white border-slate-700" : "bg-emerald-500 text-black border-emerald-400 hover:bg-emerald-400"}`}
               >
                 {showHistorical ? "Hide Historical Analysis" : "View History"}
               </button>
            </div>
          </header>

          <div className="space-y-10">
            
            {/* 2. CHARTS AREA - FULL WIDTH */}
            <div className="space-y-10">
              
              {/* LIVE MOMENTUM CHART - MAXIMUM WIDTH */}
              <section className="glass-card bg-[#0a1120]/40 rounded-[2.5rem] border border-slate-800/50 shadow-2xl overflow-hidden">
                <div className="p-8 pb-0 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <h3 className="text-lg font-black text-white uppercase tracking-widest">Live Momentum</h3>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900/80 rounded-full border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-tighter">Live Stream</span>
                   </div>
                </div>
                <div className="h-[500px] w-full p-4">
                   <StockChart chartData={liveChartData} range="LIVE" />
                </div>
              </section>

              {/* HISTORICAL CHART - MAXIMUM WIDTH */}
              {showHistorical && (
                <section ref={historicalSectionRef} className="glass-card bg-[#0a1120]/40 rounded-[2.5rem] border border-slate-800/50 shadow-2xl overflow-hidden animate-slide-up">
                  <div className="p-8 pb-0 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-emerald-500/10 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                      </div>
                      <h2 className="text-xl font-black text-white uppercase tracking-widest">Historical Performance</h2>
                    </div>
                    
                    <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
                       {["1D", "5D", "1M", "3M", "1Y", "MAX"].map((item) => (
                          <button
                             key={item}
                             onClick={() => handleRangeChange(item)}
                             className={`rounded-xl px-6 py-2 text-xs font-black transition-all ${selectedRange === item ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-white"}`}
                          >
                             {item}
                          </button>
                       ))}
                    </div>
                  </div>
                  
                  <div className="h-[550px] w-full p-4">
                     {historyLoading ? (
                        <div className="flex h-full items-center justify-center">
                           <div className="flex flex-col items-center gap-4">
                              <div className="w-12 h-12 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest animate-pulse">Synchronizing Data...</p>
                           </div>
                        </div>
                     ) : (
                        <StockChart chartData={historicalData} range={selectedRange} />
                     )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 border-t border-slate-800/50 bg-slate-900/20">
                     {stock.stats && Object.entries(stock.stats).map(([key, val]) => (
                       <div key={key} className="px-10 py-8 border-r border-slate-800/50 last:border-none hover:bg-slate-800/20 transition-colors text-center">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{key}</p>
                         <p className="text-base font-black text-white">{val}</p>
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
                  <div className="h-1 w-8 bg-emerald-500 rounded-full"></div>
                  <h2 className="text-xl font-black text-white uppercase tracking-widest">Company Analysis</h2>
                </div>
                <p className="text-base text-slate-400 leading-relaxed font-medium">
                  {stock.description || `Comprehensive overview for ${stock.companyName}. This profile includes key financial metrics and sectoral positioning within the ${stock.sector} industry.`}
                </p>
              </section>

              <section className="glass-card p-10 bg-slate-900/20 rounded-[2.5rem] border border-slate-800/30">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 pb-4 border-b border-slate-800">Quick Profile</h3>
                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                  {[
                    { label: "Sector", value: stock.sector },
                    { label: "Exchange", value: stock.exchange },
                    { label: "Country", value: stock.country },
                    { label: "IPO Date", value: stock.ipo }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{item.label}</p>
                      <p className="text-base font-black text-slate-200 uppercase truncate">{item.value || "N/A"}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* 4. TRADING TERMINAL - FULL WIDTH BOTTOM */}
            {role === "trader" ? (
              <section className="glass-card bg-[#0f172a] p-12 rounded-[3rem] border border-slate-800 shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col xl:flex-row gap-12 items-center">
                  <div className="xl:w-1/3 space-y-4 text-center xl:text-left">
                    <div className="flex items-center justify-center xl:justify-start gap-4 mb-2">
                       <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                         <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                       </div>
                       <h3 className="text-4xl font-black text-white tracking-tight">Trade Terminal</h3>
                    </div>
                    <p className="text-slate-400 font-medium">Execute instant market orders for {stock.companyName} using your available simulation balance.</p>
                  </div>

                  <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    {/* POSITION CARD */}
                    <div className="p-8 rounded-[2rem] bg-slate-950/80 border border-slate-800 shadow-inner flex flex-col justify-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Portfolio Position</p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-5xl font-black text-white">{stock.ownedQuantity}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Shares Held</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-emerald-400">
                            ${(stock.ownedQuantity * livePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Value</p>
                        </div>
                      </div>
                    </div>

                    {/* INPUT SECTION */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantity</label>
                        <div className="flex items-center gap-2">
                          <CoinIcon className="w-3 h-3 text-amber-500" />
                          <span className="text-[9px] font-black text-amber-500 uppercase">1 Coin = $1.00</span>
                        </div>
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => {
                          setQuantity(e.target.value);
                          setQuantityError("");
                        }}
                        className={`w-full bg-slate-950 border ${quantityError ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'} rounded-[1.5rem] p-6 text-4xl font-black text-white outline-none transition-all shadow-inner text-center`}
                        placeholder="0"
                      />
                      <div className="flex justify-between items-center px-4">
                         <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Investment</span>
                         <span className="text-xl font-black text-white">
                           ${(quantity * livePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                         </span>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col gap-4">
                      <button
                        disabled={trading}
                        onClick={() => handleTrade("BUY")}
                        className="w-full rounded-2xl bg-emerald-500 py-6 text-lg font-black text-black hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 uppercase tracking-widest"
                      >
                        {trading ? "Processing..." : "Buy Asset"}
                      </button>
                      <button
                        disabled={trading || stock.ownedQuantity < quantity}
                        onClick={() => handleTrade("SELL")}
                        className="w-full rounded-2xl bg-slate-900 border border-red-500/30 py-6 text-lg font-black text-red-500 hover:bg-red-500/5 hover:border-red-500 transition-all disabled:opacity-50 uppercase tracking-widest"
                      >
                        {trading ? "Processing..." : "Sell Asset"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <div className="glass-card bg-[#0f172a] p-10 rounded-[3rem] border border-slate-800 text-center">
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Management Dashboard — Trading Terminal Disabled</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default StockDetails;

