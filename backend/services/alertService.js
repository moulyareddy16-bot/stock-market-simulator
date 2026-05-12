import axios from "axios";
import { config } from "dotenv";
config();

import { alertModel } from "../models/AlertModel.js";
import { stockCache } from "./cacheService.js";


// CHECK ALERTS (BACKGROUND JOB — Cache-Aware & Batched)

export const checkAlerts = async (io) => {

   try {

      // Step 1: Get all pending alerts
      const alerts = await alertModel.find({ isTriggered: false });

      if (alerts.length === 0) return;

      // Step 2: Get all UNIQUE stock symbols being watched
      const uniqueSymbols = [...new Set(alerts.map(a => a.stockSymbol))];

      console.log(`🔍 Alert check: ${alerts.length} alerts across ${uniqueSymbols.length} unique symbols`);

      // Step 3: Fetch price once per unique symbol (cache-first)
      const priceMap = {};

      await Promise.allSettled(
         uniqueSymbols.map(async (symbol) => {

            // Check cache first
            const cacheKey = `alert_price_${symbol}`;
            const cached = stockCache.get(cacheKey);

            if (cached !== undefined) {
               priceMap[symbol] = cached;
               console.log(`📦 Cache hit for ${symbol}: $${cached}`);
               return;
            }

            // Not in cache — fetch from Finnhub
            try {
               const response = await axios.get(
                  `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
               );
               const price = response.data.c;

               if (price && price > 0) {
                  priceMap[symbol] = price;
                  // Store in cache so other services benefit too
                  stockCache.set(cacheKey, price, 60);
                  console.log(`🌐 API fetch for ${symbol}: $${price}`);
               }
            } catch (err) {
               console.log(`⚠️ Error fetching price for ${symbol}:`, err.message);
            }
         })
      );

      // Step 4: Check all alerts against the fetched prices (no extra API calls)
      for (const alert of alerts) {

         const currentPrice = priceMap[alert.stockSymbol];

         // Skip if price unavailable
         if (!currentPrice || currentPrice <= 0) continue;

         let shouldTrigger = false;

         if (alert.condition === "ABOVE") {
            shouldTrigger = currentPrice >= alert.targetPrice;
         } else if (alert.condition === "BELOW") {
            shouldTrigger = currentPrice <= alert.targetPrice;
         }

         if (shouldTrigger) {

            alert.isTriggered = true;
            await alert.save();

            console.log(`🚨 ALERT TRIGGERED: ${alert.stockSymbol} hit $${currentPrice} (target: $${alert.targetPrice})`);

            io.emit("alertTriggered", {
               stockSymbol: alert.stockSymbol,
               currentPrice,
               targetPrice: alert.targetPrice,
               condition: alert.condition,
               userId: alert.userId
            });

         }

      }

   } catch (error) {
      console.log("Alert service error:", error.message);
   }

};