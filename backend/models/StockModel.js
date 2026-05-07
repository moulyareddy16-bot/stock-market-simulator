import {Schema , model} from "mongoose";

//stock model   

//stockSymbol, companyName, PriceWhenMarketOpen, highestPrice, lowestPrice, 
// currentPrice, availableQuantity, latestTradingDate, previousClosePrice, 
// changeInPrice, changePercentage

// const stockSchema = new Schema({
//     stockSymbol:{
//         type:String,
//         required:[true,"stock Symbol is required"],
//         unique:true
//     },
//     companyName:{
//         type:String,
//         required:[true,"company Name is required"]
//     },
//     sector:{
//         type:String,
//         required:[true,"Sector is required"]
//     },
//     availableQuantity:{
//         type:Number,
//         required:[true,"available Quantity is required"]
//     }},{
//     timestamps:true,
//     versionKey:false
//     }
// );

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
<<<<<<< HEAD
        type:Number
    }},{
=======
        type:Number,
        required:[true,"available Quantity is required"]
    },

    isActive:{
        type:Boolean,
        default:true
    }

},{
>>>>>>> 8816478812ce014a44900df6b08312cdecbfbd5f
    timestamps:true,
    versionKey:false
});

export const stockModel = model("stock",stockSchema)