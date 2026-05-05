import exp from "express"

import {
    registerUser,
    loginUser,
    logoutUser
} from "../controllers/authController.js"

const authRouter = exp.Router()

authRouter.post("/register", registerUser);

authRouter.post("/login", loginUser);

authRouter.get("/logout", logoutUser);

export  {authRouter};