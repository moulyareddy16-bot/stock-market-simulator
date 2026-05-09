import exp from "express"
import { verifyToken } from "../middleware/verifyToken.js"

import {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile,
    uploadProfileImage,
    removeProfileImage
} from "../controllers/authController.js"
import { upload } from "../middleware/uploadMiddleware.js"

const authRouter = exp.Router()

authRouter.post("/register", registerUser)
authRouter.post("/login", loginUser)
authRouter.get("/logout", logoutUser)
authRouter.get("/profile", verifyToken("trader", "admin", "stockmanager"), getProfile)
authRouter.put("/update-profile", verifyToken("trader", "admin", "stockmanager"), updateProfile)
authRouter.post("/upload-image", verifyToken("trader", "admin", "stockmanager"), upload.single('image'), uploadProfileImage)
authRouter.delete("/remove-image", verifyToken("trader", "admin", "stockmanager"), removeProfileImage)

export default authRouter