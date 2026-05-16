// frontend/src/components/ai/AIConfidenceMeter.jsx

function AIConfidenceMeter({
  confidence = 0,
  prediction = "N/A",
  risk = "N/A",
  volatility = 0,
  fearGreedIndex = 50,
}) {
  const getConfidenceColor = () => {
    if (confidence >= 80) {
      return {
        text: "text-emerald-400",
        bg: "from-emerald-500 to-green-400",
        glow: "shadow-emerald-500/20",
      };
    }

    if (confidence >= 60) {
      return {
        text: "text-yellow-400",
        bg: "from-yellow-500 to-orange-400",
        glow: "shadow-yellow-500/20",
      };
    }

    return {
      text: "text-red-400",
      bg: "from-red-500 to-rose-400",
      glow: "shadow-red-500/20",
    };
  };

  const style = getConfidenceColor();

  return (
    <div className="glass-card rounded-[2rem] border border-white/5 p-7 overflow-hidden relative h-[450px] flex flex-col">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-[100px]" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 relative z-10 shrink-0">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-2">
            AI Probability Engine
          </p>

          <h2 className="text-2xl font-black text-white">
            Confidence Meter
          </h2>
        </div>

        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg">
          🎯
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* MAIN CONFIDENCE */}
        <div className="mb-8">
          <div className="flex items-end gap-3 mb-4">
            <h1 className={`text-6xl font-black ${style.text}`}>
              {confidence}
            </h1>

            <span className="text-xl text-slate-500 font-black mb-2">
              %
            </span>
          </div>

          <p className="text-slate-300 text-base font-semibold leading-relaxed mb-4">
            AI confidence for current market prediction:
            <span className={`ml-2 font-black ${style.text}`}>
              {prediction}
            </span>
          </p>

          {/* PROGRESS BAR */}
          <div className="w-full h-4 rounded-full bg-slate-900 overflow-hidden border border-white/5 mb-6">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${style.bg} transition-all duration-1000`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          
          {/* FEAR & GREED */}
          <div className="rounded-xl bg-slate-900/50 border border-white/5 p-3">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black mb-1">
              Fear & Greed
            </p>

            <div className="flex items-center justify-between">
              <h3 className={`text-xl font-black ${fearGreedIndex >= 75 ? 'text-emerald-400' : fearGreedIndex >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {fearGreedIndex}
              </h3>
            </div>
            <p className="text-slate-500 text-[8px] uppercase font-black mt-1">Sentiment Score</p>
          </div>

          {/* VOLATILITY */}
          <div className="rounded-xl bg-slate-900/50 border border-white/5 p-3">
            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-black mb-1">
              Volatility
            </p>

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white">
                {volatility}%
              </h3>

              <div
                className={`w-2 h-2 rounded-full ${
                  volatility >= 60
                    ? "bg-red-400"
                    : volatility >= 35
                    ? "bg-yellow-400"
                    : "bg-emerald-400"
                }`}
              />
            </div>
            <p className="text-slate-500 text-[8px] uppercase font-black mt-1">Fluctuation</p>
          </div>
        </div>

        {/* FOOTER INSIGHT */}
        <div className="rounded-xl border border-white/5 bg-black/20 p-4">
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            <span className="text-white font-bold">Portfolio Risk: {risk}</span>. AI combines RSI, news sentiment, and volatility clusters.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIConfidenceMeter;