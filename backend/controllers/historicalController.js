import axios from "axios";
import { stockModel } from "../models/StockModel.js";
import { stockCache } from "../services/cacheService.js";


// GET HISTORICAL STOCK DATA

export const getStockHistory = async (req, res) => {
   try {
      const { symbol } = req.params;
      const range = req.query.range || "1D";
      const cacheKey = `history_${symbol}_${range}`;

      // 1. CHECK CACHE (survive API limits)
      const cachedData = stockCache.get(cacheKey);
      if (cachedData) {
         console.log(`History Cache Hit: ${symbol} (${range})`);
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
               let formattedDate = date;
               if (range === "1D") {
                  formattedDate = new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
               } else if (range === "5D") {
                  formattedDate = new Date(date).toLocaleDateString([], { weekday: "short" });
               } else {
                  formattedDate = new Date(date).toLocaleDateString([], { day: "numeric", month: "short" });
               }
               return {
                  date: formattedDate,
                  price: Number(values["4. close"])
               };
            }).reverse();

            // Apply Slicing
            const sliceMap = { "1D": 78, "5D": 5, "1M": 30, "3M": 90, "1Y": 250, "MAX": 500 };
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
               formattedData = fhResponse.data.t.map((t, i) => {
                  const date = new Date(t * 1000);
                  let formattedDate;
                  if (range === "1D") {
                     formattedDate = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  } else if (range === "5D") {
                     formattedDate = date.toLocaleDateString([], { weekday: "short" });
                  } else {
                     formattedDate = date.toLocaleDateString([], { day: "numeric", month: "short" });
                  }
                  return {
                     date: formattedDate,
                     price: Number(fhResponse.data.c[i])
                  };
               });
            }
         } catch (fhError) {
            console.log(`Finnhub Failed for ${symbol}:`, fhError.message);
         }
      }

      // ==========================================
      // 4. CACHE & RETURN REAL DATA
      // ==========================================
      if (formattedData && formattedData.length > 0) {
         stockCache.set(cacheKey, formattedData, 3600); // Cache for 1 hour
         return res.status(200).json({
            success: true,
            data: formattedData,
            source: "api"
         });
      }

      // ==========================================
      // 5. SMART UNIQUE DUMMY DATA (Last Resort)
      // ==========================================
      console.log(`Generating unique dummy data for ${symbol}`);
      const dummyData = [];
      const now = new Date();
      
      // Symbol-based seeding
      const seed = symbol.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      let currentPrice = 100 + (seed % 400); // Start price between 100 and 500
      
      // Try to get a more realistic start price from current cache
      const stockCacheData = stockCache.get(`stock_${symbol}`);
      if (stockCacheData) {
         currentPrice = stockCacheData.currentPrice;
      }

      const totalPoints = { "1D": 78, "5D": 5, "1M": 30, "3M": 90, "1Y": 250, "MAX": 500 }[range] || 30;
      const intervalMs = range === "1D" ? 5 * 60000 : 86400000;

      for (let i = totalPoints; i >= 0; i--) {
         const time = new Date(now.getTime() - i * intervalMs);
         
         // Unique movement per stock based on seed
         const wave = Math.sin((i + seed) / (range === "1D" ? 10 : 20)) * (currentPrice * 0.05);
         const noise = (Math.random() - 0.5) * (currentPrice * 0.02);
         
         const pricePoint = currentPrice + wave + noise;
         
         let formattedDate;
         if (range === "1D") {
            formattedDate = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
         } else if (range === "5D") {
            formattedDate = time.toLocaleDateString([], { weekday: "short" });
         } else {
            formattedDate = time.toLocaleDateString([], { day: "numeric", month: "short" });
         }

         dummyData.push({
            date: formattedDate,
            price: Number(Math.max(5, pricePoint).toFixed(2))
         });
      }

      return res.status(200).json({
         success: true,
         data: dummyData,
         source: "dummy"
      });

   } catch (error) {
      console.error("Historical Controller Error:", error.message);
      res.status(500).json({ success: false, message: "Server error fetching history" });
   }
};