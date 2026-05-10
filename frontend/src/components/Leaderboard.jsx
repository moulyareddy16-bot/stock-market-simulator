import { useEffect, useState } from "react";
import axios from "axios";

import CoinIcon from "./CoinIcon";

function Leaderboard() {

  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaderboard = async () => {

    try {

      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/trader-api/leaderboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLeaders(response.data.payload || []);

    } catch (err) {

      console.log(err);

      setError(
        err.response?.data?.message ||
        "Failed to load leaderboard"
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-8">

        <h1 className="text-4xl font-black mb-8">
          Global Leaderboard
        </h1>

        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl bg-slate-900 h-24 border border-slate-800"
            />
          ))}
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">

        <div className="text-center">

          <h2 className="text-3xl font-bold text-red-400">
            Error
          </h2>

          <p className="mt-3 text-slate-400">
            {error}
          </p>

          <button
            onClick={fetchLeaderboard}
            className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-black"
          >
            Retry
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-8">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">

        <div>
          <h1 className="text-4xl font-black">
            Trader Leaderboard
          </h1>

          <p className="mt-2 text-slate-400">
            Top performing traders ranked globally
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3">
          <p className="text-sm text-slate-300">
            Live Competition
          </p>

          <h2 className="text-2xl font-black text-emerald-400">
            {leaders.length} Traders
          </h2>
        </div>
      </div>

      {/* TOP 3 */}
      {leaders.length >= 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-10">

          {/* SECOND */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 order-2 lg:order-1 hover:-translate-y-1 transition">

            <div className="text-center">

              <div className="text-5xl mb-3">
                🥈
              </div>

              <h2 className="text-2xl font-black">
                {leaders[1]?.username}
              </h2>

              <p className="text-slate-400 mt-1">
                Rank #2
              </p>

              <div className="mt-5 text-4xl font-black text-emerald-400">
                {leaders[1]?.score}
              </div>

              <p className="text-slate-500 text-sm">
                Trader Score
              </p>

            </div>
          </div>

          {/* FIRST */}
          <div className="rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-slate-900 p-8 scale-105 hover:-translate-y-1 transition order-1 lg:order-2">

            <div className="text-center">

              <div className="text-6xl mb-3">
                👑
              </div>

              <h2 className="text-3xl font-black">
                {leaders[0]?.username}
              </h2>

              <p className="text-yellow-400 mt-1 font-semibold">
                Global #1 Trader
              </p>

              <div className="mt-6 text-5xl font-black text-emerald-400">
                {leaders[0]?.score}
              </div>

              <p className="text-slate-400 mt-2">
                Elite Trader Score
              </p>

            </div>
          </div>

          {/* THIRD */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 order-3 hover:-translate-y-1 transition">

            <div className="text-center">

              <div className="text-5xl mb-3">
                🥉
              </div>

              <h2 className="text-2xl font-black">
                {leaders[2]?.username}
              </h2>

              <p className="text-slate-400 mt-1">
                Rank #3
              </p>

              <div className="mt-5 text-4xl font-black text-emerald-400">
                {leaders[2]?.score}
              </div>

              <p className="text-slate-500 text-sm">
                Trader Score
              </p>

            </div>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">

        <div className="grid grid-cols-6 border-b border-slate-800 bg-slate-950 px-6 py-4 text-sm font-bold text-slate-400">

          <div>Rank</div>
          <div>Trader</div>
          <div>Score</div>
          <div>Profit/Loss</div>
          <div>Trades</div>
          <div>Status</div>

        </div>

        {leaders.map((trader, index) => (

          <div
            key={trader._id}
            className="grid grid-cols-6 items-center border-b border-slate-800 px-6 py-5 transition hover:bg-slate-800/40"
          >

            <div className="font-black text-lg">
              #{index + 1}
            </div>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-lg font-black text-emerald-400">
                {trader.username?.charAt(0)}
              </div>

              <div>
                <h3 className="font-bold">
                  {trader.username}
                </h3>

                <p className="text-xs text-slate-500">
                  Trader
                </p>
              </div>
            </div>

            <div className="text-xl font-black text-emerald-400">
              {trader.score}
            </div>

            <div className={`font-semibold ${trader.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {trader.totalProfit >= 0 ? "+" : ""}${trader.totalProfit?.toFixed(2)}
            </div>


            <div>
              {trader.totalTrades}
            </div>

            <div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                ACTIVE
              </span>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}

export default Leaderboard;