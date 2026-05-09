import exp from "express";
import { 
  getAllUsers, 
  toggleUserStatus, 
  deleteUser, 
  getUserTransactions, 
  getUserPortfolio 
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const userRouter = exp.Router();

// Protected Route for Admin to view all users
userRouter.get(
  "/",
  verifyToken("admin"),
  getAllUsers
);

// Toggle User Status (Block/Unblock)
userRouter.patch(
  "/:userId/toggle-status",
  verifyToken("admin"),
  toggleUserStatus
);

// Delete User
userRouter.delete(
  "/:userId",
  verifyToken("admin"),
  deleteUser
);

// Get specific user's transactions
userRouter.get(
  "/:userId/transactions",
  verifyToken("admin"),
  getUserTransactions
);

// Get specific user's portfolio
userRouter.get(
  "/:userId/portfolio",
  verifyToken("admin"),
  getUserPortfolio
);

export default userRouter;
