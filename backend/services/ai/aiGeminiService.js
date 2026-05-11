import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
    console.error("CRITICAL: GEMINI_API_KEY is not set in environment variables");
}

// ──────────────────────────────────────────────
// SINGLE CENTRALIZED GEMINI CLIENT
// Import this instance — do NOT create new GoogleGenerativeAI() elsewhere
// ──────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Robust model selection: standard -> latest -> legacy pro
const MODELS = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];

/**
 * Generate content from Gemini with guaranteed JSON output.
 * @param {string} prompt
 * @returns {Promise<object|null>} Parsed JSON object or null on failure
 */
export const generateStructuredJSON = async (prompt) => {
    let lastError = null;

    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.2,
                },
            });

            const result = await model.generateContent(prompt);
            const text = result.response.text()
                .replace(/^```json\n?/, "")
                .replace(/\n?```$/, "")
                .trim();

            return JSON.parse(text);
        } catch (error) {
            lastError = error;
            console.warn(`Gemini JSON attempt failed with ${modelName}:`, error.message);
            // If it's a 404, we continue to next model
            if (!error.message.includes("404")) break;
        }
    }

    console.error("CRITICAL: All Gemini JSON attempts failed:", lastError?.message);
    return null;
};

/**
 * Generate free-text content from Gemini (for chat responses).
 * @param {string} prompt
 * @returns {Promise<string>} Plain text response
 */
export const generateText = async (prompt) => {
    let lastError = null;

    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            });

            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            lastError = error;
            console.warn(`Gemini Text attempt failed with ${modelName}:`, error.message);
            if (!error.message.includes("404")) break;
        }
    }

    console.error("CRITICAL: All Gemini Text attempts failed:", lastError?.message);
    return null;
};