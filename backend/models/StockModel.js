import {schema , model} from "mongoose";

//stock model   

//stockSymbol, companyName, PriceWhenMarketOpen, highestPrice, lowestPrice, 
// currentPrice, availableQuantity, latestTradingDate, previousClosePrice, 
// changeInPrice, changePercentage

const stockSchema = new schema({
    stockSymbol:{
        type:String,
        required:[true,"stock Symbol is required"],
        unique:true
    },
    companyName:{
        type:String,
        required:[true,"company Name is required"]
    },
    PriceWhenMarketOpen:{
        type:Number,
        required:[true,"Price When Market Open is required"]
    },
    highestPrice:{
        type:Number,
        required:[true,"highest Price is required"]  
    },
    lowestPrice:{
        type:Number,
        required:[true,"lowest Price is required"]
    },
    currentPrice:{
        type:Number,
        required:[true,"current Price is required"]
    },
    availableQuantity:{
        type:Number,
        required:[true,"available Quantity is required"]
    },
    latestTradingDate:{
        type:Date,
        required:[true,"latest Trading Date is required"]
    },
    previousClosePrice:{
        type:Number,
        required:[true,"previous Close Price is required"]
    },
    changeInPrice:{
        type:Number,
        required:[true,"change In Price is required"]
    },
    changePercentage:{
        type:Number,
        required:[true,"change Percentage is required"]
    }},{
    timestamps:true,
    versionKey:false,
    strict:"throw"
});

export const stockModel = model("stock",stockSchema)