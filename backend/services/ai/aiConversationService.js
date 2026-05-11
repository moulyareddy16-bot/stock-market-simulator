import { generateText } from "./aiGeminiService.js";
import { getUserMemory, saveUserMemory, saveAIResponse } from "./aiMemoryService.js";

// ──────────────────────────────────────────────
// GENERATE AI CHAT RESPONSE
// Uses centralized Gemini client (generateText)
// ──────────────────────────────────────────────
export const generateAIChatResponse = async ({
    userId,
    message,
    portfolioData,
    marketData,
}) => {
    try {
        // Persist user message to memory
        saveUserMemory(userId, message);

        // Retrieve conversation context (last 20 messages)
        const memory = getUserMemory(userId);

        const conversationContext = memory
            .map((m) => `${m.role === "user" ? "Trader" : "Alpha-Insight"}: ${m.content}`)
            .join("\n");

        const prompt = `
You are Alpha-Insight AI — a professional institutional financial assistant.

SYSTEM RULES:
- Be concise and trader-focused. Maximum 3 paragraphs.
- Always provide actionable advice with reasoning.
- Warn about risks when relevant.
- Reference technical indicators (RSI, sentiment) when available.
- Never hallucinate prices or data not provided below.
- If asked about a stock not in the portfolio or market data, say so honestly.

CONVERSATION HISTORY:
${conversationContext || "No prior conversation."}

TRADER'S PORTFOLIO:
${JSON.stringify(portfolioData, null, 2)}

MARKET INTELLIGENCE:
${JSON.stringify(marketData, null, 2)}

TRADER'S QUESTION:
${message}

Respond as Alpha-Insight AI:`;

        const text = await generateText(prompt);

        if (!text) {
            return "AI conversation engine is temporarily unavailable. Please try again shortly.";
        }

        // Persist AI response to memory
        saveAIResponse(userId, text);

        return text;

    } catch (err) {
        console.error("AI Conversation error:", err.message);
        return "AI conversation engine is temporarily unavailable. Please try again shortly.";
    }
};