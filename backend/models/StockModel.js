import mongoose, { Schema, model } from "mongoose";

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
//         type:String
//     },

//     availableQuantity:{
//         type:Number
//     },

//      isActive: {
//      type: Boolean,
//      default: true
//     }
// },{
//     timestamps:true,
//     versionKey:false
// });

const stockSchema = new Schema({

    stockSymbol: {

        type: String,
        required: [true, "Stock Symbol is required"],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: 1,
        maxlength: 10

    },

    companyName: {

        type: String,
        required: true,
        trim: true

    },

    logo: {

        type: String,

        default: ""

    },

    sector: {

        type: String,
        default: "Unknown"

    },

    exchange: {

        type: String,
        default: "Unknown"

    },

    country: {

        type: String,
        default: "Unknown"

    },

    currency: {

        type: String,
        default: "USD"

    },

    ipo: {

        type: String

    },

    marketCapitalization: {

        type: Number,
        default: 0

    },

    availableQuantity: {

        type: Number,
        default: 0,
        min: 0

    },

    isActive: {

        type: Boolean,
        default: true

    }

}, {

    timestamps: true,
    versionKey: false

});


export const stockModel = model("stock", stockSchema)