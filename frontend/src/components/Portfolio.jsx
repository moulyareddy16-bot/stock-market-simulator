import { useEffect, useState } from "react";
import api from "../service/api";
import { TableSkeleton } from "./Skeleton";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { Link } from "react-router-dom";

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
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
    }]
  };

  if (loading) return <div className="space-y-10"><TableSkeleton rows={8} /></div>;
  if (error) return <div className="glass-card p-10 text-red-400 font-bold rounded-3xl text-center">{error}</div>;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header>
        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Your Portfolio</h1>
        <p className="text-slate-400 mt-1 font-medium">Detailed breakdown of your virtual investments</p>
      </header>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Investment", value: summary?.totalInvestment, icon: "💰" },
          { label: "Current Value", value: summary?.totalCurrentValue, icon: "🏦" },
          { label: "Total Profit", value: summary?.totalProfit, icon: "📈", highlight: true }
        ].map((item, i) => (
          <div key={i} className="glass-card p-8 rounded-[2rem] relative overflow-hidden group">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
            <div className="flex items-end justify-between">
              <h3 className={`text-3xl font-black ${item.highlight ? (item.value >= 0 ? "text-emerald-400" : "text-red-400") : "text-white"}`}>
                ${(item.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <span className="text-2xl">{item.icon}</span>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* GROWTH CHART */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] space-y-6">
          <h2 className="text-xl font-black text-white">Growth Analysis</h2>
          <div className="h-[300px]">
            <Line data={growthData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { grid: { color: '#1e293b' } } } }} />
          </div>
        </div>

        {/* ASSET ALLOCATION */}
        <div className="glass-card p-8 rounded-[2.5rem] space-y-6 flex flex-col items-center">
          <h2 className="text-xl font-black text-white self-start">Asset Allocation</h2>
          <div className="w-full max-w-[200px] aspect-square">
            <Doughnut data={donutData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Profit / Loss</p>
              <p
                className={`mt-2 text-2xl font-semibold ${summary.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
              >
                ${summary.totalProfit?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
          <div className="w-full space-y-2 mt-4">
            {portfolio.slice(0, 3).map((s, i) => (
              <div key={s.stockSymbol} className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 uppercase tracking-wider">{s.stockSymbol}</span>
                <span className="text-white">{((s.currentValue / summary.totalCurrentValue) * 100).toFixed(1)}%</span>
              </div>
            ))}
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
                  <tr key={stock.stockSymbol} className="hover:bg-white/5 transition-colors group">
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
                    <td className="px-8 py-6 text-right font-medium text-slate-400">${stock.avgPrice?.toFixed(2)}</td>
                    <td className="px-8 py-6 text-right font-black text-white">${stock.currentPrice?.toFixed(2)}</td>
                    <td className="px-8 py-6 text-right">
                      <div className={`font-black ${stock.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {stock.profitLoss >= 0 ? "+" : ""}${stock.profitLoss?.toFixed(2)}
                      </div>
                      <div className={`text-[10px] font-bold ${stock.profitLoss >= 0 ? "text-emerald-500/50" : "text-red-500/50"}`}>
                        {stock.profitPercent?.toFixed(2)}%
                      </div>
                  <tr key={stock.stockSymbol} className="border-t border-slate-800">
                    <td className="p-4 font-semibold">{stock.stockSymbol}</td>
                    <td className="p-4">{stock.ownedQuantity}</td>
                    <td className="p-4">${stock.avgPrice?.toFixed(2)}</td>
                    <td className="p-4">${stock.currentPrice?.toFixed(2)}</td>
                    <td
                      className={`p-4 ${stock.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                    >
                      ${stock.profitLoss?.toFixed(2)} ({stock.profitPercent?.toFixed(2)}%)
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