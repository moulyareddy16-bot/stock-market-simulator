import {

   ResponsiveContainer,
   AreaChart,
   Area,
   XAxis,
   YAxis,
   Tooltip,
   CartesianGrid

} from "recharts";


function StockChart({

   chartData,
   range

}) {

   // EMPTY STATE

   if (!chartData || chartData.length === 0) {

      return (

         <div className="flex h-full items-center justify-center text-slate-400">

            Waiting for realtime live price data.

         </div>

      );

   }

   const tickCount =
   range === "5D"
      ? 5
      : range === "1M"
      ? 6
      : range === "3M"
      ? 7
      : "auto";

   return (

      <div className="h-full w-full pb-6">

         <ResponsiveContainer
            width="100%"
            height="100%"
         >

            <AreaChart
               data={chartData}
               margin={{
                  top: 20,
                  right: 20,
                  left: 0,
                  bottom: 30
               }}
            >

               {/* GRADIENT */}

               <defs>

                  <linearGradient
                     id="colorPrice"
                     x1="0"
                     y1="0"
                     x2="0"
                     y2="1"
                  >

                     <stop
                        offset="5%"
                        stopColor="#4ade80"
                        stopOpacity={0.4}
                     />

                     <stop
                        offset="95%"
                        stopColor="#4ade80"
                        stopOpacity={0}
                     />

                  </linearGradient>

               </defs>


               {/* GRID */}

               <CartesianGrid

                  strokeDasharray="3 3"

                  stroke="#334155"

                  vertical={false}

               />


               {/* X AXIS */}

               <XAxis
   dataKey="date"
   stroke="#94a3b8"
   tick={{ fontSize: 12 }}
   interval="preserveStartEnd"
   minTickGap={50}
   tickFormatter={(value) => {
      if (range === "LIVE") return value;

      const date = new Date(value);
      if (isNaN(date.getTime())) return value;

      if (range === "1D") {
         return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      if (range === "5D") {
         return date.toLocaleDateString([], { weekday: "short" });
      }
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
   }}
/>


               {/* Y AXIS */}

               <YAxis
   stroke="#94a3b8"
   tick={{ fontSize: 12 }}
   domain={[
      (dataMin) => dataMin - 5,
      (dataMax) => dataMax + 5
   ]}
/>


               {/* TOOLTIP */}

               <Tooltip

   labelFormatter={(value) => {
      if (range === "LIVE") return value;

      const date = new Date(value);

      // If value is already a formatted string (like '10:30 AM' or 'Mon'), it will be invalid date
      if (isNaN(date.getTime())) {
         return value;
      }

      // 1D FORMAT

      if (range === "1D") {

         return date.toLocaleTimeString([], {

            hour: "2-digit",
            minute: "2-digit"

         });

      }

      // OTHER RANGES

      return date.toLocaleDateString([], {

         day: "numeric",
         month: "short",
         year: "numeric"

      });

   }}

   formatter={(value) => [
      `$${Number(value).toFixed(2)}`,
      "Price"
   ]}

   contentStyle={{

      backgroundColor: "#0f172a",

      border: "1px solid #334155",

      borderRadius: "10px",

      color: "#fff"

   }}

/>


               {/* AREA */}

               <Area

                  type="linear"

                  dataKey="price"

                  stroke="#86efac"

                  fill="url(#colorPrice)"

                  strokeWidth={3}

                  dot={false}

                  activeDot={{

                     r: 5

                  }}

               />

            </AreaChart>

         </ResponsiveContainer>

      </div>

   );

}

export default StockChart;