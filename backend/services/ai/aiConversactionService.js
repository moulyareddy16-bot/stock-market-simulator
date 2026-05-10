import {
    GoogleGenerativeAI,
}
from "@google/generative-ai";

import dotenv from "dotenv";

dotenv.config();

import {
    getUserMemory,
    saveUserMemory,
    saveAIResponse,
}
from "./aiMemoryService.js";

const genAI =
    new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY
    );

export const generateAIChatResponse =
async ({

    userId,
    message,
    portfolioData,
    marketData,

}) => {

    try {

        // SAVE USER MESSAGE
        saveUserMemory(
            userId,
            message
        );

        // GET MEMORY
        const memory =
            getUserMemory(userId);

        // BUILD CONTEXT
        const conversationContext =
            memory.map((m) => {

                return `${m.role}: ${m.content}`;

            }).join("\n");

        const prompt = `

You are Alpha-Insight AI.

You are a professional financial AI assistant.

MEMORY:
${conversationContext}

PORTFOLIO:
${JSON.stringify(portfolioData, null, 2)}

MARKET:
${JSON.stringify(marketData, null, 2)}

USER MESSAGE:
${message}

RULES:
- concise
- trader focused
- actionable
- explain reasoning
- warn about risk
- use technical indicators
- explain sentiment conflicts

`;

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

        // SAVE AI MEMORY
        saveAIResponse(
            userId,
            text
        );

        return text;

    } catch (err) {

        console.log(err);

        return "AI conversation unavailable.";
    }
};