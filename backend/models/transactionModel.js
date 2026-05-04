import {Schema,model} from "mongoose";

const transactionSchema = new Schema({

    userId:{
        type: Schema.Types.ObjectId, //it takes userId from user schema
        ref:"user",
        required:[true,"UserId is required"]
    },

    stockSymbol:{
        type:String,
        required:[true,"stockSymbol is required"],
        
    },

    transactionType:{
        type:String,
        required:[true,"trasactionType is required"],
        enum:["buy","sell"]

    },

    quantity:{
        type:Number,
        required:[true,"quantity is required"]
    },

    pricePerShare:{
        type:Number,
        required:[true,"pricePerShare is required"]
    }
    
},{
    timestamps:true,
    versionKey:false,
    strict:"throw"
});

//generate trasaction model
export const trasactionModel = model("transaction",transactionSchema);