// frontend/src/components/ai/AITradeSignals.jsx

import { useState } from "react";

function AITradeSignals({ signals = [] }) {
  const [showAll, setShowAll] = useState(false);

  const getSignalStyle = (signal) => {
    if (!signal) return { text: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" };
    if (signal.includes("BUY"))  return { text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
    if (signal.includes("SELL")) return { text: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" };
    return { text: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" };
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 75) return "text-emerald-400";
    if (conf >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getConfidenceBar = (conf) => {
    if (conf >= 75) return "bg-emerald-400";
    if (conf >= 50) return "bg-yellow-400";
    return "bg-red-400";
  };

  const displayedSignals = showAll ? signals : signals.slice(0, 2);

  return (
    <div className="glass-card rounded-[2rem] border border-white/5 p-7 overflow-hidden relative">

      {/* GLOW */}
      <div className="absolute top-0 left-0 w-52 h-52 bg-emerald-500/10 blur-[120px]" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-2">
            Institutional Signal Engine
          </p>
          <h2 className="text-2xl font-black text-white">
            AI Trade Signals
          </h2>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
          ⚡
        </div>
      </div>

      {/* SIGNALS */}
      <div className="space-y-5 relative z-10">
        {signals.length > 0 ? (
          <>
            {displayedSignals.map((stock, index) => {
              const style = getSignalStyle(stock.signal);
              const conf  = stock.confidence || 0;

              return (
                <div
                  key={index}
                  className="rounded-[1.8rem] border border-white/5 bg-slate-900/40 p-6 hover:border-emerald-500/20 transition-all duration-300"
                >
                  {/* TOP ROW */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-white">
                        {stock.symbol}
                      </h3>
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-black mt-1">
                        Confidence {conf}%
                      </p>
                    </div>
                    <div className={`px-5 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${style.bg} ${style.text}`}>
                      {stock.signal}
                    </div>
                  </div>

                  {/* CONFIDENCE BAR */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Signal Strength</span>
                      <span className={`text-xs font-black ${getConfidenceColor(conf)}`}>{conf}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${getConfidenceBar(conf)}`}
                        style={{ width: `${conf}%` }}
                      />
                    </div>
                  </div>

                  {/* REASONING */}
                  {stock.reasoning && (
                    <div className="mb-3 rounded-2xl bg-black/20 border border-white/5 p-4">
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-black mb-1">Reasoning</p>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">{stock.reasoning}</p>
                    </div>
                  )}

                  {/* RSI + SENTIMENT CONTEXT */}
                  <div className="grid grid-cols-2 gap-3">
                    {stock.rsiContext && (
                      <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">RSI Context</p>
                        <p className="text-xs text-yellow-300 font-medium">{stock.rsiContext}</p>
                      </div>
                    )}
                    {stock.sentimentContext && (
                      <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-3">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Sentiment</p>
                        <p className="text-xs text-indigo-300 font-medium">{stock.sentimentContext}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {signals.length > 2 && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-6 py-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-400 font-bold text-xs uppercase tracking-widest hover:bg-emerald-500/10 hover:border-emerald-500/60 transition-all"
                >
                  {showAll ? "Show Less" : `View All ${signals.length} Signals`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[1.8rem] border border-white/5 bg-slate-900/40 p-10 text-center text-slate-400 font-medium">
            No trade signals available. Add stocks to your portfolio to see AI signals.
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-8 rounded-[1.5rem] border border-white/5 bg-black/20 p-5 relative z-10">
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          Signals generated using:{" "}
          <span className="text-white font-bold">
            RSI divergence, momentum velocity, sentiment fusion, and AI portfolio analysis.
          </span>
        </p>
      </div>
    </div>
  );
}

export default AITradeSignals;