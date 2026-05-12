// frontend/src/components/ai/AIConfidenceMeter.jsx

function AIConfidenceMeter({
  confidence = 0,
  prediction = "N/A",
  risk = "N/A",
  volatility = 0,
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
    <div className="glass-card rounded-[2rem] border border-white/5 p-7 overflow-hidden relative h-full">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-[100px]" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-2">
            AI Probability Engine
          </p>

          <h2 className="text-2xl font-black text-white">
            Confidence Meter
          </h2>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl">
          🎯
        </div>
      </div>

      {/* MAIN CONFIDENCE */}
      <div className="relative z-10">
        <div className="flex items-end gap-4 mb-5">
          <h1 className={`text-7xl font-black ${style.text}`}>
            {confidence}
          </h1>

          <span className="text-2xl text-slate-500 font-black mb-3">
            %
          </span>
        </div>

        <p className="text-slate-300 text-lg font-semibold leading-relaxed mb-8">
          AI confidence for current market prediction:
          <span className={`ml-2 font-black ${style.text}`}>
            {prediction}
          </span>
        </p>

        {/* PROGRESS BAR */}
        <div className="w-full h-5 rounded-full bg-slate-900 overflow-hidden border border-white/5 mb-10">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${style.bg} transition-all duration-1000`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 gap-5 relative z-10">
        
        {/* VOLATILITY */}
        <div className="rounded-[1.5rem] bg-slate-900/50 border border-white/5 p-5">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-black mb-3">
            Volatility
          </p>

          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-black text-white">
              {volatility}
            </h3>

            <div
              className={`w-3 h-3 rounded-full ${
                volatility >= 60
                  ? "bg-red-400"
                  : volatility >= 35
                  ? "bg-yellow-400"
                  : "bg-emerald-400"
              }`}
            />
          </div>

          <p className="text-slate-400 text-sm mt-2">
            Market fluctuation index
          </p>
        </div>

        {/* RISK */}
        <div className="rounded-[1.5rem] bg-slate-900/50 border border-white/5 p-5">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-black mb-3">
            Risk Exposure
          </p>

          <h3
            className={`text-2xl font-black ${
              risk === "Low"
                ? "text-emerald-400"
                : risk === "Moderate"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {risk}
          </h3>

          <p className="text-slate-400 text-sm mt-2">
            Portfolio AI classification
          </p>
        </div>
      </div>

      {/* FOOTER INSIGHT */}
      <div className="mt-8 relative z-10 rounded-[1.5rem] border border-white/5 bg-black/20 p-5">
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          AI confidence combines:
          <span className="text-white font-bold">
            {" "}
            RSI trends, moving averages, news sentiment,
            volatility clusters, institutional flow,
            and historical trade behavior.
          </span>
        </p>
      </div>
    </div>
  );
}

export default AIConfidenceMeter;