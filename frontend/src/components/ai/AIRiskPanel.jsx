// frontend/src/components/ai/AIRiskPanel.jsx

function AIRiskPanel({ riskData }) {
  const {
    level = "N/A",
    score = 0,
    concentrationRisk = "N/A",
    warning = "",
    warnings: propWarnings = [],
  } = riskData || {};

  const overallRisk = level;
  const volatility = score;
  const warnings = propWarnings.length > 0 ? propWarnings : (warning ? [warning] : []);

  const riskColor =
    overallRisk === "LOW"
      ? "text-emerald-400"
      : overallRisk === "HIGH"
      ? "text-red-400"
      : "text-yellow-400";

  const riskBg =
    overallRisk === "LOW"
      ? "bg-emerald-500/10 border-emerald-500/20"
      : overallRisk === "HIGH"
      ? "bg-red-500/10 border-red-500/20"
      : "bg-yellow-500/10 border-yellow-500/20";

  return (
    <div className="glass-card rounded-[2rem] border border-white/5 p-7 h-full">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-2">
            Risk Engine
          </p>

          <h2 className="text-2xl font-black text-white">
            Portfolio Risk
          </h2>
        </div>

        <div
          className={`px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider ${riskBg} ${riskColor}`}
        >
          {overallRisk}
        </div>
      </div>

      {/* VOLATILITY */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-400 font-semibold">
            Volatility Index
          </span>

          <span className={`font-black ${riskColor}`}>
            {volatility}%
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              volatility > 70
                ? "bg-red-500"
                : volatility > 40
                ? "bg-yellow-400"
                : "bg-emerald-400"
            }`}
            style={{ width: `${volatility}%` }}
          />
        </div>
      </div>

      {/* CONCENTRATION */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-semibold">
            Concentration Risk
          </span>

          <span className="text-white font-black">
            {concentrationRisk}
          </span>
        </div>
      </div>

      {/* WARNINGS */}
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-red-400 mb-4">
          Risk Warnings
        </h3>

        <div className="space-y-3">
          {warnings.length > 0 ? (
            warnings.map((warning, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl border border-red-500/10 bg-red-500/5"
              >
                <div className="flex gap-3 items-start">
                  <div className="text-lg">⚠️</div>

                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {warning}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-sm text-emerald-300 font-semibold">
                No major portfolio risks detected currently.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIRiskPanel;