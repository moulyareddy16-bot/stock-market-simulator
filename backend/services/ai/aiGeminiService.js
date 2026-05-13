// import dotenv from "dotenv";
// dotenv.config();

// import { GoogleGenerativeAI } from "@google/generative-ai";


// if (!process.env.GEMINI_API_KEY) {
//     console.error("CRITICAL: GEMINI_API_KEY is not set in environment variables");
// }

// // ──────────────────────────────────────────────
// // SINGLE CENTRALIZED GEMINI CLIENT
// // Import this instance — do NOT create new GoogleGenerativeAI() elsewhere
// // ──────────────────────────────────────────────
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // Robust model selection: standard -> latest -> legacy pro
// // const MODELS = ["gemini-2.0-flash","gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];

// // Change this line in aiGeminiService.js
// // const MODELS = ["gemini-3.1-flash-lite", "gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
// const MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"];

// /**
//  * Generate content from Gemini with guaranteed JSON output.
//  * @param {string} prompt
//  * @returns {Promise<object|null>} Parsed JSON object or null on failure
//  */
// export const generateStructuredJSON = async (prompt) => {
//     let lastError = null;

//     for (const modelName of MODELS) {
//         try {
//             const model = genAI.getGenerativeModel({
//                 model: modelName,
//                 generationConfig: {
//                     responseMimeType: "application/json",
//                     // temperature: 0.2,
//                     temperature: 0.7,
//                     maxOutputTokens: 2048, // Increased from 1024 to allow "Full Length"
//                 },
//             });

//             const result = await model.generateContent(prompt);
//             const text = result.response.text()
//                 .replace(/^```json\n?/, "")
//                 .replace(/\n?```$/, "")
//                 .trim();

//             return JSON.parse(text);
//         } catch (error) {
//             lastError = error;
//             console.warn(`Gemini JSON attempt failed with ${modelName}:`, error.message);
//             // If it's a 404, we continue to next model
//             if (!error.message.includes("404")) break;
//         }
//     }

//     console.error("CRITICAL: All Gemini JSON attempts failed:", lastError?.message);
//     return null;
// };

// /**
//  * Generate free-text content from Gemini (for chat responses).
//  * @param {string} prompt
//  * @returns {Promise<string>} Plain text response
//  */
// export const generateText = async (prompt) => {
//     let lastError = null;

//     for (const modelName of MODELS) {
//         try {
//             const model = genAI.getGenerativeModel({
//                 model: modelName,
//                 generationConfig: {
//                     temperature: 0.7,
//                     maxOutputTokens: 1024,
//                 },

//                 safetySettings: [
//                     { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
//                     { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
//                     { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
//                     { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
//                 ],
//             },{ apiVersion: 'v1beta' });

//             const result = await model.generateContent(prompt);
//             return result.response.text();
//         } catch (error) {
//             lastError = error;
//             // If we hit a 429 (Rate Limit), don't try the other models, 
//             // because they share the same project quota.
//             if (error.message.includes("429")) {
//                 console.error("QUOTA EXCEEDED: Stop polling.");
//                 break; 
//             }
//             console.warn(`Model ${modelName} failed, trying next...:`, error.message);
//             if (!error.message.includes("404")) break;
//         }
//     }

//     console.error("CRITICAL: All Gemini Text attempts failed:", lastError?.message);
//     return null;
// };

import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

// ──────────────────────────────────────────────
// CLIENT INITIALIZATION
// ──────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Stable 2026 Models
const GEMINI_MODELS = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];

/**
 * HELPER: Cleans raw string response into valid JSON
 */
const cleanJSON = (text) => {
    return text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
};

/**
 * Generate content with guaranteed JSON output.
 */
export const generateStructuredJSON = async (prompt) => {
    for (const modelName of GEMINI_MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 2048 }
            });
            const result = await model.generateContent(prompt);
            return JSON.parse(cleanJSON(result.response.text()));
        } catch (error) {
            console.warn(`Gemini JSON (${modelName}) failed:`, error.message);
            if (error.message.includes("429")) break; 
        }
    }

    console.error("CRITICAL: All Gemini JSON attempts failed.");
    return null;
};

/**
 * Generate free-text chat responses.
 */
export const generateText = async (prompt) => {
    for (const modelName of GEMINI_MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                ],
            }, { apiVersion: 'v1beta' });

            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.warn(`Gemini Text (${modelName}) failed:`, error.message);
            if (error.message.includes("429")) break; 
        }
    }

    return "Alpha-Insight AI is currently re-calibrating. Please try again in 30 seconds.";
};