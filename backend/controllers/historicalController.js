import axios from "axios";


// GET HISTORICAL STOCK DATA

export const getStockHistory = async (req, res) => {

   try {

      const { symbol } = req.params;

      const { range } = req.query;

      let response;

      // =========================
      // 1D -> INTRADAY DATA
      // =========================

      if (range === "1D") {

         response = await axios.get(

            "https://www.alphavantage.co/query",

            {

               params: {

                  function: "TIME_SERIES_INTRADAY",

                  symbol,

                  interval: "5min",

                  outputsize: "full",

                  apikey: process.env.ALPHA_VANTAGE_API_KEY

               }

            }

         );

      }

      // =========================
      // OTHER RANGES -> DAILY DATA
      // =========================

      else {

         response = await axios.get(

            "https://www.alphavantage.co/query",

            {

               params: {

                  function: "TIME_SERIES_DAILY",

                  symbol,

                  outputsize: "full",

                  apikey: process.env.ALPHA_VANTAGE_API_KEY

               }

            }

         );

      }

      const data = response.data;

      // =========================
      // SELECT DATASET
      // =========================

      const timeSeries =

         range === "1D"

            ? data["Time Series (5min)"]

            : data["Time Series (Daily)"];


      // =========================
      // FALLBACK IF API LIMIT HIT
      // =========================

      if (!timeSeries) {

         console.log("AlphaVantage limit reached");

         const dummyData = [];

         const now = new Date();

         // ======================
         // 1D DUMMY
         // ======================

         if (range === "1D") {

            let currentPrice = 220;

            for (let i = 78; i >= 0; i--) {

               const time = new Date(

                  now.getTime() - i * 5 * 60000

               );

               currentPrice +=

                  Math.sin(i / 4) * 0.8 +

                  (Math.random() - 0.5) * 1.2;

               dummyData.push({

                  date: time.toISOString(),

                  price: Number(

                     currentPrice.toFixed(2)

                  )

               });

            }

         }

         // ======================
         // OTHER RANGES
         // ======================

         else {

            const totalPoints =

               range === "5D" ? 4 :

               range === "1M" ? 29 :

               range === "3M" ? 90 :

               range === "1Y" ? 250 : 500;

            let currentPrice = 220;

            for (let i = totalPoints; i >= 0; i--) {

               const day = new Date(

                  now.getTime() - i * 86400000

               );

               // smoother realistic movement

               currentPrice +=

                  Math.sin(i / 25) * 0.3 +

                  (Math.random() - 0.5) * 0.8;

               // prevent negative prices

               if (currentPrice < 50) {

                  currentPrice = 50;

               }

               dummyData.push({

                  date: day.toISOString(),

                  price: Number(

                     currentPrice.toFixed(2)

                  )

               });

            }

         }

         return res.status(200).json({

            success: true,

            data: dummyData

         });

      }

      // =========================
      // FORMAT REAL API DATA
      // =========================

      let formattedData = Object.entries(timeSeries).map(
   ([date, values]) => {

      let formattedDate = date;

      // 1D -> show time
      if (range === "1D") {

         formattedDate = new Date(date).toLocaleTimeString(
            [],
            {
               hour: "2-digit",
               minute: "2-digit"
            }
         );
      }

      // 5D -> weekday
      else if (range === "5D") {

         formattedDate = new Date(date).toLocaleDateString(
            [],
            { weekday: "short" }
         );
      }

      // 1M & 3M -> day + month
      else {

         formattedDate = new Date(date).toLocaleDateString(
            [],
            {
               day: "numeric",
               month: "short"
            }
         );
      }

      return {
         date: formattedDate,
         price: Number(values["4. close"])
      };
   }
);

      // OLDEST -> LATEST

      formattedData.reverse();

      // =========================
      // RANGE FILTERS
      // =========================

      switch (range) {

         case "1D":

            formattedData = formattedData.slice(-78);

            break;

         case "5D":

            formattedData = formattedData.slice(-5);

            break;

         case "1M":

            formattedData = formattedData.slice(-30);

            break;

         case "3M":

            formattedData = formattedData.slice(-12);

            break;

         case "1Y":

            formattedData = formattedData.slice(-12);

            break;

         case "MAX":

            formattedData = formattedData.slice(-20);

            break;

         default:

            formattedData = formattedData.slice(-30);

      }

      // =========================
      // SEND RESPONSE
      // =========================

      res.status(200).json({

         success: true,

         data: formattedData

      });

   }

   catch (error) {

      console.log(

         "Historical Error:",

         error.response?.data ||

         error.message

      );

      res.status(500).json({

         success: false,

         message: "Server Error"

      });

   }

};