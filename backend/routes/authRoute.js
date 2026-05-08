import exp from "express"
import { verifyToken } from "../middleware/verifyToken.js"

import {
    registerUser,
    loginUser,
    logoutUser,
    getProfile
} from "../controllers/authController.js"

const authRouter = exp.Router()

authRouter.post("/register", registerUser)
authRouter.post("/login", loginUser)
authRouter.get("/logout", logoutUser)
authRouter.get("/profile", verifyToken("trader", "admin", "stockmanager"), getProfile)

export default authRouter