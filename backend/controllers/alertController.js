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


      // create alert
      const alert = await alertModel.create({

         userId,

         stockSymbol,

         targetPrice,

         condition

      });


      res.status(201).json({

         message:
         "Alert created successfully",

         payload:
         alert

      });

   } catch(error) {

      next(error);

   }

};


// GET USER ALERTS

export const getAlerts = async (req, res, next) => {

   try {

      const alerts =
      await alertModel.find({ userId: req.user?.id});


      res.status(200).json({

         message:
         "User alerts",

         payload:
         alerts

      });

   } catch(error) {

      next(error);

   }

};


// DELETE ALERT

export const deleteAlert = async (req, res, next) => {

   try {

      const { id } = req.params;


      const deletedAlert = await alertModel.findByIdAndDelete(id);


      if (!deletedAlert) {

         return res.status(404).json({

            message:
            "Alert not found"

         });

      }


      res.status(200).json({

         message:
         "Alert deleted successfully"

      });

   } catch(error) {

      next(error);

   }

};