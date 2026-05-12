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
import Groq from "groq-sdk";
// Updated import: use InferenceClient instead of HfInference
import { InferenceClient } from "@huggingface/inference";

// ──────────────────────────────────────────────
// CLIENT INITIALIZATION
// ──────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// New syntax for Hugging Face
const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY);

// Stable 2026 Models
const GEMINI_MODELS = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
const GROQ_MODEL = "llama-3.3-70b-versatile"; 
const HF_FINANCE_MODEL = "ProsusAI/finbert"; 

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

    try {
        console.log("Gemini Failed. Using Groq for Structured JSON...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: `${prompt} \n Respond ONLY with valid JSON.` }],
            model: GROQ_MODEL,
            response_format: { type: "json_object" }
        });
        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error("CRITICAL: Both Gemini and Groq JSON failed:", error.message);
        return null;
    }
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

    try {
        console.log("Gemini Limited. Switching to Groq Llama-3 Engine...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 2048
        });
        return completion.choices[0].message.content;
    } catch (error) {
        console.error("CRITICAL: All Chat AI providers failed.");
        return "Alpha-Insight AI is currently re-calibrating. Please try again in 30 seconds.";
    }
};

/**
 * UPDATED: Financial Sentiment Analysis using InferenceClient
 */
export const analyzeFinancialSentiment = async (text) => {
    try {
        // InferenceClient uses a slightly different method call
        const result = await hf.textClassification({
            model: HF_FINANCE_MODEL,
            inputs: text
        });
        return result[0]; 
    } catch (error) {
        console.error("HF Sentiment Analysis failed:", error.message);
        return { label: 'neutral', score: 0.0 };
    }
};

/**
 * CALL HUGGING FACE: Specialized Financial Sentiment Analysis
 * Model: ProsusAI/finbert (The gold standard for financial news)
 */
export const analyzeNewsSentiment = async (headline) => {
    try {
        const result = await hf.textClassification({
            model: "ProsusAI/finbert",
            inputs: headline,
        });

        // The model returns an array like: [{ label: 'positive', score: 0.98 }, ...]
        // We take the top result (highest score)
        const topSentiment = result[0];

        return {
            sentiment: topSentiment.label.toUpperCase(), // 'POSITIVE', 'NEGATIVE', or 'NEUTRAL'
            confidence: (topSentiment.score * 100).toFixed(2), // Convert 0.98 to 98.00
        };
    } catch (error) {
        console.error("Hugging Face News Analysis Error:", error.message);
        return { sentiment: "NEUTRAL", confidence: "0.00" };
    }
};