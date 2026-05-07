import { useEffect, useState } from "react";
import api from "../service/api";

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.get("/portfolio");

        setPortfolio(res.data.payload || []);
        setSummary(res.data.summary || null);
        setStatus("success");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load portfolio");
        setStatus("error");
      }
    };

    fetchPortfolio();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-full bg-slate-950 p-6 text-white">
        Loading portfolio...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-full bg-slate-950 p-6 text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Portfolio</h1>

        {summary && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Investment</p>
              <p className="mt-2 text-2xl font-semibold">
                ${summary.totalInvestment?.toFixed(2) || "0.00"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Current Value</p>
              <p className="mt-2 text-2xl font-semibold">
                ${summary.totalCurrentValue?.toFixed(2) || "0.00"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="text-sm text-slate-400">Profit / Loss</p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  summary.totalProfit >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                ${summary.totalProfit?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-lg border border-slate-800">
          <table className="w-full border-collapse bg-slate-900 text-left">
            <thead className="bg-slate-800 text-sm text-slate-300">
              <tr>
                <th className="p-4">Symbol</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Average Price</th>
                <th className="p-4">Current Price</th>
                <th className="p-4">Profit / Loss</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.length === 0 ? (
                <tr>
                  <td className="p-4 text-slate-400" colSpan="5">
                    No portfolio holdings yet.
                  </td>
                </tr>
              ) : (
                portfolio.map((stock) => (
                  <tr key={stock.stockSymbol} className="border-t border-slate-800">
                    <td className="p-4 font-semibold">{stock.stockSymbol}</td>
                    <td className="p-4">{stock.ownedQuantity}</td>
                    <td className="p-4">${stock.avgPrice?.toFixed(2)}</td>
                    <td className="p-4">${stock.currentPrice?.toFixed(2)}</td>
                    <td
                      className={`p-4 ${
                        stock.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      ${stock.profitLoss?.toFixed(2)} ({stock.profitPercent?.toFixed(2)}%)
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
