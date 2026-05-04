import { Schema, model } from "mongoose";

//user model
//username , email , password , role, wallet-balance , isuseractive 
const userSchema = new Schema({
    username:{
        type:String,
        required:[true,"username is required"],
        minLength:[4,"min length of username is 4 characters"],
        maxLength:[17,"username exceeds the 17 characters"],
        unique:true
    },
    email:{
        type:String,
        required:[true,"email required"],
        unique:true
    },
    password:{
        type:String,
        required:[true,"password required"],
        minLength:[6,"min 6 characters are required"]
    },
    role:{
        type:String,
        enum:["trader","admin"],
        required:[true,"role is required"]
    },
    walletBalance:{
        type:Number,
        default:100000,
    },
    isUserActive:{
        type:Boolean,
        default:true,
    }},
    {
        timestamps:true,
        versionKey:true,
        strict:"throw"
    }
)


//generate user model
export const userModel=model("user",userSchema)