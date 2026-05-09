import { stockModel } from "../models/StockModel.js";
import axios from "axios";
import { stockCache } from "./cacheService.js";

// ==========================================
// STORE LIVE PRICES
// ==========================================
const livePrices = {};

// ==========================================
// GENERATE SMALL FLUCTUATION
// ==========================================
const fluctuatePrice = (price) => {
   // 4% max fluctuation
   const percentageChange = (Math.random() - 0.5) * 0.04;
   const newPrice = price + (price * percentageChange);
   return Number(newPrice.toFixed(2));
};

// ==========================================
// GET RANDOM INITIAL PRICE
// ==========================================
const generateInitialPrice = () => {
   return Number((200 + Math.random() * 800).toFixed(2));
};

// ==========================================
// GET LIVE STOCK UPDATES
// ==========================================
export const getLiveStockUpdates = async () => {
   try {
      // FETCH ACTIVE STOCKS
      const stocks = await stockModel.find({ isActive: true }).limit(10);

      const stockUpdates = await Promise.all(
         stocks.map(async (stock) => {
            const cacheKey = `stock_${stock.stockSymbol}`;
            const cachedData = stockCache.get(cacheKey);

            // RETURN CACHE IF EXISTS (Prevents Finnhub rate limits)
            if (cachedData) {
               // We add a tiny artificial fluctuation to the cached data to simulate active trading 
               // even when pulling from the cache, making the UI look alive!
               const fluctuatedPrice = fluctuatePrice(cachedData.currentPrice);
               return {
                  ...cachedData,
                  currentPrice: fluctuatedPrice
               };
            }

            try {
               // API REQUEST
               const response = await axios.get(
                  `https://finnhub.io/api/v1/quote?symbol=${stock.stockSymbol}&token=${process.env.FINNHUB_API_KEY}`
               );

               const stockData = {
                  stockSymbol: stock.stockSymbol,
                  currentPrice: response.data.c || generateInitialPrice(),
                  high: response.data.h || 0,
                  low: response.data.l || 0,
                  open: response.data.o || 0,
                  previousClose: response.data.pc || 0,
                  t: response.data.t || Math.floor(Date.now() / 1000)
               };

               // SAVE CACHE
               stockCache.set(cacheKey, stockData);
               
               // Store for fallback memory
               livePrices[stock.stockSymbol] = stockData.currentPrice;

               return stockData;
            } catch (apiError) {
               // ----------------------------------------------------
               // FALLBACK: DUMMY DATA (Triggers on 429 Rate Limit)
               // ----------------------------------------------------
               if (!livePrices[stock.stockSymbol]) {
                  livePrices[stock.stockSymbol] = generateInitialPrice();
               }

               // Fluctuate the price
               livePrices[stock.stockSymbol] = fluctuatePrice(livePrices[stock.stockSymbol]);

               return {
                  stockSymbol: stock.stockSymbol,
                  currentPrice: livePrices[stock.stockSymbol],
                  t: Math.floor(Date.now() / 1000)
               };
            }
         })
      );

      return stockUpdates;
   } catch(error) {
      console.log("Realtime service error:", error.message);
      return [];
   }
};