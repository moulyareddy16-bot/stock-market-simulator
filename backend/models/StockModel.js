import {Schema , model} from "mongoose";

//stock model   

//stockSymbol, companyName, PriceWhenMarketOpen, highestPrice, lowestPrice, 
// currentPrice, availableQuantity, latestTradingDate, previousClosePrice, 
// changeInPrice, changePercentage

const stockSchema = new Schema({
    stockSymbol:{
        type:String,
        required:[true,"stock Symbol is required"],
        unique:true
    },
    companyName:{
        type:String,
        required:[true,"company Name is required"]
    },
    sector:{
        type:String
    },
    availableQuantity:{
        type:Number
    }},{
    timestamps:true,
    versionKey:false
    }
);

export const stockModel = model("stock",stockSchema)