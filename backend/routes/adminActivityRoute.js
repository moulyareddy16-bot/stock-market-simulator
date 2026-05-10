import exp from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getAdminActivities, clearAdminActivities } from "../controllers/adminActivityController.js";

const adminActivityRouter = exp.Router();

adminActivityRouter.get("/", verifyToken("admin"), getAdminActivities);
adminActivityRouter.delete("/", verifyToken("admin"), clearAdminActivities);

export default adminActivityRouter;
