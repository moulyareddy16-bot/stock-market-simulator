import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzePortfolioWithAI } from '../services/ai/aiPortfolioAnalyzer.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testAI() {
    try {
        const uri = process.env.DB_URL;
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const userProfile = {
            username: "TestUser",
            balance: 50000,
            riskTolerance: "Medium",
            timeHorizon: "Long Term",
            primaryGoal: "Growth",
            totalTrades: 5
        };

        const portfolioData = [
            { symbol: "NVDA", quantity: 50, avgBuyPrice: 215.20, totalInvested: 10760 },
            { symbol: "KO", quantity: 5, avgBuyPrice: 78.42, totalInvested: 392.10 },
            { symbol: "GOOGL", quantity: 6, avgBuyPrice: 400.80, totalInvested: 2404.80 }
        ];

        console.log("Fetching Finnhub data...");
        const marketData = await Promise.all(portfolioData.map(async (p) => {
            try {
                const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${p.symbol}&token=${process.env.FINNHUB_API_KEY}`);
                const data = response.data;
                const currentPrice = data.c || 0;
                const dp = data.dp || 0;
                const rsi = Math.min(100, Math.max(0, 50 + (dp * 5)));
                const sentiment = Math.min(1, Math.max(0, 0.5 + (dp / 10)));
                let volatility = "Medium";
                if (Math.abs(dp) > 4) volatility = "High";
                else if (Math.abs(dp) < 1) volatility = "Low";

                return {
                    symbol: p.symbol,
                    currentPrice,
                    rsi: Number(rsi.toFixed(2)),
                    sentiment: Number(sentiment.toFixed(2)),
                    volatility,
                    note: `Real-time Finnhub data (dp: ${dp.toFixed(2)}%)`,
                };
            } catch (err) {
                console.error(`Failed to fetch Finnhub data for ${p.symbol}:`, err.message);
                return {
                    symbol: p.symbol,
                    currentPrice: p.avgBuyPrice,
                    rsi: 50,
                    sentiment: 0.5,
                    volatility: "Medium",
                    note: "Fallback data (API error)",
                };
            }
        }));

        console.log("Market Data:", marketData);
        console.log("Calling Gemini AI...");
        const result = await analyzePortfolioWithAI({ userProfile, portfolioData, marketData });
        
        console.log("AI Result:", JSON.stringify(result, null, 2));

        mongoose.disconnect();
    } catch (e) {
        console.error("Test script failed:", e);
        mongoose.disconnect();
    }
}

testAI();
