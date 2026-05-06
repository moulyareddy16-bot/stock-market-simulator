import { useEffect, useState } from "react";
import axios from "axios";

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);

  const [buyForm, setBuyForm] = useState({
    stockSymbol: "",
    quantity: "",
    buyPrice: "",
  });

  const token = localStorage.getItem("token");

  // 📊 FETCH PORTFOLIO
  const fetchPortfolio = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/portfolio",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPortfolio(res.data);
    } catch (err) {
      console.log("Fetch error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // 💰 BUY STOCK
  const handleBuy = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/trade/buy",
        buyForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Stock Bought Successfully!");

      setBuyForm({
        stockSymbol: "",
        quantity: "",
        buyPrice: "",
      });

      fetchPortfolio();
    } catch (err) {
      console.log("Buy error:", err.response?.data || err.message);
    }
  };

  // 📉 SELL STOCK
  const handleSell = async (symbol, qty) => {
    try {
      await axios.post(
        "http://localhost:5000/api/trade/sell",
        {
          stockSymbol: symbol,
          quantity: qty,
          sellPrice: 100, // replace with live price later
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Stock Sold Successfully!");
      fetchPortfolio();
    } catch (err) {
      console.log("Sell error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6">

      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-6">
        📊 My Portfolio
      </h1>

      {/* ================= BUY SECTION ================= */}
      <div className="bg-[#111827] p-4 rounded-xl mb-6">

        <h2 className="text-xl mb-3">💰 Buy Stock</h2>

        <input
          placeholder="Symbol"
          value={buyForm.stockSymbol}
          onChange={(e) =>
            setBuyForm({ ...buyForm, stockSymbol: e.target.value })
          }
          className="p-2 m-1 text-black"
        />

        <input
          placeholder="Qty"
          value={buyForm.quantity}
          onChange={(e) =>
            setBuyForm({ ...buyForm, quantity: e.target.value })
          }
          className="p-2 m-1 text-black"
        />

        <input
          placeholder="Price"
          value={buyForm.buyPrice}
          onChange={(e) =>
            setBuyForm({ ...buyForm, buyPrice: e.target.value })
          }
          className="p-2 m-1 text-black"
        />

        <button
          onClick={handleBuy}
          className="bg-green-500 px-4 py-2 ml-2"
        >
          BUY
        </button>
      </div>

      {/* ================= PORTFOLIO TABLE ================= */}
      <div className="bg-[#111827] rounded-xl p-4 overflow-x-auto">

        <h2 className="text-xl mb-4">📦 Holdings</h2>

        <table className="w-full text-left">

          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="py-2">Symbol</th>
              <th>Name</th>
              <th>Qty</th>
              <th>Avg Price</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {portfolio.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-4 text-gray-400">
                  No stocks yet. Start trading 🚀
                </td>
              </tr>
            ) : (
              portfolio.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-gray-800 hover:bg-gray-800"
                >
                  <td className="py-2 font-bold">
                    {item.stockSymbol}
                  </td>
                  <td>{item.stockName}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.avgBuyPrice}</td>

                  <td>
                    <button
                      onClick={() =>
                        handleSell(item.stockSymbol, item.quantity)
                      }
                      className="bg-red-500 px-3 py-1 rounded"
                    >
                      SELL
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}

export default Portfolio;