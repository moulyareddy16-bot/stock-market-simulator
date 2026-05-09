import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

import { getSingleStock } from "../service/stockService";
import { buyStock, sellStock } from "../service/tradeService";

import { socket } from "../socket/socket";
import StockChart from "./StockChart";
import Skeleton from "./Skeleton";
import { useToast } from "./Toast";

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
  const fetchStock = async () => {
    try {
      const data = await getSingleStock(stockSymbol);
      const fetchedStock = data.payload;
      
      setStock({
        ...fetchedStock,
        ownedQuantity: 0,
        stats: {
           open: (fetchedStock.currentPrice * 0.99).toFixed(2),
           high: (fetchedStock.currentPrice * 1.05).toFixed(2),
           low: (fetchedStock.currentPrice * 0.95).toFixed(2),
           mktCap: "N/A",
           peRatio: "N/A",
           divYield: "N/A"
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
      addToast("Transaction failed", "error");
    } finally {
      setTrading(false);
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
              <span className={`font-black ${pendingTrade.type === "BUY" ? "text-emerald-400" : "text-red-400"}`}>
                ${(pendingTrade.quantity * stock.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              ?
            </p>

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

      <div className="animate-fade-in space-y-10 pb-20">
        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-400 transition group">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
          Back to Market
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT: CHART & INFO */}
          <div className="lg:col-span-2 space-y-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase">{stock.stockSymbol}</h1>
                  {stock.change && (
                    <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-black">
                      {stock.change}
                    </div>
                  )}
                </div>
                <p className="text-lg font-medium text-slate-400">{stock.companyName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Live Market Price</p>
                <div className="flex items-center gap-2 justify-end">
                  <h2 className="text-4xl font-black text-emerald-400">${livePrice}</h2>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></div>
                </div>
              </div>
            </header>

            {/* LIVE GRAPH */}
            <div className="glass-card p-6 bg-slate-800 rounded-[2rem] h-[400px]">
              <StockChart chartData={liveChartData} range="LIVE" />
            </div>

            <div className="flex flex-wrap justify-between gap-4">
              <button
                onClick={() => {
                   setShowHistorical(true);
                   setTimeout(() => {
                      historicalSectionRef.current?.scrollIntoView({ behavior: "smooth" });
                   }, 200);
                }}
                className="w-full rounded-xl bg-slate-800 py-4 font-semibold text-white transition hover:bg-slate-700"
              >
                View Historical Analysis
              </button>
            </div>

            {/* HISTORICAL GRAPH */}
            {showHistorical && (
               <div ref={historicalSectionRef} className="glass-card bg-slate-800 p-6 rounded-[2rem] space-y-6">
                  <h2 className="text-3xl font-black">Historical Analysis</h2>
                  <div className="flex flex-wrap gap-3">
                     {["1D", "5D", "1M", "3M", "1Y", "MAX"].map((item) => (
                        <button
                           key={item}
                           onClick={() => handleRangeChange(item)}
                           className={`rounded-xl px-5 py-2 font-semibold transition-all ${selectedRange === item ? "bg-emerald-400 text-black" : "bg-slate-700 text-white hover:bg-slate-600"}`}
                        >
                           {item}
                        </button>
                     ))}
                  </div>
                  <div className="h-[400px] w-full">
                     {historyLoading ? (
                        <div className="flex h-full items-center justify-center text-xl text-slate-400">Loading historical data...</div>
                     ) : (
                        <StockChart chartData={historicalData} range={selectedRange} />
                     )}
                  </div>
               </div>
            )}
            
            {/* STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stock.stats && Object.entries(stock.stats).map(([key, val]) => (
                <div key={key} className="glass-card bg-slate-800 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{key}</p>
                  <p className="text-lg font-black text-white">{val}</p>
                </div>
              ))}
            </div>

            <section className="space-y-4">
              <h2 className="text-2xl font-black text-white">About {stock.companyName}</h2>
              <p className="text-slate-400 leading-relaxed font-medium">
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
                        <p className="text-xl font-black text-emerald-400">${(stock.ownedQuantity * livePrice).toLocaleString()}</p>
                        <p className="text-xs font-medium text-slate-400">Market Value</p>
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
                      <span className="text-slate-400">Estimated Cost</span>
                      <span className="text-white">${(quantity * livePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-400">Trading Fee</span>
                      <span className="text-emerald-400">FREE</span>
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
