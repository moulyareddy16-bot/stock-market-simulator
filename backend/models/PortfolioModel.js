import mongoose, { Schema, model } from "mongoose";

//portfolio model
//userId, stockSymbol, StockName, quantity, avgBuyPrice
const portfolioSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    stockSymbol:{
        type:String,
        required:[true,"Stock Symbol is required"]
    },
    StockName:{
        type:String,
        required:[true,"Company Name is required"]
    },
    quantity:{
        type:Number,
        required:[true,"quantity is required"],
        default:0
    },
    avgBuyPrice:{
        type:Number,
        required:[true,"Average Buy Price is required"]
    }
})

//generate portfolio model
export const portfolioModel = mongoose.models.portfolio || model("portfolio", portfolioSchema)