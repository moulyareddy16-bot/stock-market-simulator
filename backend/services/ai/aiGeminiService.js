import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
);

export const generateAiAnalysis = async (prompt) => {

    try {

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const result = await model.generateContent(prompt);

        const response = await result.response;

        const text = response.text();

        return text;

    } catch (error) {

        console.log("Gemini Error:", error);

        return null;
    }
};