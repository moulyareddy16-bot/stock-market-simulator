import {Schema , model} from "mongoose";

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
    },
    
     isActive: {
     type: Boolean,
     default: true
    }
},{
    timestamps:true,
    versionKey:false
});

export const stockModel = model("stock",stockSchema)