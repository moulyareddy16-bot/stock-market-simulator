import axios from "axios";
import { stockModel } from "../models/StockModel.js";
import { stockCache } from "../services/cacheService.js";


// GET HISTORICAL STOCK DATA

export const getStockHistory = async (req, res) => {
   try {
      const { symbol } = req.params;
      const range = req.query.range || "1D";
      const cacheKey = `history_v2_${symbol}_${range}`; // Version 2 for OHLC

      // 1. CHECK CACHE
      const cachedData = stockCache.get(cacheKey);
      if (cachedData) {
         console.log(`History Cache Hit (v2): ${symbol} (${range})`);
         return res.status(200).json({
            success: true,
            data: cachedData,
            source: "cache"
         });
      }

      let formattedData = null;

      // ==========================================
      // 2. TRY ALPHA VANTAGE (Primary Source)
      // ==========================================
      try {
         let avResponse;
         if (range === "1D") {
            avResponse = await axios.get("https://www.alphavantage.co/query", {
               params: {
                  function: "TIME_SERIES_INTRADAY",
                  symbol,
                  interval: "5min",
                  outputsize: "full",
                  apikey: process.env.ALPHA_VANTAGE_API_KEY
               }
            });
         } else {
            avResponse = await axios.get("https://www.alphavantage.co/query", {
               params: {
                  function: "TIME_SERIES_DAILY",
                  symbol,
                  outputsize: "full",
                  apikey: process.env.ALPHA_VANTAGE_API_KEY
               }
            });
         }

         const avData = avResponse.data;
         const timeSeries = range === "1D" ? avData["Time Series (5min)"] : avData["Time Series (Daily)"];

         if (timeSeries) {
            formattedData = Object.entries(timeSeries).map(([date, values]) => {
               // lightweight-charts needs time in seconds or YYYY-MM-DD
               const timestamp = Math.floor(new Date(date).getTime() / 1000);
               return {
                  time: timestamp,
                  open: Number(values["1. open"]),
                  high: Number(values["2. high"]),
                  low: Number(values["3. low"]),
                  close: Number(values["4. close"]),
                  value: Number(values["5. volume"] || 0)
               };
            }).sort((a, b) => a.time - b.time);

            // Slicing
            const sliceMap = { "1D": 78, "5D": 390, "1M": 30, "3M": 90, "1Y": 250, "MAX": 1000 };
            formattedData = formattedData.slice(-(sliceMap[range] || 30));
         }
      } catch (avError) {
         console.log(`AlphaVantage Failed for ${symbol}:`, avError.message);
      }

      // ==========================================
      // 3. TRY FINNHUB (Fallback Source)
      // ==========================================
      if (!formattedData) {
         try {
            console.log(`Trying Finnhub fallback for ${symbol}`);
            const to = Math.floor(Date.now() / 1000);
            const daysMap = { "1D": 1, "5D": 5, "1M": 30, "3M": 90, "1Y": 365, "MAX": 1825 };
            const from = to - (daysMap[range] || 30) * 24 * 60 * 60;
            const resolution = range === "1D" ? "5" : "D";

            const fhResponse = await axios.get("https://finnhub.io/api/v1/stock/candle", {
               params: {
                  symbol,
                  resolution,
                  from,
                  to,
                  token: process.env.FINNHUB_API_KEY
               }
            });

            if (fhResponse.data.s === "ok") {
               formattedData = fhResponse.data.t.map((t, i) => ({
                  time: t,
                  open: Number(fhResponse.data.o[i]),
                  high: Number(fhResponse.data.h[i]),
                  low: Number(fhResponse.data.l[i]),
                  close: Number(fhResponse.data.c[i]),
                  value: Number(fhResponse.data.v[i])
               }));
            }
         } catch (fhError) {
            console.log(`Finnhub Failed for ${symbol}:`, fhError.message);
         }
      }

      // ==========================================
      // 4. SMART UNIQUE DUMMY DATA (Last Resort)
      // ==========================================
      if (!formattedData || formattedData.length === 0) {
         console.log(`Generating unique dummy OHLC data for ${symbol}`);
         const dummyData = [];
         const now = new Date();
         const seed = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
         let currentPrice = 100 + (seed % 400);

         const stockCacheData = stockCache.get(`stock_${symbol}`);
         if (stockCacheData) {
            currentPrice = stockCacheData.currentPrice;
         }

         const totalPoints = { "1D": 78, "5D": 390, "1M": 30, "3M": 90, "1Y": 250, "MAX": 500 }[range] || 30;
         const intervalSec = range === "1D" ? 5 * 60 : 86400;

         for (let i = totalPoints; i >= 0; i--) {
            const time = Math.floor((now.getTime() - i * intervalSec * 1000) / 1000);
            
            const wave = Math.sin((i + seed) / (range === "1D" ? 10 : 20)) * (currentPrice * 0.05);
            const noise = (Math.random() - 0.5) * (currentPrice * 0.02);
            
            const close = Number(Math.max(5, currentPrice + wave + noise).toFixed(2));
            const open = Number(Math.max(5, close + (Math.random() - 0.5) * (close * 0.01)).toFixed(2));
            const high = Number(Math.max(open, close) + Math.random() * (close * 0.005)).toFixed(2);
            const low = Number(Math.min(open, close) - Math.random() * (close * 0.005)).toFixed(2);
            const volume = Math.floor(Math.random() * 1000000);

            dummyData.push({
               time,
               open: Number(open),
               high: Number(high),
               low: Number(low),
               close: Number(close),
               value: volume
            });
         }
         formattedData = dummyData;
      }

      // ==========================================
      // 5. CACHE & RETURN
      // ==========================================
      if (formattedData && formattedData.length > 0) {
         stockCache.set(cacheKey, formattedData, 3600); 
         return res.status(200).json({
            success: true,
            data: formattedData,
            source: formattedData === dummyData ? "dummy" : "api"
         });
      }

      res.status(404).json({ success: false, message: "No data available" });

   } catch (error) {
      console.error("Historical Controller Error:", error.message);
      res.status(500).json({ success: false, message: "Server error fetching history" });
   }
};