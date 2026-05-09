import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getAdminActivities } from "../controllers/adminActivityController.js";

const adminActivityRouter = exp.Router();

adminActivityRouter.get("/", verifyToken("admin"), getAdminActivities);

export default adminActivityRouter;
