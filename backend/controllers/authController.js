import jwt from "jsonwebtoken";

const { sign } = jwt;
import {hash, compare} from "bcryptjs"
import { userModel } from "../models/UserModel.js"

//Register User
export const registerUser = async(req, res, next)=>{
    try{
        let allowedRoles = ["trader","admin","stockmanager"]
        
        //get user from req obj
        const newUser = req.body

        //check role
        if (!allowedRoles.includes(newUser.role)) {
            return res.status(400).json({ message: "Invalid role" })
        }

        //run validators manually
        //hash password and replace plain with hashed one
        newUser.password = await hash(newUser.password, 12)

        //create New user document
        const newUserDoc = new userModel(newUser)

        //save document
        await newUserDoc.save()
        //send res
        res.status(201).json({ message: "User registerd" })
    } catch (err) {
        next(err)
    }
}

//Login User
export const loginUser = async(req, res, next)=>{
    try{
        const {email, password} = req.body

        //find if user registered
        const user = await userModel.findOne({email: email})

        //if user not found
        if(!user){
            return res.status(400).json({message:"Please Register"})
        }

        //compare passwords
        const isMatched = await compare(password, user.password)

        //if passwords does not match
        if(!isMatched){
            return res.status(400).json({message:"Invalid Password"})
        }

        //create jwt
        const signedToken = sign(
            {
                id: user._id,
                username: user.username,
                email: email,
                role: user.role,
                walletBalance: user.walletBalance
            },
            process.env.SECRET_KEY,
            {
                expiresIn: "1h",
            },
        );

        //set token to res header as httpOnly cookie
        res.cookie("token", signedToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });
        //remove password from user document
        let userObj = user.toObject()
        delete userObj.password

        //send res
        res.status(200).json({ message: "Login success", payload: userObj })


    }catch(err){
        next(err)
    }
}

//Logout User
export const logoutUser = async(req,res,next)=>{
    try{
        //delete token from cookie storage
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });
        //send res
        res.status(200).json({ message: "Logout success" })
    }catch(err){
        next(err)
    }
}

//Change Password
export const changePassword= async (req,res)=>{
    
}

//