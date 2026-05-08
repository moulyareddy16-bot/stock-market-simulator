import { stockModel } from "../models/StockModel.js";
import axios from "axios";
import { getHistoricalStockData } from "../services/stockService.js";
// import { config } from "dotenv";
// config();
import { validateStockSymbol }
   from "../services/finnhubService.js";

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
         Number(req.query.limit) || 6;

      const search =
         req.query.search || "";

      const skip =
         (page - 1) * limit;

      // IMPORTANT:
      // NO isActive filter here

      const searchFilter = {

         $or: [

            {
               stockSymbol: {

                  $regex: search,

                  $options: "i"

               }

            },

            {
               companyName: {

                  $regex: search,

                  $options: "i"

               }

            }

         ]

      };

      const stocks =
         await stockModel.find(searchFilter)

            .skip(skip)

            .limit(limit)

            .sort({

               createdAt: -1

            });

      const totalStocks =
         await stockModel.countDocuments(
            searchFilter
         );

      const totalPages =
         Math.ceil(totalStocks / limit);

      res.status(200).json({

         success: true,

         currentPage: page,

         totalPages,

         totalStocks,

         payload: stocks

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

      const response = await axios.get(

         `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`

      );

      res.status(200).json({
         payload: response.data
      });

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

<<<<<<< HEAD

      // 4. Format response
      const formattedData =
      data.t.map((timestamp, index) => {

         return {

            date:
            new Date(timestamp * 1000)
            .toISOString()
            .split("T")[0],

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

   } catch(error) {

      next(error);

   }

};


// GET SINGLE STOCK

export const getSingleStock =
async (req, res, next) => {

   try {

      // get stock symbol from params
      const { stockSymbol } =
         req.params;


      // find stock from DB
      const stock =
         await stockModel.findOne({

            stockSymbol:
            stockSymbol.toUpperCase()

         });


      // stock not found
      if (!stock) {

         return res.status(404).json({

            message:
            "Stock not found"

         });

      }


      // send stock details
      res.status(200).json({

         payload: {

            stockSymbol:
            stock.stockSymbol,

            companyName:
            stock.companyName

         }

      });

   } catch(error) {

      next(error);

   }

};

=======
   };
>>>>>>> d7f48ec47f1a2d3667d7bc8b66a666856a5a76db
