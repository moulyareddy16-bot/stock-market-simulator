import { useEffect, useState } from "react";
import api from "../service/api";
import { TableSkeleton } from "./Skeleton";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { Link } from "react-router-dom";
import CoinIcon from "./CoinIcon";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const res = await api.get("/portfolio");
        setPortfolio(res.data.payload || []);
        setSummary(res.data.summary || null);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load portfolio");
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  const donutData = {
    labels: portfolio.map(s => s.stockSymbol),
    datasets: [{
      data: portfolio.map(s => s.currentValue),
      backgroundColor: [
        'rgba(16, 185, 129, 0.6)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(249, 115, 22, 0.6)',
        'rgba(139, 92, 246, 0.6)',
        'rgba(236, 72, 153, 0.6)',
      ],
      borderColor: '#020617',
      borderWidth: 4,
    }]
  };

  const growthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      fill: true,
      label: 'Portfolio Value',
      data: [10000, 10500, 10200, 11000, 11800, (summary?.totalCurrentValue || 0) + 10000],
      borderColor: '#10b981',
      borderWidth: 3,
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.5,
    }]
  };

  if (loading) return <div className="space-y-10"><TableSkeleton rows={8} /></div>;
  if (error) return <div className="glass-card p-10 text-red-400 font-bold rounded-3xl text-center">{error}</div>;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header className="mb-4">
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight pb-1">Your Portfolio</h1>
        <p className="text-slate-400 mt-2 font-medium">Detailed breakdown of your virtual investments</p>
      </header>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { 
            label: "Finnova Credits", 
            value: summary?.walletBalance, 
            isCredits: true, 
            bgStyle: "from-amber-500/10 via-transparent to-transparent border-amber-500/20 hover:border-amber-500/40 shadow-amber-500/5",
            glowColor: "bg-amber-500/10"
          },
          { 
            label: "Total Spent", 
            value: summary?.totalInvestment, 
            bgStyle: "from-blue-500/10 via-transparent to-transparent border-blue-500/20 hover:border-blue-500/40 shadow-blue-500/5",
            glowColor: "bg-blue-500/10"
          },
          { 
            label: "Market Value", 
            value: summary?.totalCurrentValue, 
            bgStyle: "from-emerald-500/10 via-transparent to-transparent border-emerald-500/20 hover:border-emerald-500/40 shadow-emerald-500/5",
            glowColor: "bg-emerald-500/10"
          }
        ].map((item, i) => (
          <div key={i} className={`glass-card p-8 rounded-[2rem] relative overflow-hidden group border bg-gradient-to-br transition-all hover:-translate-y-1 shadow-xl ${item.bgStyle}`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
            <div className="flex items-end justify-between">
              <h3 className={`text-3xl font-black flex items-center ${item.highlight ? (item.value >= 0 ? "text-emerald-400" : "text-red-400") : "text-white"}`}>
                {item.isCredits ? (
                  <CoinIcon className="w-6 h-6 mr-2 text-amber-400 drop-shadow-md" />
                ) : (
                  <span className="mr-1 opacity-70">$</span>
                )}
                {(item.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity ${item.glowColor}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* GROWTH CHART */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] space-y-6">
          <h2 className="text-xl font-black text-white">Growth Analysis</h2>
          <div className="h-[300px]">
            <Line data={growthData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false, drawBorder: false } }, y: { grid: { color: 'rgba(30, 41, 59, 0.4)', drawBorder: false } } } }} />
          </div>
        </div>

        {/* ASSET ALLOCATION */}
        <div className="glass-card p-8 rounded-[2.5rem] flex flex-col">
          <h2 className="text-xl font-black text-white mb-8">Asset Allocation</h2>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* CHART AREA */}
            <div className="relative w-full max-w-[260px] aspect-square flex items-center justify-center">
              <Doughnut 
                data={donutData} 
                options={{ 
                  cutout: '82%', 
                  plugins: { 
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#0f172a',
                      titleFont: { size: 14, weight: 'bold' },
                      bodyFont: { size: 13 },
                      padding: 12,
                      cornerRadius: 12,
                      displayColors: true,
                      callbacks: {
                        label: (context) => {
                          const value = context.raw;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return ` $${value.toLocaleString()} (${percentage}%)`;
                        }
                      }
                    }
                  } 
                }} 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total P/L</p>
                <p className={`text-4xl font-black flex items-center tracking-tighter ${summary?.totalProfit >= 0 ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" : "text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.3)]"}`}>
                  {summary?.totalProfit < 0 ? "-" : ""}${Math.abs(summary?.totalProfit || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <div className={`w-8 h-1 rounded-full mt-2 ${summary?.totalProfit >= 0 ? "bg-emerald-500/30" : "bg-red-500/30"}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOLDINGS TABLE */}
      <section className="glass-card rounded-[2.5rem] overflow-hidden border-slate-800/50">
        <div className="p-8 border-b border-slate-800/50">
          <h2 className="text-xl font-black text-white">Current Holdings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Quantity</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Avg Price</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Current Price</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Profit / Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {portfolio.length === 0 ? (
                <tr>
                  <td className="px-8 py-10 text-center text-slate-500 font-medium" colSpan="5">
                    No active positions. <Link to="/stocks" className="text-emerald-400 hover:underline">Start trading</Link>
                  </td>
                </tr>
              ) : (
                portfolio.map((stock) => (
                  <tr key={stock.stockSymbol} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-white text-xs group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                          {stock.stockSymbol[0]}
                        </div>
                        <div>
                          <p className="font-black text-white uppercase">{stock.stockSymbol}</p>
                          <p className="text-xs font-medium text-slate-500">Equity Position</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-white">{stock.ownedQuantity}</td>
                    <td className="px-8 py-6 text-right font-medium text-slate-400">
                      ${stock.avgPrice?.toFixed(2)}
                    </td>
                    <td className="px-8 py-6 text-right font-black text-white">
                      ${stock.currentPrice?.toFixed(2)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className={`font-black ${stock.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {stock.profitLoss >= 0 ? "+" : "-"}${Math.abs(stock.profitLoss || 0).toFixed(2)}
                      </div>
                      <div className={`text-[10px] font-bold ${stock.profitLoss >= 0 ? "text-emerald-500/50" : "text-red-500/50"}`}>
                        {stock.profitPercent?.toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Portfolio;
