import { stockModel } from "../models/StockModel.js";
import axios from "axios";
import { getHistoricalStockData } from "../services/stockService.js";
import { logAdminActivity } from "./adminActivityController.js";
// import { config } from "dotenv";
// config();
import { validateStockSymbol } from "../services/finnhubService.js";
import { stockCache } from "../services/cacheService.js";

// ADD STOCK
export const addStock =
   async (req, res, next) => {

      try {

         let { stockSymbol } = req.body;

         // VALIDATE INPUT
         if (!stockSymbol) {

            return res.status(400).json({

               success: false,

               message:
                  "Stock symbol is required"

            });

         }

         // CLEAN SYMBOL
         stockSymbol =
            stockSymbol
               .trim()
               .toUpperCase();

         // BASIC FORMAT VALIDATION
         const symbolRegex = /^[A-Z.]{1,10}$/;

         if (!symbolRegex.test(stockSymbol)) {

            return res.status(400).json({

               success: false,

               message:
                  "Invalid stock symbol format"

            });

         }

         // CHECK EXISTING STOCK
         const existingStock =
            await stockModel.findOne({

               stockSymbol

            });

         if (existingStock) {

            return res.status(409).json({

               success: false,

               message:
                  "Stock already exists"

            });

         }

         // VALIDATE FROM FINNHUB
         let companyData;

         try {

            companyData =
               await validateStockSymbol(stockSymbol);

            if (companyData?.rateLimited) {

               return res.status(429).json({

                  success: false,

                  message:
                     "Market API limit reached. Please try again in a minute."

               });

            }

         } catch (error) {

            return res.status(429).json({

               success: false,

               message: error.message

            });

         }

         // INVALID SYMBOL
         if (
            !companyData ||
            !companyData.name
         ) {

            return res.status(400).json({

               success: false,

               message:
                  "Invalid stock symbol. No company found in market."

            });

         }

         // CREATE STOCK
         const stock =
            await stockModel.create({

               stockSymbol,

               companyName:
                  companyData.name,

               sector:
                  companyData.finnhubIndustry ||
                  "Unknown",

               exchange:
                  companyData.exchange ||
                  "Unknown",

               country:
                  companyData.country ||
                  "Unknown",

               currency:
                  companyData.currency ||
                  "USD",

               ipo:
                  companyData.ipo ||

                  "",

               marketCapitalization:
                  companyData.marketCapitalization || 0
               ,
               logo:
                  companyData.logo || ""

            });

         // Log Activity
         await logAdminActivity(
            req.user.id,
            "ADD_STOCK",
            "STOCK",
            stockSymbol,
            `Stock manager added new stock to market: ${stockSymbol} (${companyData.name})`
         );

         // RESPONSE
         res.status(201).json({

            success: true,

            message:
               "Stock added successfully",

            payload: stock

         });

      } catch (error) {

         next(error);

      }

   };

   export const getAllStocks =
async (req, res, next) => {

   try {

      const page =
         Number(req.query.page) || 1;

      const limit =
         Number(req.query.limit) || 9;

      const search = req.query.search || "";

      // Sanitize regex input to prevent ReDoS attacks
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const skip =
         (page - 1) * limit;

      // IMPORTANT:
      // NO isActive filter here

      const searchFilter = {

         $or: [

            {
               stockSymbol: {
                  $regex: sanitizedSearch,
                  $options: "i"
               }
            },

            {
               companyName: {
                  $regex: sanitizedSearch,
                  $options: "i"
               }
            }

         ]

      };

      const stocks =
         await stockModel.find(searchFilter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

      // HEAL MISSING DATA (Lazy sync for "Unknown" fields)
      const healedStocks = await Promise.all(stocks.map(async (stock) => {
         if (stock.country === "Unknown" || stock.sector === "Unknown" || !stock.logo) {
            try {
               const profile = await validateStockSymbol(stock.stockSymbol);
               if (profile && profile.name) {
                  stock.sector = profile.finnhubIndustry || stock.sector;
                  stock.country = profile.country || stock.country;
                  stock.exchange = profile.exchange || stock.exchange;
                  stock.logo = profile.logo || stock.logo;
                  stock.marketCapitalization = profile.marketCapitalization || stock.marketCapitalization;
                  stock.ipo = profile.ipo || stock.ipo;
                  await stock.save();
               }
            } catch (err) {
               console.log(`Failed to heal stock ${stock.stockSymbol}:`, err.message);
            }
         }
         return stock;
      }));

      const totalStocks =
         await stockModel.countDocuments(
            searchFilter
         );

      const totalActive =
         await stockModel.countDocuments({
            ...searchFilter,
            isActive: true
         });

      const totalInactive =
         await stockModel.countDocuments({
            ...searchFilter,
            isActive: false
         });

      const uniqueExchanges = await stockModel.distinct("exchange", searchFilter);
      const totalExchanges = uniqueExchanges.length;

      const totalPages =
         Math.ceil(totalStocks / limit);

      console.log("Backend sending stocks data:", { totalStocks, totalActive, totalInactive, totalExchanges });

      res.status(200).json({

         success: true,

         currentPage: page,

         totalPages,

         totalStocks,

         totalActive,

         totalInactive,

         totalExchanges,

         payload: healedStocks
      });

   } catch (error) {

      next(error);

   }

};

//delete stocks
export const deleteStock = async (req, res, next) => {

   try {

      const { stockSymbol } =
         req.params;


      const deletedStock =
         await stockModel.findOneAndDelete({

            stockSymbol

         });


      if (!deletedStock) {

         return res.status(404).json({

            message:
               "Stock not found"

         });

      }


      // Log Activity
      await logAdminActivity(
         req.user.id,
         "DELETE_STOCK",
         "STOCK",
         stockSymbol,
         `Stock manager permanently removed stock from market: ${stockSymbol}`
      );

      res.status(200).json({

         message:
            "Stock deleted successfully"

      });

   } catch (error) {

      next(error);

   }

};


//get stock details live API
export const getStockDetails = async (req, res, next) => {
   try {
      const symbol = req.params.stockSymbol;
      const cacheKey = `stock_${symbol}`;
      const cachedData = stockCache.get(cacheKey);

      if (cachedData) {
         // Map cache data back to Finnhub format for frontend
         return res.status(200).json({
            payload: {
               c: cachedData.currentPrice,
               h: cachedData.high || cachedData.currentPrice,
               l: cachedData.low || cachedData.currentPrice,
               o: cachedData.open || cachedData.currentPrice,
               pc: cachedData.previousClose || cachedData.currentPrice,
               d: cachedData.previousClose ? cachedData.currentPrice - cachedData.previousClose : 0,
               dp: cachedData.previousClose ? ((cachedData.currentPrice - cachedData.previousClose) / cachedData.previousClose) * 100 : 0,
               t: cachedData.t || Math.floor(Date.now() / 1000)
            }
         });
      }

      try {
         const response = await axios.get(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
         );

         res.status(200).json({
            payload: response.data
         });
      } catch (apiError) {
         console.error(`Finnhub API error for ${symbol}:`, apiError.message);
         
         // Fallback: Generate dummy data if API fails and no cache
         const generateInitialPrice = () => Number((200 + Math.random() * 800).toFixed(2));
         const dummyPrice = generateInitialPrice();
         
         const dummyData = {
            c: dummyPrice,
            h: dummyPrice,
            l: dummyPrice,
            o: dummyPrice,
            pc: dummyPrice,
            d: 0,
            dp: 0,
            t: Math.floor(Date.now() / 1000)
         };
         
         res.status(200).json({ payload: dummyData });
      }
   } catch (error) {
      next(error);
   }
};


// GET HISTORICAL STOCK DATA

export const getStockHistory =
   async (req, res, next) => {

      try {

         // 1. Get stock symbol
         const { symbol } = req.params;

         // Optional query param
         const days =
            Number(req.query.days) || 30;


         // 2. Check stock exists
         const stock =
            await stockModel.findOne({

               stockSymbol: symbol

            });

         if (!stock) {

            return res.status(404).json({

               message:
                  "Stock not found"

            });

         }


         // 3. Fetch historical data
         const data =
            await getHistoricalStockData(
               symbol,
               days
            );


         // Finnhub failed
         if (data.s !== "ok") {

            return res.status(400).json({

               message:
                  "Unable to fetch historical data"

            });

         }


         // 4. Format response
         const formattedData =
            data.t.map((timestamp, index) => {

               return {

                  date:
                     new Date(timestamp * 1000)
                        .toISOString()
                        .split("T")[0],

                  price: data.c[index], // ADDED FOR CHART COMPATIBILITY
                  open: data.o[index],

                  high: data.h[index],

                  low: data.l[index],

                  close: data.c[index],

                  volume: data.v[index]

               };

            });


         // 5. Send response
         res.status(200).json({

            message:
               "Historical stock data",

            stockSymbol:
               symbol,

            totalDays:
               days,

            payload:
               formattedData

         });

      } catch (error) {

         next(error);

      }

   };

// ACTIVATE / DEACTIVATE STOCK
export const toggleStockStatus =
   async (req, res, next) => {

      try {

         const { symbol } = req.params;

         const stock =
            await stockModel.findOne({

               stockSymbol: symbol

            });

         if (!stock) {

            return res.status(404).json({

               message: "Stock not found"

            });

         }

         stock.isActive =
            !stock.isActive;

         await stock.save();

         // Log Activity
         await logAdminActivity(
            req.user.id,
            "STOCK_STATUS",
            "STOCK",
            symbol,
            `Stock manager ${stock.isActive ? 'activated' : 'deactivated'} stock: ${symbol}`
         );

         res.status(200).json({

            message:
               `Stock ${stock.isActive
                  ? "Activated"
                  : "Deactivated"
               } Successfully`,

            payload: stock

         });

      } catch (error) {
         next(error);
      }
};


// GET SINGLE STOCK

export const getSingleStock = async (req, res, next) => {
   try {
      const { stockSymbol } = req.params;

      const stock = await stockModel.findOne({
         stockSymbol: stockSymbol.toUpperCase()
      });

      if (!stock) {
         return res.status(404).json({
            message: "Stock not found"
         });
      }

      let currentPrice = 0;
      let change = "+0.00%";
      let peRatio = "N/A";
      let divYield = "N/A";
      let profile = {};

      try {
         // Fetch quote, metrics, and profile in parallel
         const [quoteRes, metricRes, profileRes] = await Promise.all([
            axios.get(`https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${process.env.FINNHUB_API_KEY}`),
            axios.get(`https://finnhub.io/api/v1/stock/metric?symbol=${stockSymbol}&metric=all&token=${process.env.FINNHUB_API_KEY}`),
            axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${stockSymbol}&token=${process.env.FINNHUB_API_KEY}`)
         ]);

         currentPrice = quoteRes.data.c || 0;
         const dp = quoteRes.data.dp || 0;
         change = `${dp >= 0 ? '+' : ''}${dp.toFixed(2)}%`;

         if (metricRes.data && metricRes.data.metric) {
            peRatio = metricRes.data.metric.peExclExtraTTM ? metricRes.data.metric.peExclExtraTTM.toFixed(2) : "N/A";
            divYield = metricRes.data.metric.dividendYieldIndicatedAnnual ? metricRes.data.metric.dividendYieldIndicatedAnnual.toFixed(2) + "%" : "N/A";
         }

         if (profileRes.data) {
            profile = {
               sector: profileRes.data.finnhubIndustry,
               exchange: profileRes.data.exchange,
               country: profileRes.data.country,
               ipo: profileRes.data.ipo,
               logo: profileRes.data.logo
            };
         }
      } catch (e) {
         console.error("Finnhub error:", e.message);
      }

      const stockData = {
         ...stock.toObject(),
         currentPrice,
         change,
         peRatio,
         divYield,
         ...profile
      };

      return res.status(200).json({
         success: true,
         payload: stockData
      });
   } catch(error) {
      next(error);
   }
};

