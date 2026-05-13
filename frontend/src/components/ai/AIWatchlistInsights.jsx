import { useEffect, useState } from "react";
import api from "../../service/api";

function AIWatchlistInsights() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await api.get("/ai/watchlist-insights", { withCredentials: true });
      setWatchlist(res?.data?.payload || []);
    } catch (err) {
      console.error("Watchlist AI error:", err);
    } finally {
      setLoading(false);
    }
  };



  const getSentimentStyle = (
    sentiment
  ) => {
    if (
      sentiment?.includes("BUY") ||
      sentiment === "BULLISH"
    ) {
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/20",
      };
    }

    if (
      sentiment?.includes("SELL") ||
      sentiment?.includes("VOLATILE")
    ) {
      return {
        text: "text-red-400",
        bg: "bg-red-500/10 border-red-500/20",
      };
    }

    return {
      text: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    };
  };



  if (loading) {
    return (
      <div className="glass-card rounded-[2rem] border border-white/5 p-7 h-full">
        <div className="animate-pulse space-y-5">
          <div className="h-8 w-56 bg-slate-800 rounded-xl" />

          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-[1.5rem] bg-slate-900/50"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[2rem] border border-white/5 p-7 h-full overflow-hidden relative">

      {/* GLOW */}
      <div className="absolute right-0 top-0 w-56 h-56 bg-indigo-500/10 blur-[120px]" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-2">
            AI Watchlist Scanner
          </p>

          <h2 className="text-2xl font-black text-white">
            Watchlist Insights
          </h2>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl">
          👁️
        </div>
      </div>

      {/* EMPTY */}
      {watchlist.length === 0 && (
        <div className="rounded-[1.8rem] border border-dashed border-white/10 p-10 text-center relative z-10">
          <h3 className="text-xl font-black text-white mb-3">
            No Watchlist Data
          </h3>

          <p className="text-slate-400 font-medium">
            Add stocks to your watchlist
            to activate AI monitoring.
          </p>
        </div>
      )}

      {/* LIST */}
      <div className="space-y-5 relative z-10">
        {watchlist.map(
          (stock, index) => {
            const style =
              getSentimentStyle(
                stock.sentiment
              );

            return (
              <div
                key={index}
                className="rounded-[1.7rem] border border-white/5 bg-slate-900/40 p-6 hover:border-indigo-500/20 transition-all duration-300"
              >

                {/* TOP */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-3xl font-black text-white">
                      {stock.symbol}
                    </h3>

                    <p className="text-xs uppercase tracking-widest text-slate-500 font-black mt-1">
                      AI Confidence{" "}
                      {stock.confidence}%
                    </p>
                  </div>

                  <div
                    className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${style.bg} ${style.text}`}
                  >
                    {stock.sentiment}
                  </div>
                </div>

                {/* PRICE */}
                <div className="grid grid-cols-2 gap-4 mb-5">

                  <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-2">
                      Current Price
                    </p>

                    <h4 className="text-2xl font-black text-white">
                      $
                      {stock.currentPrice?.toFixed(
                        2
                      )}
                    </h4>
                  </div>

                  <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-2">
                      Predicted Move
                    </p>

                    <h4
                      className={`text-2xl font-black ${stock.predictedMove >
                        0
                        ? "text-emerald-400"
                        : "text-red-400"
                        }`}
                    >
                      {stock.predictedMove > 0
                        ? "+"
                        : ""}
                      {
                        stock.predictedMove
                      }
                      %
                    </h4>
                  </div>
                </div>

                {/* INSIGHT */}
                <div className="rounded-2xl bg-black/20 border border-white/5 p-5">
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {stock.reasoning}
                  </p>
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-8 rounded-[1.5rem] border border-white/5 bg-black/20 p-5 relative z-10">
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          Watchlist intelligence is powered by:
          <span className="text-white font-bold">
            {" "}
            real-time RSI, moving averages,
            volatility clustering, news
            sentiment, earnings reactions,
            and institutional flow analysis.
          </span>
        </p>
      </div>
    </div>
  );
}

export default AIWatchlistInsights;
