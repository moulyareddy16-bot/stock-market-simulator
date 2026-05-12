// frontend/src/components/ai/AITradeSignals.jsx

function AITradeSignals({
  signals = [],
}) {
  const data = signals;


  const getSignalStyle = (signal) => {
    if (signal.includes("BUY")) {
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/20",
      };
    }

    if (signal.includes("SELL")) {
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

  const getRSIColor = (rsi) => {
    if (rsi <= 30) return "text-emerald-400";
    if (rsi >= 70) return "text-red-400";
    return "text-yellow-400";
  };

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
      <div className="space-y-6 relative z-10">
        {data.length > 0 ? (
          data.map((stock, index) => {
            const style = getSignalStyle(stock.signal);

            return (
              <div
                key={index}
                className="rounded-[1.8rem] border border-white/5 bg-slate-900/40 p-6 hover:border-emerald-500/20 transition-all duration-300"
              >
                {/* TOP */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-white">
                      {stock.symbol}
                    </h3>

                    <p className="text-xs uppercase tracking-widest text-slate-500 font-black mt-1">
                      Confidence {stock.confidence}%
                    </p>
                  </div>

                  <div
                    className={`px-5 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${style.bg} ${style.text}`}
                  >
                    {stock.signal}
                  </div>
                </div>

                {/* TREND */}
                <div className="mb-6 rounded-2xl bg-black/20 border border-white/5 p-4">
                  <p className="text-sm text-slate-300 font-medium">
                    {stock.trend}
                  </p>
                </div>

                {/* METRICS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* ENTRY */}
                  <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-2">
                      Entry
                    </p>

                    <h4 className="text-xl font-black text-white">
                      ${stock.entry}
                    </h4>
                  </div>

                  {/* TARGET */}
                  <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-2">
                      Target
                    </p>

                    <h4 className="text-xl font-black text-emerald-400">
                      ${stock.target}
                    </h4>
                  </div>

                  {/* STOP LOSS */}
                  <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-2">
                      Stop Loss
                    </p>

                    <h4 className="text-xl font-black text-red-400">
                      ${stock.stopLoss}
                    </h4>
                  </div>

                  {/* RSI */}
                  <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-2">
                      RSI
                    </p>

                    <h4
                      className={`text-xl font-black ${getRSIColor(
                        stock.rsi
                      )}`}
                    >
                      {stock.rsi}
                    </h4>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[1.8rem] border border-white/5 bg-slate-900/40 p-10 text-center text-slate-400 font-medium">
            No trade signals available. Add stocks to your portfolio or watchlist to see AI signals.
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-8 rounded-[1.5rem] border border-white/5 bg-black/20 p-5 relative z-10">
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          Signals generated using:
          <span className="text-white font-bold">
            {" "}
            RSI divergence, moving average crossovers,
            institutional accumulation, momentum velocity,
            volume anomalies, and AI sentiment fusion.
          </span>
        </p>
      </div>
    </div>
  );
}

export default AITradeSignals;