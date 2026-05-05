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
        type:String,
        required:[true,"Sector is required"]
    },
    availableQuantity:{
        type:Number,
        required:[true,"available Quantity is required"]
    }},{
    timestamps:true,
<<<<<<< HEAD
    versionKey:false
    }
);
=======
     versionKey: false,
    strict:"throw"
});
>>>>>>> 339d18e5855ced6c2881f64b8d6206ac91166514

export const stockModel = model("stock",stockSchema)