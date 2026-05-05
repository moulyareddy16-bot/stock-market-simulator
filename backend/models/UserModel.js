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
        default: function () {
            return this.role === "trader" ? 100000 : undefined;
        }
    },
    isUserActive:{
        type:Boolean,
        default:true,
    }},
    {
        timestamps:true,
<<<<<<< HEAD
        versionKey:false,
=======
         versionKey: false,
>>>>>>> 339d18e5855ced6c2881f64b8d6206ac91166514
        strict:"throw"
    }
)


//generate user model
export const userModel=model("user",userSchema)