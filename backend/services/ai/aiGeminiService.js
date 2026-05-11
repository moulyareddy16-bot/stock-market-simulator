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

/**
 * Generate content from Gemini with guaranteed JSON output.
 * @param {string} prompt
 * @returns {Promise<object|null>} Parsed JSON object or null on failure
 */
export const generateStructuredJSON = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json", // guarantees JSON output
                temperature: 0.3,                     // lower = more deterministic
            },
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();
        console.log("Raw Gemini Text:", text);

        // Strip markdown backticks if Gemini erroneously includes them
        text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

        // Parse JSON — responseMimeType should guarantee clean JSON
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini structured JSON error:", error.message);
        return null;
    }
};

/**
 * Generate free-text content from Gemini (for chat responses).
 * @param {string} prompt
 * @returns {Promise<string>} Plain text response
 */
export const generateText = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.5,
                maxOutputTokens: 1024,
            },
        });

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini text error:", error.message);
        return null;
    }
};