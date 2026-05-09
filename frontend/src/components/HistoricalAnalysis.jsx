import { useEffect, useState } from "react";
import axios from "axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const ranges = ["1D", "5D", "1M", "1Y", "MAX"];

function HistoricalAnalysis({ symbol }) {
  const [data, setData] = useState([]);
  const [range, setRange] = useState("1M");
  const [loading, setLoading] = useState(false);

  const fetchHistoricalData = async (selectedRange) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:5000/api/historical/history/${symbol}?range=${selectedRange}`
      );

      if (response.data.success) {
        setData(response.data.data);
      } else {
        setData([]);
      }

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData(range);
  }, [range, symbol]);

  return (
    <div className="rounded-2xl bg-slate-800 p-6">

      {/* TOP BAR */}
      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-2xl font-bold text-white">
          Historical Analysis
        </h2>

        {/* RANGE BUTTONS */}
        <div className="flex gap-2">

          {ranges.map((item) => (
            <button
              key={item}
              onClick={() => setRange(item)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all
                ${
                  range === item
                    ? "bg-green-500 text-black"
                    : "bg-slate-700 text-white hover:bg-slate-600"
                }`}
            >
              {item}
            </button>
          ))}

        </div>
      </div>

      {/* CHART */}
      <div className="h-[500px] w-full">

        {loading ? (
          <div className="flex h-full items-center justify-center text-white">
            Loading...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">

            <LineChart data={data}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
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

              <YAxis domain={["auto", "auto"]} />

              <Tooltip 
                labelFormatter={(value) => {
                  const date = new Date(value);
                  if (isNaN(date.getTime())) return value;
                  if (range === "1D") {
                    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  }
                  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
                }}
                formatter={(value) => [`₹${Number(value).toFixed(2)}`, "Price"]}
              />

              <Line
                type="monotone"
                dataKey="price"
                stroke="#22c55e"
                strokeWidth={3}
                dot={false}
              />

            </LineChart>

          </ResponsiveContainer>
        )}

      </div>
    </div>
  );
}

export default HistoricalAnalysis;