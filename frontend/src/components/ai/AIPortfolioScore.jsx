// frontend/src/components/ai/AIPortfolioScore.jsx

function AIPortfolioScore({ portfolioScore }) {
  const {
    diversification = 0,
    riskAdjusted = 0,
  } = portfolioScore || {};

  const overall = Math.round((diversification + riskAdjusted) / 2) || 0;


  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressColor = (score) => {
    if (score >= 80) return "bg-emerald-400";
    if (score >= 60) return "bg-yellow-400";
    return "bg-red-400";
  };

  const metrics = [
    {
      title: "Diversification",
      value: diversification,
    },
    {
      title: "Risk Adjusted",
      value: riskAdjusted,
    },
  ];

  return (
    <div className="glass-card rounded-[2rem] border border-white/5 p-7 h-full relative overflow-hidden">
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-500/10 blur-[120px] rounded-full" />

      {/* HEADER */}
      <div className="relative z-10 flex items-start justify-between mb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-2">
            AI Portfolio Rating
          </p>

          <h2 className="text-2xl font-black text-white">
            Portfolio Score
          </h2>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border-[10px] border-slate-800 flex items-center justify-center">
            <div className="text-center">
              <h1
                className={`text-3xl font-black ${getScoreColor(overall)}`}
              >
                {overall}
              </h1>

              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-black">
                Score
              </p>
            </div>
          </div>

          {/* PROGRESS RING */}
          <svg
            className="absolute inset-0 -rotate-90"
            width="112"
            height="112"
          >
            <circle
              cx="56"
              cy="56"
              r="50"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
              fill="transparent"
            />

            <circle
              cx="56"
              cy="56"
              r="50"
              stroke="rgb(16 185 129)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={314}
              strokeDashoffset={314 - (314 * overall) / 100}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* METRICS */}
      <div className="relative z-10 space-y-5">
        {metrics.map((metric, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-300">
                {metric.title}
              </span>

              <span
                className={`text-sm font-black ${getScoreColor(metric.value)}`}
              >
                {metric.value}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${getProgressColor(
                  metric.value
                )}`}
                style={{
                  width: `${metric.value}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="relative z-10 mt-8 p-5 rounded-2xl border border-emerald-500/10 bg-emerald-500/5">
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          AI has evaluated your portfolio based on diversification,
          momentum strength, historical stability, and market positioning.
        </p>
      </div>
    </div>
  );
}

export default AIPortfolioScore;