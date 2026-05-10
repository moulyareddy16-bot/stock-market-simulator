import mongoose, {Schema,model} from "mongoose";

const transactionSchema = new Schema({

    userId:{
        type: Schema.Types.ObjectId, //it takes userId from user schema
        ref:"user",
        required:[true,"userId is required"]
    },

    stockSymbol:{
        type:String,
        required:[true,"stockSymbol is required"],
        
    },

    transactionType:{
        type:String,
        required:[true,"trasactionType is required"],
        enum:["BUY","SELL"]

    },

    quantity:{
        type:Number,
        required:[true,"quantity is required"]
    },

    pricePerShare:{
        type:Number,
        required:[true,"pricePerShare is required"]
    },

    totalAmount: {
        type:Number,
        required:[true,"totalAmount is required"]
    }
    
},{
    timestamps:true,
    versionKey: false,
    strict:"throw"
});

//generate transaction model
export const transactionModel = mongoose.models.transaction || model("transaction",transactionSchema);