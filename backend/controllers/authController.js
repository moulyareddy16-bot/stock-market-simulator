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

        // Check if user is blocked by admin
        if (user.role === "trader" && user.isUserActive === false) {
            return res.status(403).json({ message: "Your account has been blocked by the Administrator. Please contact support." })
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

// Get Profile
export const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User Profile", payload: user });
    } catch (err) {
        next(err);
    }
};

// Update Profile
export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { username, email, password, currentPassword, profileImage } = req.body;
        
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If updating password, verify current password first
        if (password) {
            if (!currentPassword) {
                return res.status(400).json({ message: "Current password is required to set a new one" });
            }
            const isMatch = await compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Current password doesn't match" });
            }
            user.password = await hash(password, 12);
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (profileImage !== undefined) user.profileImage = profileImage;

        await user.save();
        
        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.status(200).json({ 
            message: "Profile updated successfully", 
            payload: updatedUser 
        });
    } catch (err) {
        next(err);
    }
};

//Change Password
export const changePassword= async (req,res)=>{
    
}

// Upload Profile Image
export const uploadProfileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const userId = req.user.id;
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`;

        const user = await userModel.findByIdAndUpdate(
            userId,
            { profileImage: fileUrl },
            { new: true }
        ).select("-password");

        res.status(200).json({
            message: "Profile image uploaded successfully",
            payload: user
        });
    } catch (err) {
        next(err);
    }
};

// Remove Profile Image
export const removeProfileImage = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findByIdAndUpdate(
            userId,
            { profileImage: "" },
            { new: true }
        ).select("-password");

        res.status(200).json({
            message: "Profile image removed successfully",
            payload: user
        });
    } catch (err) {
        next(err);
    }
};