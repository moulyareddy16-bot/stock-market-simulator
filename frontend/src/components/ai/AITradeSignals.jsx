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
    <div className="glass-card rounded-[2rem] border border-white/5 p-7 overflow-hidden relative h-[450px] flex flex-col">

      {/* GLOW */}
      <div className="absolute top-0 left-0 w-52 h-52 bg-emerald-500/10 blur-[120px]" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 relative z-10 shrink-0">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-2">
            Institutional Signal Engine
          </p>
          <h2 className="text-2xl font-black text-white">
            AI Trade Signals
          </h2>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg">
          ⚡
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10 space-y-5">
        {signals.length > 0 ? (
          <>
            {signals.map((stock, index) => {
              const style = getSignalStyle(stock.signal);
              const conf  = stock.confidence || 0;

              return (
                <div
                  key={index}
                  className="rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-5 hover:border-emerald-500/20 transition-all duration-300"
                >
                  {/* TOP ROW */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-black text-white">
                        {stock.symbol}
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mt-0.5">
                        Confidence {conf}%
                      </p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.text}`}>
                      {stock.signal}
                    </div>
                  </div>

                  {/* REASONING */}
                  {stock.reasoning && (
                    <div className="mb-3 rounded-xl bg-black/20 border border-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-1">Reasoning</p>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">{stock.reasoning}</p>
                    </div>
                  )}

                  {/* CONTEXT */}
                  <div className="grid grid-cols-2 gap-2">
                    {stock.rsiContext && (
                      <div className="rounded-xl bg-slate-950/60 border border-white/5 p-2.5">
                        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black mb-0.5">RSI</p>
                        <p className="text-[10px] text-yellow-300 font-medium">{stock.rsiContext}</p>
                      </div>
                    )}
                    {stock.sentimentContext && (
                      <div className="rounded-xl bg-slate-950/60 border border-white/5 p-2.5">
                        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black mb-0.5">Sentiment</p>
                        <p className="text-[10px] text-indigo-300 font-medium">{stock.sentimentContext}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="rounded-[1.5rem] border border-white/5 bg-slate-900/40 p-8 text-center text-slate-400 font-medium text-sm">
            No signals available.
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4 relative z-10 shrink-0">
        <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
          Powered by: <span className="text-white font-bold">RSI, momentum, and sentiment fusion.</span>
        </p>
      </div>
    </div>
  );
}

export default AITradeSignals;