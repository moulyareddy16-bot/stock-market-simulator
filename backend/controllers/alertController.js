import { alertModel } from "../models/AlertModel.js";


// CREATE ALERT

export const createAlert = async (req, res, next) => {

   try {

      const {
         stockSymbol,
         targetPrice,
         condition
      } = req.body;

      const userId = req.user?.id;

      // 1. VALIDATION


      // check required fields
      if (!stockSymbol || !targetPrice || !condition) {
         return res.status(400).json({
            message: "All fields are required"
         });
      }

      // allowed conditions
      const allowedConditions = ["ABOVE", "BELOW"];

      if (!allowedConditions.includes(condition)) {
         return res.status(400).json({
            message: "Condition must be ABOVE or BELOW"
         });
      }

      // price must be positive
      if (targetPrice <= 0) {
         return res.status(400).json({
            message: "Target price must be greater than 0"
         });
      }



      // 2. PREVENT DUPLICATE ALERTS

      const existingAlert = await alertModel.findOne({
         userId,
         stockSymbol,
         targetPrice,
         condition
      });

      if (existingAlert) {
         return res.status(409).json({
            message: "Alert already exists"
         });
      }



      // 3. CREATE ALERT
 
      const alert = await alertModel.create({
         userId,
         stockSymbol,
         targetPrice,
         condition
      });



      // 4. RESPONSE

      res.status(201).json({
         message: "Alert created successfully",
         payload: alert
      });

   } catch (error) {
      next(error);
   }

};




// GET USER ALERTS

export const getAlerts = async (req, res, next) => {

   try {

      const userId = req.user?.id;

      // fetch alerts of logged-in user
      const alerts = await alertModel.find({ userId });


      res.status(200).json({
         message: "User alerts",
         payload: alerts
      });

   } catch (error) {
      next(error);
   }

};




// DELETE ALERT

export const deleteAlert = async (req, res, next) => {

   try {

      const { id } = req.params;
      const userId = req.user?.id;


      // ===============================
      // SECURITY CHECK (VERY IMPORTANT)
      // ===============================
      const alert = await alertModel.findById(id);

      if (!alert) {
         return res.status(404).json({
            message: "Alert not found"
         });
      }

      // user should delete only their alerts
      if (alert.userId.toString() !== userId) {
         return res.status(403).json({
            message: "Unauthorized action"
         });
      }


      // delete alert
      await alertModel.findByIdAndDelete(id);


      res.status(200).json({
         message: "Alert deleted successfully"
      });

   } catch (error) {
      next(error);
   }

};