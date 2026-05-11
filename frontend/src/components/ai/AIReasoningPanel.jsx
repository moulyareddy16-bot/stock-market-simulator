// frontend/src/components/ai/AIReasoningPanel.jsx

function AIReasoningPanel({
  reasoning = [],
}) {
  const fallbackReasoning = [
    {
      ticker: "AAPL",
      action: "BUY",
      confidence: 91,
      reason:
        "RSI recovered from oversold territory while institutional accumulation increased over the last 3 sessions.",
      sentiment: 0.82,
      horizon: "Long Term",
    },
    {
      ticker: "TSLA",
      action: "HOLD",
      confidence: 73,
      reason:
        "Price momentum remains positive but weakening sentiment indicates possible short-term consolidation risk.",
      sentiment: 0.41,
      horizon: "Swing Trade",
    },
    {
      ticker: "NVDA",
      action: "STRONG BUY",
      confidence: 95,
      reason:
        "AI models detect sustained bullish momentum supported by earnings growth and semiconductor demand expansion.",
      sentiment: 0.91,
      horizon: "Growth",
    },
  ];

  const data =
    reasoning.length > 0
      ? reasoning
      : fallbackReasoning;

  const getActionStyle = (action) => {
    if (action.includes("BUY")) {
      return {
        text: "text-emerald-400",
        bg: "bg-emerald-500/10 border-emerald-500/20",
      };
    }

    if (action.includes("SELL")) {
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
          const style = getActionStyle(item.action);

          return (
            <div
              key={index}
              className="rounded-[1.8rem] border border-white/5 bg-slate-900/40 p-6 hover:border-indigo-500/20 transition-all duration-300"
            >
              {/* TOP */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-3xl font-black text-white mb-1">
                    {item.ticker}
                  </h3>

                  <p className="text-xs uppercase tracking-widest text-slate-500 font-black">
                    AI Confidence {item.confidence}%
                  </p>
                </div>

                <div
                  className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest ${style.bg} ${style.text}`}
                >
                  {item.action}
                </div>
              </div>

              {/* REASON */}
              <div className="rounded-2xl bg-black/20 border border-white/5 p-5 mb-5">
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  {item.reason}
                </p>
              </div>

              {/* METRICS */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* SENTIMENT */}
                <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-2">
                    Sentiment Score
                  </p>

                  <div className="flex items-center justify-between">
                    <h4 className="text-2xl font-black text-white">
                      {(item.sentiment * 100).toFixed(0)}
                    </h4>

                    <span className="text-slate-500 font-black">
                      /100
                    </span>
                  </div>
                </div>

                {/* HORIZON */}
                <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black mb-2">
                    Time Horizon
                  </p>

                  <h4 className="text-xl font-black text-indigo-400">
                    {item.horizon}
                  </h4>
                </div>
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