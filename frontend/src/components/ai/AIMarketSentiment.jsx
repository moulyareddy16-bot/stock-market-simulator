// frontend/src/components/ai/AIMarketSentiment.jsx

function AIMarketSentiment({ sentimentData }) {
  const data = sentimentData || {};


  const getColor = (score) => {
    if (score >= 75) return "text-emerald-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getBar = (score) => {
    if (score >= 75) return "bg-emerald-400";
    if (score >= 50) return "bg-yellow-400";
    return "bg-red-400";
  };

  return (
    <div className="glass-card rounded-[2rem] border border-white/5 p-7 h-full relative overflow-hidden">
      {/* BACKGROUND EFFECT */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[120px] rounded-full" />

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-2">
            Institutional Market Intelligence
          </p>

          <h2 className="text-2xl font-black text-white">
            Market Sentiment
          </h2>
        </div>

        <div
          className={`px-5 py-3 rounded-2xl border text-sm font-black uppercase tracking-widest ${
            (data.overall || data.label) === "BULLISH"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {data.overall || data.label || "NEUTRAL"}
        </div>
      </div>

      {/* TOP METRICS */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl bg-black/20 border border-white/5 p-5">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-black mb-2">
            Fear & Greed
          </p>

          <h3 className="text-4xl font-black text-emerald-400">
            {data.fearGreedIndex || data.score || 50}
          </h3>
        </div>

        <div className="rounded-2xl bg-black/20 border border-white/5 p-5">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-black mb-2">
            Volatility Index
          </p>

          <h3 className="text-4xl font-black text-yellow-400">
            {data.volatilityIndex || "N/A"}
          </h3>
        </div>
      </div>

      {/* INSTITUTIONAL VS RETAIL */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-5">
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-black mb-2">
            Institutional Bias
          </p>

          <h3 className="text-2xl font-black text-white">
            {data.institutionalBias || "N/A"}
          </h3>
        </div>

        <div className="rounded-2xl border border-yellow-500/10 bg-yellow-500/5 p-5">
          <p className="text-xs uppercase tracking-widest text-yellow-400 font-black mb-2">
            Retail Bias
          </p>

          <h3 className="text-2xl font-black text-white">
            {data.retailBias || "N/A"}
          </h3>
        </div>
      </div>

      {/* SECTOR ANALYSIS */}
      <div className="relative z-10">
        <h3 className="text-sm uppercase tracking-widest text-slate-400 font-black mb-5">
          Sector Strength Analysis
        </h3>

        <div className="space-y-5">
          {(data.sectors || []).map((sector, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-white font-black">
                    {sector.name}
                  </h4>

                  <p className={`text-xs font-black ${getColor(sector.score)}`}>
                    {sector.sentiment}
                  </p>
                </div>

                <span
                  className={`text-lg font-black ${getColor(sector.score)}`}
                >
                  {sector.score}
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getBar(
                    sector.score
                  )}`}
                  style={{
                    width: `${sector.score}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AIMarketSentiment;