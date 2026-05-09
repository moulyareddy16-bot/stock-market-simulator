import { useEffect, useState } from "react";
import api from "../service/api";
import Skeleton from "./Skeleton";

function AiSuggestions() {
  const [data, setData] = useState({
    summary: "AI Engine is analyzing your market data...",
    marketSentiment: "NEUTRAL",
    traderScore: 85,
    suggestions: [
      {
        type: "STRATEGY",
        title: "Diversification Edge",
        description: "AI suggests increasing exposure to Tech and Energy sectors to balance your current risk profile.",
        impact: "High"
      },
      {
        type: "OPPORTUNITY",
        title: "Market Entry Point",
        description: "Current RSI indicators suggest a strong buy zone for blue-chip stocks like IBM and AAPL.",
        impact: "Medium"
      }
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        console.log("Running AI Sync...");
        const response = await fetch("http://localhost:5000/api/ai/suggestions", {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
          },
          // CRITICAL: Send cookies to backend
          credentials: 'include' 
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const resData = await response.json();
        console.log("Sync Complete:", resData);
        if (resData?.payload) {
          setData(resData.payload);
        }
      } catch (err) {
        console.error("AI Sync Fail:", err);
        // Show the reason for the failure in the summary box
        setData(prev => ({
          ...prev,
          summary: `Sync status: Analysis paused (${err.message}). Using cached intelligence.`
        }));
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  if (loading) return (
    <div className="space-y-10 p-4 lg:p-0 animate-pulse">
      <div className="h-20 bg-slate-800/50 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-slate-800/50 rounded-[2rem]" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* HEADER */}
      <header className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 p-10 border border-white/5">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
              AI Powered
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Market Intelligence
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl font-medium leading-relaxed">
            {data?.summary}
          </p>
        </div>
        
        {/* DECORATIVE ELEMENTS */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full" />
      </header>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2rem] flex items-center justify-between group overflow-hidden relative">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Trader Score</p>
            <h2 className="text-5xl font-black text-white">{data?.traderScore}%</h2>
          </div>
          <div className="text-5xl opacity-80 group-hover:scale-110 transition duration-500 group-hover:opacity-100">📈</div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] flex items-center justify-between group overflow-hidden relative">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Market Sentiment</p>
            <h2 className="text-4xl font-black text-emerald-400 uppercase italic tracking-tighter">{data?.marketSentiment}</h2>
          </div>
          <div className="text-5xl opacity-80 group-hover:rotate-12 transition duration-500 group-hover:opacity-100">⚡</div>
        </div>

        <div className="glass-card p-8 rounded-[2rem] flex items-center justify-between group overflow-hidden relative bg-linear-to-br from-emerald-500/10 to-transparent">
          <div>
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Live Status</p>
            <h2 className="text-2xl font-black text-white uppercase">Operational</h2>
          </div>
          <div className="text-5xl animate-spin-slow opacity-80 group-hover:opacity-100">⚙️</div>
        </div>
      </div>

      {/* SUGGESTIONS GRID */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-white uppercase tracking-widest px-4 border-l-4 border-emerald-500">
          Strategic Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data?.suggestions.map((s, i) => (
            <div 
              key={i} 
              className="glass-card p-8 rounded-[2.5rem] border border-white/5 hover:border-emerald-500/30 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  s.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' :
                  s.type === 'SELL' ? 'bg-red-500/20 text-red-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {s.type}
                </div>
                <div className="text-[10px] font-black text-slate-500 uppercase">Impact: {s.impact}</div>
              </div>

              <h4 className="text-2xl font-black text-white mb-3 group-hover:text-emerald-400 transition-colors">
                {s.title}
              </h4>
              <p className="text-slate-400 font-medium leading-relaxed">
                {s.description}
              </p>

              {/* ACCENT LINE */}
              <div className="absolute bottom-0 left-0 h-1 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER NOTE */}
      <footer className="text-center p-10 border-t border-slate-800/50">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
          AI analysis is based on historical patterns and current market liquidity. Always trade responsibly.
        </p>
      </footer>
    </div>
  );
}

export default AiSuggestions;
