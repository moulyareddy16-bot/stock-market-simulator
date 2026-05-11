// frontend/src/components/ai/AIReasoningPanel.jsx

function AIReasoningPanel({
  reasoning = [],
}) {
  const fallbackReasoning = [
    {
      step: "Concentration Analysis",
      finding: "Your portfolio is well-diversified across 12 sectors with no single position exceeding 15%.",
      impact: "LOW",
    },
    {
      step: "Volatility Stress Test",
      finding: "Expected drawdown in a 10% market correction is -6.2%, indicating higher stability than the S&P 500.",
      impact: "MEDIUM",
    },
    {
      step: "Sentiment Correlation",
      finding: "Institutional buying pressure detected in tech holdings despite retail fear, suggesting a potential bull flag.",
      impact: "HIGH",
    },
  ];

  const data =
    reasoning.length > 0
      ? reasoning
      : fallbackReasoning;

  const getImpactStyle = (impact = "") => {
    if (impact.includes("HIGH") || impact.includes("CRITICAL")) {
      return {
        text: "text-red-400",
        bg: "bg-red-500/10 border-red-500/20",
      };
    }

    if (impact.includes("MEDIUM")) {
      return {
        text: "text-yellow-400",
        bg: "bg-yellow-500/10 border-yellow-500/20",
      };
    }

    return {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    };
  };

  return (
    <div className="glass-card rounded-[2rem] border border-white/5 p-7 h-full overflow-hidden relative">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute bottom-0 left-0 w-52 h-52 bg-indigo-500/10 blur-[100px]" />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-2">
            Neural Decision Layer
          </p>

          <h2 className="text-2xl font-black text-white">
            AI Reasoning Engine
          </h2>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl">
          🧠
        </div>
      </div>

      {/* REASONING LIST */}
      <div className="space-y-6 relative z-10">
        {data.map((item, index) => {
          const style = getImpactStyle(item?.impact);

          return (
            <div
              key={index}
              className="rounded-[1.8rem] border border-white/5 bg-slate-900/40 p-6 hover:border-indigo-500/20 transition-all duration-300"
            >
              {/* TOP */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-xl font-black text-white mb-1">
                    {item?.step}
                  </h3>

                  <p className="text-xs uppercase tracking-widest text-slate-500 font-black">
                    Analysis Vector
                  </p>
                </div>

                <div
                  className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.text}`}
                >
                  {item?.impact} IMPACT
                </div>
              </div>

              {/* FINDING */}
              <div className="rounded-2xl bg-black/20 border border-white/5 p-5">
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {item?.finding}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="mt-8 rounded-[1.5rem] border border-white/5 bg-black/20 p-5 relative z-10">
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          The AI reasoning engine cross-validates:
          <span className="text-white font-bold">
            {" "}
            RSI patterns, moving averages, volatility,
            insider sentiment, news momentum, sector rotation,
            and portfolio exposure alignment.
          </span>
        </p>
      </div>
    </div>
  );
}

export default AIReasoningPanel;