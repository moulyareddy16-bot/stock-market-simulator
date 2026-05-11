// frontend/src/components/ai/AICommandCenter.jsx

import { useEffect, useState } from "react";
import api from "../../service/api";

import AISummaryCard from "./AISummaryCard";
import AITradeSignals from "./AITradeSignals";
import AIRiskPanel from "./AIRiskPanel";
import AIPortfolioScore from "./AIPortfolioScore";
import AIMarketSentiment from "./AIMarketSentiment";
import AIReasoningPanel from "./AIReasoningPanel";
import AIConfidenceMeter from "./AIConfidenceMeter";
import AIWatchlistInsights from "./AIWatchlistInsights";
import AIChatPanel from "./AIChatPanel";

function AICommandCenter() {

  const [loading, setLoading] = useState(true);

  const [aiData, setAiData] = useState({
    executiveSummary:
      "AI engine is analyzing your portfolio and market conditions...",

    traderScore: 0,

    confidenceScore: 0,

    marketSentiment: {
      label: "NEUTRAL",
      score: 50,
    },

    portfolioScore: {
      diversification: 0,
      riskAdjusted: 0,
      concentration: "LOW",
    },

    riskAnalysis: {
      level: "Moderate",
      warning:
        "Risk engine initializing...",
    },

    tradeSignals: [],

    watchlist: [],

    reasoning: [],
  });

  const [error, setError] = useState("");

  useEffect(() => {

    const fetchAI = async () => {

      try {

        setLoading(true);

        const res = await api.get("/ai/suggestions");

        if (res?.data?.payload) {
          setAiData(res.data.payload);
        }

      } catch (err) {

        console.error(err);

        setError(
          "Institutional AI engine temporarily unavailable."
        );

      } finally {

        setLoading(false);

      }
    };

    fetchAI();

  }, []);

  if (loading || !aiData) {
    return (
      <div className="min-h-screen bg-[#050816] p-6 lg:p-10">
        <div className="animate-pulse space-y-6">

          <div className="h-40 rounded-[2rem] bg-slate-900/60" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-[2rem] bg-slate-900/60"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-[2rem] bg-slate-900/60"
              />
            ))}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white p-6 lg:p-10 pb-32">

      {/* PAGE HEADER */}
      <div className="mb-10">

        <div className="flex items-center gap-3 mb-4">

          <div className="px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-[0.25em] uppercase">
            Institutional AI
          </div>

          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

        </div>

        <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-4">
          Alpha Insight Engine
        </h1>

        <p className="text-slate-400 max-w-3xl text-lg leading-relaxed">
          Real-time portfolio intelligence, AI trade signals,
          risk analysis, and institutional-grade market reasoning.
        </p>

      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-3xl p-6 text-red-300 font-semibold">
          {error}
        </div>
      )}

      {/* TOP GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">

        <AIPortfolioScore
          portfolioScore={aiData.portfolioScore}
        />

        <AIConfidenceMeter
          confidence={aiData?.confidenceScore}
          prediction={aiData?.marketSentiment?.reasoning || "Analyzing market velocity..."}
          risk={aiData?.riskAnalysis?.level}
          volatility={aiData?.riskAnalysis?.score || 45}
        />

        <AIMarketSentiment
          sentimentData={aiData?.marketSentiment}
        />

        <AIRiskPanel
          riskData={aiData?.riskAnalysis}
        />

      </div>

      {/* EXECUTIVE SUMMARY */}
      <div className="mb-6">
        <AISummaryCard
          summary={aiData.executiveSummary}
          traderScore={aiData.traderScore}
        />
      </div>

      {/* SIGNALS + REASONING */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        <AITradeSignals
          signals={aiData.tradeSignals}
        />

        <AIReasoningPanel
          reasoning={aiData.reasoning}
        />

      </div>

      {/* WATCHLIST */}
      <div className="mb-10">
        <AIWatchlistInsights
          watchlist={aiData.watchlist}
        />
      </div>

      {/* FLOATING CHAT */}
      <AIChatPanel />

    </div>
  );
}

export default AICommandCenter;