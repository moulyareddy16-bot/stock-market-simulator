import { useEffect, useState } from "react";
import api from "../../service/api";

function AIWatchlistInsights({ watchlist: propWatchlist }) {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // If parent passed watchlist data (from portfolio AI analysis), use it directly
    if (propWatchlist && propWatchlist.length > 0) {
      setWatchlist(propWatchlist);
      setLoading(false);
      return;
    }
    // Otherwise fetch from dedicated endpoint
    fetchInsights();
  }, [propWatchlist]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ai/watchlist-insights", { withCredentials: true });
      setWatchlist(res?.data?.payload || []);
    } catch (err) {
      console.error("Watchlist AI error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentStyle = (sentiment) => {
    if (sentiment?.includes("BUY") || sentiment === "BULLISH") {
      return { text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
    }
    if (sentiment?.includes("SELL") || sentiment?.includes("VOLATILE")) {
      return { text: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
    }
    return { text: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" };
  };

  if (loading) {
    return (
      <div className="glass-card rounded-[2rem] border border-white/5 p-7 h-full">
        <div className="animate-pulse space-y-5">
          <div className="h-8 w-56 bg-slate-800 rounded-xl" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-[1.5rem] bg-slate-900/50" />
          ))}
        </div>
      </div>
    );
  }

  const displayedWatchlist = showAll ? watchlist : watchlist.slice(0, 2);

  return (
    <div className="glass-card rounded-[2rem] border border-white/5 p-7 h-[450px] overflow-hidden relative flex flex-col">

      {/* GLOW */}
      <div className="absolute right-0 top-0 w-56 h-56 bg-indigo-500/10 blur-[120px]" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 relative z-10 shrink-0">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-2">
            AI Watchlist Scanner
          </p>
          <h2 className="text-2xl font-black text-white">
            Watchlist Insights
          </h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg">
          👁️
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 space-y-5">
        {watchlist.length > 0 ? (
          <>
            {watchlist.map((stock, index) => {
              const style = getSentimentStyle(stock.sentiment);
              return (
                <div
                  key={index}
                  className="rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-5 hover:border-indigo-500/20 transition-all duration-300"
                >
                  {/* TOP */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-black text-white">
                        {stock.symbol}
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mt-0.5">
                        Signal: {stock.signal || "WATCH"}
                      </p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.text}`}>
                      {stock.sentiment}
                    </div>
                  </div>

                  {/* INSIGHT */}
                  <div className="rounded-xl bg-black/20 border border-white/5 p-4">
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {stock.reason || stock.reasoning || "No reasoning available."}
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 p-8 text-center text-slate-400 font-medium text-sm">
            Add stocks to your watchlist to activate AI monitoring.
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4 relative z-10 shrink-0">
        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
          Powered by: <span className="text-white font-bold">RSI, volatility clustering, and institutional flow.</span>
        </p>
      </div>
    </div>
  );
}

export default AIWatchlistInsights;
