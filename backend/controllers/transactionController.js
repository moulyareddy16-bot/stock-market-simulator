import axios from "axios";

import { transactionModel } from "../models/transactionModel.js";

import { stockModel }
from "../models/StockModel.js";

import { userModel }
from "../models/UserModel.js";


import { config } from "dotenv";
config();




// BUY STOCK

export const buyStock = async (req, res, next) => {

   try {

      // Get request data
      const { stockSymbol, quantity } = req.body;

      // Logged in trader
      const userId = req.user?.id;


      // Validate quantity
      if (!quantity || quantity <= 0) {

         return res.status(400).json({
            message: "Quantity must be greater than 0"
         });

      }


      // Check stock exists in DB
      const stock = await stockModel.findOne({stockSymbol});

      if (!stock) {

         return res.status(404).json({
            message: "Stock not found"
         });

      }


      // Fetch live stock price
      const response = await axios.get(

         `https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${process.env.FINNHUB_API_KEY}`

      );


      // Current market price
      const currentPrice = response.data.c;


      // Invalid API response
      if (!currentPrice || currentPrice <= 0) {

         return res.status(400).json({
            message: "Unable to fetch stock price"
         });

      }


      // Calculate total amount
      const totalAmount = currentPrice * quantity;


      // Get user wallet
      const user = await userModel.findById(userId);


      // Check sufficient balance
      if (user.walletBalance < totalAmount) {

         return res.status(400).json({

            message:
            "Insufficient wallet balance"

         });

      }


      // Deduct wallet amount
      user.walletBalance -= totalAmount;

      await user.save();


      // Create BUY transaction
      const transaction =
         await transactionModel.create({

            userId,

            stockSymbol,

            transactionType: "BUY",

            quantity,

            pricePerShare: currentPrice,

            totalAmount

         });


      // Send response
      res.status(201).json({

         message:
         "Stock purchased successfully",

         updatedWalletBalance:
         user.walletBalance,

         payload:
         transaction

      });

   } catch(error) {

      next(error);

   }

};




// SELL STOCK

export const sellStock = async (req, res, next) => {

   try {

      // Get request data
      const { stockSymbol, quantity } = req.body;

      // Logged in trader
      const userId = req.user?.id;


      // Validate quantity
      if (!quantity || quantity <= 0) {

         return res.status(400).json({

            message:
            "Quantity must be greater than 0"

         });

      }


      // Check stock exists
      const stock = await stockModel.findOne({stockSymbol});

      if (!stock) {

         return res.status(404).json({
            message: "Stock not found"
         });

      }


      // Fetch all user transactions
      const transactions = await transactionModel.find({userId, stockSymbol});


      // Calculate available holdings
      let ownedQuantity = 0;

      transactions.forEach((trans) => {

         if (trans.transactionType === "BUY") {

            ownedQuantity += trans.quantity;

         }

         else if (
            trans.transactionType === "SELL"
         ) {

            ownedQuantity -= trans.quantity;

         }

      });


      // Prevent overselling
      if (quantity > ownedQuantity) {

         return res.status(400).json({

            message:
            "Not enough shares to sell"

         });

      }


      // Fetch live market price
      const response = await axios.get(

         `https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${process.env.FINNHUB_API_KEY}`

      );


      const currentPrice = response.data.c;


      // Invalid API response
      if (!currentPrice || currentPrice <= 0) {

         return res.status(400).json({

            message:
            "Unable to fetch stock price"

         });

      }


      // Calculate sell amount
      const totalAmount = currentPrice * quantity;


      // Get user
      const user = await userModel.findById(userId);


      // Add money to wallet
      user.walletBalance += totalAmount;

      await user.save();


      // Create SELL transaction
      const transaction =
         await transactionModel.create({

            userId,

            stockSymbol,

            transactionType: "SELL",

            quantity,

            pricePerShare: currentPrice,

            totalAmount

         });


      // Send response
      res.status(201).json({

         message:
         "Stock sold successfully",

         updatedWalletBalance:
         user.walletBalance,

         remainingQuantity:
         ownedQuantity - quantity,

         payload:
         transaction

      });

   } catch(error) {

      next(error);

   }

};




// GET USER TRANSACTIONS

export const getTransactions = async (req, res, next) => {

   try {

      // Logged in trader
      const userId = req.user?.id;


      // Get all transactions
      const transactions = await transactionModel.find({ userId })
         // newest first
         .sort({ createdAt: -1 });


      // Send response
      res.status(200).json({

         message:
         "User transaction history",

         totalTransactions:
         transactions.length,

         payload:
         transactions

      });

   } catch(error) {

      next(error);

   }

};
