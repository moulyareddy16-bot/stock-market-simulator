import { GoogleGenerativeAI }
from "@google/generative-ai";

import dotenv from "dotenv";

dotenv.config();

// import { buildAIPrompt }
// from "../../utils/aiPromptBuilder.js";

import { buildAIPrompt }
from "./aiPromptBuilder.js";

import {
    calculatePortfolioHealth,
}
from "./portfolioAnalysisService.js";

import {
    calculateOverallSentiment,
}
from "./sentimentService.js";

const genAI =
    new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY
    );

export const analyzePortfolioWithAI =
async ({

    userProfile,
    portfolioData,
    marketData,

}) => {

    try {

        // ============================
        // EXTRA ANALYSIS
        // ============================

        const health =
            calculatePortfolioHealth(
                portfolioData
            );

        const marketSentiment =
            calculateOverallSentiment(
                marketData
            );

        // ============================
        // BUILD PROMPT
        // ============================

        const prompt =
            buildAIPrompt({

                userProfile,

                portfolioData,

                marketData,
            });

        // ============================
        // GEMINI MODEL
        // ============================

        const model =
            genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
            });

        const result =
            await model.generateContent(
                prompt
            );

        const response =
            await result.response;

        const text =
            response.text();

        // ============================
        // PARSE AI JSON
        // ============================

        let parsed;

        try {

            parsed = JSON.parse(
                text.replace(/```json/g, "")
                    .replace(/```/g, "")
            );

        } catch {

            parsed = {
                summary:
                    "AI generated partial analysis.",
                suggestions: [],
            };
        }

        // ============================
        // ENHANCE RESPONSE
        // ============================

        return {

            ...parsed,

            marketSentiment,

            portfolioHealth: health,
        };

    } catch (err) {

        console.log(
            "AI SERVICE ERROR",
            err.message
        );

        return {

            summary:
                "AI engine temporarily unavailable.",

            marketSentiment: "NEUTRAL",

            traderScore: 50,

            suggestions: [],
        };
    }
};