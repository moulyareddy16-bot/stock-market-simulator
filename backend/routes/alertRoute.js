import express from "express";

import {
   createAlert,
   getAlerts,
   deleteAlert
} from "../controllers/alertController.js";

import { verifyToken } from "../middleware/verifyToken.js";

const alertRouter = express.Router();


// Create alert
alertRouter.post("/", verifyToken("trader"), createAlert);


// Get alerts
alertRouter.get("/", verifyToken("trader"), getAlerts);


// Delete alert
alertRouter.delete("/:id", verifyToken("trader"), deleteAlert);


export default alertRouter;