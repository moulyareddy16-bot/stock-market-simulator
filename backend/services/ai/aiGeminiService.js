import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// ──────────────────────────────────────────────────────────────────────
// CLIENT INITIALIZATION
// ──────────────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq   = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Gemini models to try (first hit wins)
const GEMINI_MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash"];

// GROQ fallback models (Llama 3.3 70B is the best free option)
const GROQ_TEXT_MODELS  = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
const GROQ_JSON_MODELS  = ["llama-3.3-70b-versatile"];

/**
 * Returns true if the error is a quota/rate-limit error (all Gemini models share one quota).
 */
const isGeminiQuotaError = (err) =>
    err.message.includes("429") ||
    err.message.includes("RESOURCE_EXHAUSTED") ||
    err.message.includes("quota");

/**
 * Returns true if the error means the model name is wrong (try next model).
 */
const isGeminiModelNotFound = (err) =>
    err.message.includes("404") || err.message.includes("not found");

// ──────────────────────────────────────────────────────────────────────
// HELPER: clean raw Gemini/GROQ text into valid JSON
// ──────────────────────────────────────────────────────────────────────
const cleanJSON = (text) =>
    text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

// ──────────────────────────────────────────────────────────────────────
// GROQ FALLBACK — free-text
// ──────────────────────────────────────────────────────────────────────
const generateTextViaGroq = async (prompt) => {
    for (const model of GROQ_TEXT_MODELS) {
        try {
            const completion = await groq.chat.completions.create({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                max_tokens: 2048,
            });
            const text = completion.choices[0]?.message?.content;
            if (text) {
                console.log(`[GROQ] Success with model: ${model}`);
                return text;
            }
        } catch (err) {
            console.warn(`[GROQ] Model "${model}" failed:`, err.message);
            if (err.message.includes("429")) break; // GROQ quota — stop
        }
    }
    return null;
};

// ──────────────────────────────────────────────────────────────────────
// GROQ FALLBACK — structured JSON
// ──────────────────────────────────────────────────────────────────────
const generateJSONViaGroq = async (prompt) => {
    for (const model of GROQ_JSON_MODELS) {
        try {
            const completion = await groq.chat.completions.create({
                model,
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a financial AI assistant. Always respond with ONLY valid JSON. No markdown fences, no extra text.",
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0.2,
                max_tokens: 2048,
                response_format: { type: "json_object" },
            });
            const raw = completion.choices[0]?.message?.content;
            if (raw) {
                const parsed = JSON.parse(cleanJSON(raw));
                console.log(`[GROQ] JSON success with model: ${model}`);
                return parsed;
            }
        } catch (err) {
            console.warn(`[GROQ] JSON model "${model}" failed:`, err.message);
            if (err.message.includes("429")) break;
        }
    }
    return null;
};

// ──────────────────────────────────────────────────────────────────────
// PUBLIC: Generate structured JSON  (Gemini → GROQ fallback)
// ──────────────────────────────────────────────────────────────────────
export const generateStructuredJSON = async (prompt) => {
    // ── Try Gemini first ──
    for (const modelName of GEMINI_MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.2,
                    maxOutputTokens: 2048,
                },
            });
            const result = await model.generateContent(prompt);
            const parsed = JSON.parse(cleanJSON(result.response.text()));
            console.log(`[Gemini] JSON success with model: ${modelName}`);
            return parsed;
        } catch (err) {
            console.warn(`[Gemini] JSON (${modelName}) failed:`, err.message);
            if (isGeminiQuotaError(err)) {
                console.warn("[Gemini] Quota exhausted → falling back to GROQ for JSON...");
                break; // stop trying Gemini models
            }
            if (!isGeminiModelNotFound(err)) break; // unknown error — stop
            // 404 → continue to next Gemini model
        }
    }

    // ── Fall back to GROQ ──
    const groqResult = await generateJSONViaGroq(prompt);
    if (groqResult) return groqResult;

    console.error("[AI] All providers failed for JSON generation.");
    return null;
};

// ──────────────────────────────────────────────────────────────────────
// PUBLIC: Generate free-text chat response  (Gemini → GROQ fallback)
// ──────────────────────────────────────────────────────────────────────
export const generateText = async (prompt) => {
    // ── Try Gemini first ──
    for (const modelName of GEMINI_MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH",        threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",  threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT",  threshold: "BLOCK_NONE" },
                ],
            });
            const result = await model.generateContent(prompt);
            const text   = result.response.text();
            console.log(`[Gemini] Text success with model: ${modelName}`);
            return text;
        } catch (err) {
            console.warn(`[Gemini] Text (${modelName}) failed:`, err.message);
            if (isGeminiQuotaError(err)) {
                console.warn("[Gemini] Quota exhausted → falling back to GROQ for text...");
                break; // stop trying Gemini models
            }
            if (!isGeminiModelNotFound(err)) break; // unknown error — stop
            // 404 → continue to next Gemini model
        }
    }

    // ── Fall back to GROQ ──
    const groqText = await generateTextViaGroq(prompt);
    if (groqText) return groqText;

    console.error("[AI] All providers failed for text generation.");
    return "Alpha-Insight AI is currently re-calibrating. Please try again in 30 seconds.";
};