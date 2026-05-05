import { stockModel } from "../models/StockModel.js";
import axios from "axios";
import { config } from "dotenv";
config();

//add stocks
export const addStock = async(req, res)=>{
    try{

        const stock = await stockModel.create(req.body)
        res.status(201).json({message:"Stock created", payload:stock})

    }catch(error){

        res.status(500).json({message: error.message})
    }
}

//get all stocks
export const getAllStocks = async(req,res)=>{
    try{

        const stocks = await stockModel.find()
        res.status(200).json({message:stocks, payload:stocks})

    }catch(error){

        res.status(500).json({message: error.message})

    }
}

//delete stocks
export const deleteStock = async(req,res)=>{
    try{

        await stockModel.findOneAndDelete({
            symbol:req.params.symbol
        })
        res.status(200).json({message: "Stock Deleted"})

    }catch(error){
        
        res.status(500).json({message: error.message})

    }
}

//get stock details live API
export const getStockDetails = async (req,res,next)=>{
    try{

        const symbol = req.params.stockSymbol;

        const response = await axios.get(

            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINHUB_API_KEY}`

        );

        res.status(200).json({
            payload: response.data
        });

    } catch(error) {

      next(error);

   }

};