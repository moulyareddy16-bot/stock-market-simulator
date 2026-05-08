import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../service/api";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Skeleton from "./Skeleton";
import { useToast } from "./Toast";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

function StockDetails() {
  const { stockSymbol } = useParams();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [trading, setTrading] = useState(false);
  const [pendingTrade, setPendingTrade] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // In a real app, you'd fetch specific stock details. 
        // Here we'll simulate it using the symbol and some mock data.
        const res = await api.get("/portfolio"); // Just to check if user has it
        const userStock = res.data.payload.find(s => s.stockSymbol === stockSymbol);
        
        setStock({
          stockSymbol,
          companyName: userStock?.companyName || "Global Tech Solutions Inc.",
          currentPrice: 154.20 + (Math.random() * 10 - 5),
          change: "+2.45%",
          description: "Global Tech Solutions Inc. is a leading provider of innovative technology services and products. Founded in 1998, the company has grown into a multi-billion dollar enterprise with a presence in over 50 countries. They specialize in cloud computing, artificial intelligence, and cyber security solutions.",
          stats: {
            open: "152.10",
            high: "156.40",
            low: "151.05",
            mktCap: "2.4T",
            peRatio: "28.5",
            divYield: "1.2%"
          },
          ownedQuantity: userStock?.ownedQuantity || 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [stockSymbol]);

  const handleTrade = async (type) => {
    const tradeQuantity = Number(quantity);

    setPendingTrade({ type, quantity: tradeQuantity });
  };

  const submitTrade = async (type, tradeQuantity) => {
    try {
      setTrading(true);
      const res = await api.post(`/transactions/${type.toLowerCase()}`, {
        stockSymbol,
        quantity: tradeQuantity
      });
      addToast(res.data.message, "success");
      // Update owned quantity locally
      setStock(prev => ({
        ...prev,
        ownedQuantity: type === "BUY" ? prev.ownedQuantity + tradeQuantity : prev.ownedQuantity - tradeQuantity
      }));
    } catch (err) {
      addToast(err.response?.data?.message || "Transaction failed", "error");
    } finally {
      setTrading(false);
    }
  };

  const confirmTrade = async () => {
    const { type, quantity: tradeQuantity } = pendingTrade;
    setPendingTrade(null);
    await submitTrade(type, tradeQuantity);
  };

  const chartData = {
    labels: ['9:30 AM', '10:30 AM', '11:30 AM', '12:30 PM', '1:30 PM', '2:30 PM', '3:30 PM', '4:00 PM'],
    datasets: [
      {
        fill: true,
        label: 'Price',
        data: [150, 152, 151, 153, 155, 154, 156, 154.2],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1e293b',
        titleColor: '#94a3b8',
        bodyColor: '#fff',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: { display: false },
      y: {
        grid: { color: '#1e293b' },
        ticks: { color: '#64748b' }
      },
    },
  };

  if (loading) return <div className="p-10"><Skeleton className="h-96 w-full" /></div>;

  return (
    <>
      {pendingTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
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
                className="flex-1 btn-secondary py-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmTrade}
                className={`flex-1 py-3 ${pendingTrade.type === "BUY" ? "btn-primary" : "btn-secondary hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"}`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="animate-fade-in space-y-10 pb-20">
      {/* NAVIGATION */}
      <Link to="/stocks" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-400 transition group">
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
                <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-black">
                  {stock.change}
                </div>
              </div>
              <p className="text-lg font-medium text-slate-400">{stock.companyName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Current Price</p>
              <h2 className="text-4xl font-black text-white">${stock.currentPrice.toFixed(2)}</h2>
            </div>
          </header>

          <div className="glass-card p-6 rounded-[2rem] h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stock.stats).map(([key, val]) => (
              <div key={key} className="glass-card p-4 rounded-2xl text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{key}</p>
                <p className="text-lg font-black text-white">{val}</p>
              </div>
            ))}
          </div>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-white">About {stock.companyName}</h2>
            <p className="text-slate-400 leading-relaxed font-medium">
              {stock.description}
            </p>
          </section>
        </div>

        {/* RIGHT: TRADING TERMINAL */}
        <aside className="space-y-8">
          <div className="glass-card p-8 rounded-[2.5rem] border-slate-800/50 sticky top-24">
            <h3 className="text-2xl font-black text-white mb-6">Trade Terminal</h3>
            
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Your Position</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl font-black text-white">{stock.ownedQuantity}</p>
                    <p className="text-xs font-medium text-slate-400">Shares Owned</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-emerald-400">${(stock.ownedQuantity * stock.currentPrice).toLocaleString()}</p>
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xl font-black text-white focus:border-emerald-500/50 outline-none transition-all"
                />
              </div>

              <div className="py-4 border-y border-slate-800/50 space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-400">Estimated Cost</span>
                  <span className="text-white">${(quantity * stock.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
                  className="flex-1 btn-primary py-4 rounded-2xl text-lg disabled:opacity-50"
                >
                  {trading ? "..." : "BUY"}
                </button>
                <button
                  disabled={trading || stock.ownedQuantity < quantity}
                  onClick={() => handleTrade("SELL")}
                  className="flex-1 btn-secondary py-4 rounded-2xl text-lg disabled:opacity-50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
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
      </div>
      </div>
    </>
  );
}

export default StockDetails;
