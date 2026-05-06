import axios from "axios";
import { config } from "dotenv";
config();

import { alertModel } from "../models/AlertModel.js";


// CHECK ALERTS (BACKGROUND JOB)

export const checkAlerts = async (io) => {

   try {

      // Get all pending alerts
      const alerts = await alertModel.find({
         isTriggered: false
      });


      // Loop through alerts
      for (let alert of alerts) {

         try {

            // Fetch live stock price
            const response = await axios.get(
               `https://finnhub.io/api/v1/quote?symbol=${alert.stockSymbol}&token=${process.env.FINNHUB_API_KEY}`
            );

            const currentPrice = response.data.c;


            // Skip invalid price
            if (!currentPrice || currentPrice <= 0) continue;


            let shouldTrigger = false;


            // ABOVE condition
            if (alert.condition === "ABOVE") {

               shouldTrigger =
               currentPrice >= alert.targetPrice;

            }

            // BELOW condition
            else if (alert.condition === "BELOW") {

               shouldTrigger =
               currentPrice <= alert.targetPrice;

            }


            if (shouldTrigger) {

                alert.isTriggered = true;

                await alert.save();

                console.log(`🚨 ALERT TRIGGERED: ${alert.stockSymbol} hit ${currentPrice}`);

                io.emit("alertTriggered", {

                    stockSymbol: alert.stockSymbol,
                    currentPrice: currentPrice,
                    targetPrice: alert.targetPrice,
                    condition: alert.condition

                });

            }

        } catch (err) {

            console.log(
               `Error fetching price for ${alert.stockSymbol}`
            );

         }

      }

   } catch (error) {

      console.log("Alert service error:", error.message);

   }

};