import axios from "axios";

import { transactionModel }
from "../models/TransactionModel.js";

import { stockModel }
from "../models/StockModel.js";

import { userModel}
from "../models/UserModel.js";


//BUY STOCKS
export const buyStock = async (req, res, next) => {

   try {
      console.log(process.env.FINNHUB_API_KEY);

      // get request body
      const { stockSymbol, quantity } = req.body;

      // logged in user
      const userId = req.trader?.id;

      // check stock exists
      const stock = await stockModel.findOne({stockSymbol});

      if (!stock) {

         return res.status(404).json({
            message: "Stock not found"
         });

      }

      // fetch live stock price
      const response = await axios.get(
         `https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${process.env.FINNHUB_API_KEY}`
      );

      // current market price
      const currentPrice = response.data.c;

      // calculate total amount
      const totalAmount = currentPrice * quantity;

      // create transaction
      const transaction = await transactionModel.create({

            userId,

            stockSymbol,

            transactionType: "BUY",

            quantity,

            pricePerShare: currentPrice,

            totalAmount

         });

      // get user
      const user = await userModel.findById(req.user?.id);

      //deduct amount from wallet
      user.walletBalance -= totalAmount;

      //save updated wallet
      await user.save();

      // send response
      res.status(201).json({

         message: "Stock Purchased Successfully",

         payload: transaction

      });

   } catch(error) {

      next(error);

   }

};

//SELL STOCKS
export const sellStock = async (req, res, next) => {

   try {

      // get req body
      const { stockSymbol, quantity } = req.body;

      // logged in user id
      const userId = req.user?.id;


      // get all BUY transactions
      const buyTransactions = await transactionModel.find({

            userId,

            stockSymbol,

            transactionType: "BUY"

         });


      // get all SELL transactions
      const sellTransactions = await transactionModel.find({

            userId,

            stockSymbol,

            transactionType: "SELL"

         });


      // calculate total bought shares
      let totalBought = 0;

      buyTransactions.forEach(transaction => {

         totalBought += transaction.quantity;

      });


      // calculate total sold shares
      let totalSold = 0;

      sellTransactions.forEach(transaction => {

         totalSold += transaction.quantity;

      });


      // currently available shares
      const availableQuantity = totalBought - totalSold;


      // check enough shares available
      if (quantity > availableQuantity) {

         return res.status(400).json({

            message:
            "Not enough shares to sell"

         });

      }


      // fetch live stock price
      const response = await axios.get(

         `https://finnhub.io/api/v1/quote?symbol=${stockSymbol}&token=${process.env.FINNHUB_API_KEY}`

      );


      // current market price
      const currentPrice = response.data.c;


      // calculate total selling amount
      const totalAmount = currentPrice * quantity;


      // create SELL transaction
      const transaction = await transactionModel.create({

            userId,

            stockSymbol,

            transactionType: "SELL",

            quantity,

            pricePerShare: currentPrice,

            totalAmount

         });


      // get user
      const user = await userModel.findById(userId);


      // add money to wallet
      user.walletBalance += totalAmount;


      // save updated wallet
      await user.save();


      // send response
      res.status(201).json({

         message:
         "Stock Sold Successfully",

         payload: transaction,

         updatedWalletBalance: user.walletBalance

      });

   } catch(error) {

      next(error);

   }

};

//GET USER TRANSACTIONS
export const getTransactions = async (req, res, next) => {

   try {

      const transactions = await transactionModel.find({userId: req.user?.id});

      res.status(200).json({

         message: "User Transactions",

         payload: transactions

      });

   } catch(error) {

      next(error);

   }

};

