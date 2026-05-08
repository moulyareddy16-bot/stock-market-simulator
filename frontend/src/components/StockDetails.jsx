import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { getSingleStock } from "../service/stockService";
import { buyStock, sellStock } from "../service/tradeService";

import { socket } from "../socket/socket";
import StockChart from "./StockChart";

function StockDetails() {

   // =========================
   // PARAMS
   // =========================

   const { stockSymbol } = useParams();

   // =========================
   // STATES
   // =========================

   const [stock, setStock] = useState(null);

   const [livePrice, setLivePrice] = useState(null);

   const [liveChartData, setLiveChartData] = useState([]);

   const [historicalData, setHistoricalData] = useState([]);

   const [selectedRange, setSelectedRange] = useState("1D");

   const [showHistorical, setShowHistorical] = useState(false);

   const [historyLoading, setHistoryLoading] = useState(false);

   const [quantity, setQuantity] = useState(1);

   const [loading, setLoading] = useState(false);

   const role = localStorage.getItem("role");

   // =========================
   // REF
   // =========================

   const historicalSectionRef = useRef(null);

   // =========================
   // FETCH STOCK DETAILS
   // =========================

   const fetchStock = async () => {

      try {

         const data = await getSingleStock(stockSymbol);

         setStock(data.payload);

         setLivePrice(
            Number(data.payload.currentPrice).toFixed(2)
         );

      }

      catch (error) {

         console.log(error);

      }

   };

   // =========================
   // INITIAL LOAD
   // =========================

   useEffect(() => {

      fetchStock();

   }, [stockSymbol]);

   // =========================
   // INITIAL LIVE GRAPH
   // =========================

   useEffect(() => {

      if (liveChartData.length === 0 && stock?.currentPrice) {

         const dummy = [];

         for (let i = 0; i < 15; i++) {

            dummy.push({

               date: new Date(
                  Date.now() - (15 - i) * 60000
               ).toTimeString().split(' ')[0],

               price:
                  Number(stock.currentPrice) +
                  (Math.random() * 2 - 1)

            });

         }

         setLiveChartData(dummy);

      }

   }, [stock]);

   // =========================
   // SOCKET LIVE UPDATES
   // =========================

   useEffect(() => {

      socket.on("stockUpdates", (data) => {

         let liveStock = null;

         // ARRAY

         if (Array.isArray(data)) {

            liveStock = data.find(

               (item) =>
                  item.stockSymbol === stockSymbol

            );

         }

         // SINGLE OBJECT

         else if (data?.stockSymbol === stockSymbol) {

            liveStock = data;

         }

         // UPDATE GRAPH

         if (liveStock) {

            const latestPrice = Number(
               liveStock.currentPrice
            );

            setLivePrice(latestPrice.toFixed(2));

            setLiveChartData((prevData) => {

               const updated = [

                  ...prevData,

                  {

                     date: new Date().toTimeString().split(' ')[0],

                     price: Number(latestPrice.toFixed(2))

                  }

               ];

               return updated.slice(-10);

            });

         }

      });

      return () => {

         socket.off("stockUpdates");

      };

   }, [stockSymbol]);

   // =========================
   // FETCH HISTORICAL
   // =========================

   const fetchHistoricalData = async (rangeValue) => {

      try {

         setHistoryLoading(true);

         const response = await axios.get(

            `http://localhost:5000/api/historical/history/${stockSymbol}?range=${rangeValue}`

         );

         if (response.data.success) {

            setHistoricalData(response.data.data);

         }

         else {

            setHistoricalData([]);

         }

      }

      catch (error) {

         console.log(error);

         setHistoricalData([]);

      }

      finally {

         setHistoryLoading(false);

      }

   };

   // =========================
   // RANGE CHANGE
   // =========================

   const handleRangeChange = (rangeValue) => {

      if(rangeValue === selectedRange) return;

      setSelectedRange(rangeValue);

   };

   // =========================
   // AUTO FETCH HISTORY
   // =========================

   useEffect(() => {

      if (showHistorical) {

         fetchHistoricalData(selectedRange);

      }

   }, [selectedRange, stockSymbol, showHistorical]);

   // =========================
   // BUY
   // =========================

   const handleBuy = async () => {

      try {

         setLoading(true);

         await buyStock({

            stockSymbol,

            quantity

         });

         alert("Stock Bought Successfully");

      }

      catch (error) {

         console.log(error);

         alert("Failed To Buy");

      }

      finally {

         setLoading(false);

      }

   };

   // =========================
   // SELL
   // =========================

   const handleSell = async () => {

      try {

         setLoading(true);

         await sellStock({

            stockSymbol,

            quantity

         });

         alert("Stock Sold Successfully");

      }

      catch (error) {

         console.log(error);

         alert("Failed To Sell");

      }

      finally {

         setLoading(false);

      }

   };

   // =========================
   // LOADING
   // =========================

   if (!stock) {

      return (

         <div className="flex min-h-screen items-center justify-center bg-slate-900 text-2xl text-white">

            Loading...

         </div>

      );

   }

   // =========================
   // UI
   // =========================

   return (

      <div className="min-h-screen bg-slate-900 p-5 text-white">

         {/* TOP SECTION */}

         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-10">

            {/* LEFT BOX */}

            <div className="rounded-2xl bg-slate-800 p-8 shadow-lg h-[420px] flex flex-col justify-between">

               <div>

                  <h1 className="text-5xl font-bold text-white mb-2">

                     {stock.stockSymbol}

                  </h1>

                  <p className="mb-12 text-2xl text-slate-300">

                     {stock.companyName}

                  </p>

                  <div className="mt-10">

                     <h2 className="text-lg text-slate-400">

                        Live Market Price

                     </h2>

                     <p className="text-6xl font-bold text-emerald-400 mb-3">

                        ₹ {livePrice}

                     </p>

                     <div className="mt-3 flex items-center gap-2">

                        <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-400"></div>

                        <p className="text-sm text-emerald-300">

                           Live Updating

                        </p>

                     </div>

                  </div>

               </div>

               <button

                  onClick={() => {

                     setShowHistorical(true);

                     setTimeout(() => {

                        historicalSectionRef.current?.scrollIntoView({

                           behavior: "smooth"

                        });

                     }, 200);

                  }}

                  className="mt-8 w-full rounded-xl bg-emerald-500 py-3 font-semibold text-black transition hover:bg-emerald-400"

               >

                  View Historical Analysis

               </button>

            </div>

            {/* LIVE GRAPH */}

            <div className="rounded-2xl bg-slate-800 p-5 shadow-lg lg:col-span-2">

               <h2 className="mb-5 text-2xl font-bold">

                  Live Price Movement

               </h2>

               <div className="h-[320px] w-full">

                  <StockChart

                     chartData={liveChartData}

                     range="LIVE"

                  />

               </div>

            </div>

         </div>

         {/* TRADING */}

         {role === "trader" && (

            <div className="mt-6 rounded-2xl bg-slate-800 p-6 shadow-lg">

               <h2 className="text-2xl font-bold">

                  Trading

               </h2>

               <input

                  type="number"

                  min="1"

                  value={quantity}

                  onChange={(e) =>

                     setQuantity(Number(e.target.value))

                  }

                  className="mt-5 w-full rounded-xl bg-slate-700 p-3 text-white outline-none"

                  placeholder="Quantity"

               />

               <div className="mt-5 flex gap-4">

                  <button

                     onClick={handleBuy}

                     disabled={loading}

                     className="flex-1 rounded-xl bg-emerald-500 py-3 font-semibold text-black hover:bg-emerald-400"

                  >

                     Buy

                  </button>

                  <button

                     onClick={handleSell}

                     disabled={loading}

                     className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white hover:bg-red-400"

                  >

                     Sell

                  </button>

               </div>

            </div>

         )}

         {/* HISTORICAL */}

         {showHistorical && (

            <div

               ref={historicalSectionRef}

               className="mt-8 rounded-2xl bg-slate-800 p-6 shadow-lg"

            >

               <h2 className="text-3xl font-bold">

                  Historical Analysis

               </h2>

               {/* BUTTONS */}

               <div className="mt-6 flex flex-wrap gap-3">

                  {[

                     "1D",

                     "5D",

                     "1M",

                     "3M",

                     "1Y",

                     "MAX"

                  ].map((item) => (

                     <button

                        key={item}

                        onClick={() =>
                           handleRangeChange(item)
                        }

                        className={`rounded-xl px-5 py-2 font-semibold transition-all

                        ${selectedRange === item

                              ? "bg-emerald-400 text-black"

                              : "bg-slate-700 text-white hover:bg-slate-600"

                           }`}

                     >

                        {item}

                     </button>

                  ))}

               </div>

               {/* GRAPH */}

               <div className="mt-8 h-[550px] rounded-2xl bg-slate-900 p-5">

                  {historyLoading ? (

                     <div className="flex h-full items-center justify-center text-xl text-white">

                        Loading historical data...

                     </div>

                  ) : (

                     <StockChart

                        chartData={historicalData}

                        range={selectedRange}

                     />

                  )}

               </div>

            </div>

         )}

      </div>

   );

}

export default StockDetails;