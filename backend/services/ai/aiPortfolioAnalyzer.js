import { generateStructuredJSON } from "./aiGeminiService.js";
import { buildAIPrompt } from "./aiPromptBuilder.js";
import { calculatePortfolioHealth } from "./portfolioAnalysisService.js";
import { calculateOverallSentiment } from "./sentimentService.js";

// ──────────────────────────────────────────────
// FALLBACK RESPONSE — returned if AI fails
// ──────────────────────────────────────────────
const FALLBACK_RESPONSE = {
    executiveSummary: "AI analysis engine is temporarily unavailable. Your portfolio data has been received and analysis will resume shortly.",
    marketSentiment: { label: "NEUTRAL", score: 50, reasoning: "Insufficient data for sentiment analysis." },
    traderScore: 50,
    confidenceScore: 0,
    riskAnalysis: { level: "MODERATE", warning: "Unable to generate risk assessment at this time.", concentrationRisk: "MEDIUM" },
    portfolioScore: { diversification: 0, riskAdjusted: 0, concentration: "MEDIUM" },
    tradeSignals: [],
    reasoning: [],
    watchlist: [],
    suggestions: [],
};

// ──────────────────────────────────────────────
// VALIDATE AI RESPONSE SCHEMA
// Prevents hallucinated types from reaching the frontend
// ──────────────────────────────────────────────
const validateAIResponse = (parsed) => {
    const VALID_SENTIMENTS = ["BULLISH", "NEUTRAL", "BEARISH"];
    const VALID_RISK_LEVELS = ["LOW", "MODERATE", "HIGH", "CRITICAL"];
    const VALID_CONCENTRATION = ["LOW", "MEDIUM", "HIGH"];
    const VALID_SIGNALS = ["BUY", "SELL", "HOLD"];
    const VALID_IMPACTS = ["HIGH", "MEDIUM", "LOW"];

    // Clamp integers to 0–100
    const clamp = (val) => Math.max(0, Math.min(100, Number(val) || 0));

    return {
        executiveSummary: String(parsed.executiveSummary || FALLBACK_RESPONSE.executiveSummary),
        marketSentiment: {
            label: VALID_SENTIMENTS.includes(parsed.marketSentiment?.label)
                ? parsed.marketSentiment.label : "NEUTRAL",
            score: clamp(parsed.marketSentiment?.score),
            reasoning: String(parsed.marketSentiment?.reasoning || ""),
        },
        traderScore: clamp(parsed.traderScore),
        confidenceScore: clamp(parsed.confidenceScore),
        riskAnalysis: {
            level: VALID_RISK_LEVELS.includes(parsed.riskAnalysis?.level)
                ? parsed.riskAnalysis.level : "MODERATE",
            warning: String(parsed.riskAnalysis?.warning || ""),
            concentrationRisk: VALID_CONCENTRATION.includes(parsed.riskAnalysis?.concentrationRisk)
                ? parsed.riskAnalysis.concentrationRisk : "MEDIUM",
        },
        portfolioScore: {
            diversification: clamp(parsed.portfolioScore?.diversification),
            riskAdjusted: clamp(parsed.portfolioScore?.riskAdjusted),
            concentration: VALID_CONCENTRATION.includes(parsed.portfolioScore?.concentration)
                ? parsed.portfolioScore.concentration : "MEDIUM",
        },
        tradeSignals: Array.isArray(parsed.tradeSignals)
            ? parsed.tradeSignals.map((s) => ({
                symbol: String(s.symbol || ""),
                signal: VALID_SIGNALS.includes(s.signal) ? s.signal : "HOLD",
                confidence: clamp(s.confidence),
                reasoning: String(s.reasoning || ""),
                rsiContext: String(s.rsiContext || ""),
                sentimentContext: String(s.sentimentContext || ""),
            }))
            : [],
        reasoning: Array.isArray(parsed.reasoning)
            ? parsed.reasoning.map((r) => ({
                step: String(r.step || ""),
                finding: String(r.finding || ""),
                impact: VALID_IMPACTS.includes(r.impact) ? r.impact : "MEDIUM",
            }))
            : [],
        watchlist: Array.isArray(parsed.watchlist)
            ? parsed.watchlist.map((w) => ({
                symbol: String(w.symbol || ""),
                signal: [...VALID_SIGNALS, "WATCH"].includes(w.signal) ? w.signal : "WATCH",
                reason: String(w.reason || ""),
                sentiment: VALID_SENTIMENTS.includes(w.sentiment) ? w.sentiment : "NEUTRAL",
            }))
            : [],
        suggestions: Array.isArray(parsed.suggestions)
            ? parsed.suggestions.map((s) => ({
                type: ["BUY", "SELL", "HOLD", "RISK_WARNING", "DIVERSIFY"].includes(s.type) ? s.type : "HOLD",
                title: String(s.title || ""),
                description: String(s.description || ""),
                impact: VALID_IMPACTS.includes(s.impact) ? s.impact : "MEDIUM",
            }))
            : [],
    };
};

// ──────────────────────────────────────────────
// MAIN ANALYZER
// ──────────────────────────────────────────────
export const analyzePortfolioWithAI = async ({
    userProfile,
    portfolioData,
    marketData,
}) => {
    try {
        // Pre-compute deterministic metrics (not AI-dependent)
        const portfolioHealth = calculatePortfolioHealth(portfolioData);
        const marketSentimentLabel = calculateOverallSentiment(marketData);

        const prompt = buildAIPrompt({ userProfile, portfolioData, marketData });

        // Use centralized Gemini client with guaranteed JSON output
        const parsed = await generateStructuredJSON(prompt);

        if (!parsed) {
            console.error("AI portfolio analyzer: Gemini returned null");
            return {
                ...FALLBACK_RESPONSE,
                portfolioScore: {
                    ...FALLBACK_RESPONSE.portfolioScore,
                    diversification: Math.round(portfolioHealth.diversificationScore),
                    concentration: portfolioHealth.concentrationRisk,
                },
                marketSentiment: {
                    ...FALLBACK_RESPONSE.marketSentiment,
                    label: marketSentimentLabel,
                },
            };
        }

        // Validate and sanitize AI output before returning
        const validated = validateAIResponse(parsed);

        return validated;

    } catch (err) {
        console.error("AI SERVICE ERROR:", err.message);
        return FALLBACK_RESPONSE;
    }
};