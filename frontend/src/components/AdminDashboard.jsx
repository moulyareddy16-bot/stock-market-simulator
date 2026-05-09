import { useEffect, useState } from "react";
import {
  getAllUsersForAdmin,
  toggleUserStatus,
  deleteUser,
  getUserTransactionsForAdmin,
  getUserPortfolioForAdmin
} from "../service/userService";
import { getAllStocks, getStockDetails } from "../service/stockService";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebar / Navigation State
  const [activeMenu, setActiveMenu] = useState("users"); // 'users' | 'stocks'

  // Stocks State
  const [stocks, setStocks] = useState([]);
  const [stockPage, setStockPage] = useState(1);
  const [totalStockPages, setTotalStockPages] = useState(1);
  const [stocksLoading, setStocksLoading] = useState(false);

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalTab, setModalTab] = useState("transactions"); // 'transactions' | 'portfolio'
  const [modalData, setModalData] = useState({ transactions: [], portfolio: [], summary: {} });
  const [modalLoading, setModalLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsersForAdmin();
      setUsers(response.payload);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchStocksData = async () => {
    try {
      setStocksLoading(true);
      const response = await getAllStocks(stockPage, ""); // empty search
      const stockList = response.payload || [];
      setTotalStockPages(response.totalPages || 1);

      // Fetch live details for each stock
      const detailedStocks = await Promise.all(
        stockList.map(async (stock) => {
          try {
            const details = await getStockDetails(stock.stockSymbol);
            return { ...stock, ...details.payload }; // Merge DB data and live data
          } catch (err) {
            console.error(`Failed to fetch details for ${stock.stockSymbol}`);
            return stock; // Return DB data if live fetch fails
          }
        })
      );

      setStocks(detailedStocks);
    } catch (err) {
      console.error("Failed to fetch stocks:", err);
    } finally {
      setStocksLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === "users") {
      fetchUsers();
    } else if (activeMenu === "stocks") {
      fetchStocksData();
    }
  }, [activeMenu, stockPage]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // --- ACTIONS ---

  const handleToggleStatus = async (userId) => {
    try {
      await toggleUserStatus(userId);
      fetchUsers(); // Refresh list
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to completely delete this user and all their transactions?")) {
      try {
        await deleteUser(userId);
        fetchUsers(); // Refresh list
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  const openUserDetails = async (user) => {
    setSelectedUser(user);
    setModalLoading(true);
    setModalTab("transactions");
    try {
      const [txRes, pfRes] = await Promise.all([
        getUserTransactionsForAdmin(user._id),
        getUserPortfolioForAdmin(user._id)
      ]);
      setModalData({
        transactions: txRes.payload,
        portfolio: pfRes.payload,
        summary: pfRes.summary
      });
    } catch (err) {
      alert("Failed to fetch user details");
      setSelectedUser(null);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#081c15]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#081c15]">
        <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-6 text-red-400">
          <h2 className="text-xl font-bold">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white">

      {/* Sidebar */}
      <div className="w-64 bg-[#0f172a]/50 backdrop-blur-md p-6 flex flex-col sticky top-16 h-[calc(100vh-64px)] border-r border-slate-700/50 z-20">
        <h2 className="text-2xl font-bold mb-10 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveMenu('users')}
            className={`flex items-center gap-3 p-3 rounded-xl transition ${activeMenu === 'users' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <span>👥</span> Users
          </button>
          <button
            onClick={() => setActiveMenu('stocks')}
            className={`flex items-center gap-3 p-3 rounded-xl transition ${activeMenu === 'stocks' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
          >
            <span>📈</span> Stocks
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-10 relative">

        {activeMenu === 'users' && (
          <>
            {/* Header */}
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h1 className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
                  Traders Information
                </h1>
                <p className="mt-2 text-slate-400">
                  System overview and traders management
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3 shadow-lg backdrop-blur-md">
                  <p className="text-sm text-slate-400">Total Traders</p>
                  <p className="text-2xl font-bold text-emerald-400">{users.length}</p>
                </div>
              </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 shadow-xl backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-slate-800/60 hover:shadow-emerald-500/10"
                >
                  {/* Status Badge */}
                  <div className="absolute right-4 top-4">
                    {user.isUserActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* User Info Header */}
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl font-bold text-white shadow-inner">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 line-clamp-1">
                        {user.username}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

                  {/* User Stats */}
                  <div className="flex-1 space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Wallet Balance</span>
                      <span className="font-semibold text-emerald-300">
                        {formatCurrency(user.walletBalance)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Total Transactions</span>
                      <span className="rounded-md bg-slate-700/50 px-2 py-0.5 text-sm font-medium text-slate-300">
                        {user.totalTransactions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Joined Date</span>
                      <span className="text-sm font-medium text-slate-300">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 mt-auto">
                    <button
                      onClick={() => openUserDetails(user)}
                      className="w-full rounded-lg bg-emerald-500/20 py-2 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/30 border border-emerald-500/50"
                    >
                      View Details
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(user._id)}
                        className={`flex-1 rounded-lg py-2 text-sm font-semibold transition border ${user.isUserActive ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30'}`}
                      >
                        {user.isUserActive ? "Block" : "Unblock"}
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="flex-1 rounded-lg bg-red-500/20 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/30 border border-red-500/50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeMenu === 'stocks' && (
          <>
            {/* Header */}
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h1 className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-4xl font-extrabold text-transparent sm:text-5xl">
                  Stocks Dashboard
                </h1>
                <p className="mt-2 text-slate-400">
                  Market overview and stock management
                </p>
              </div>
            </div>

            {/* Stocks Grid */}
            {stocksLoading ? (
              <div className="flex items-center justify-center p-20">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stocks.map((stock) => (
                  <div
                    key={stock._id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 shadow-xl backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-slate-800/60 hover:shadow-emerald-500/10"
                  >
                    {/* Status Badge */}
                    <div className="absolute right-4 top-4">
                      {stock.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
                          Inactive
                        </span>
                      )}
                    </div>

                    {/* Stock Info Header */}
                    <div className="mb-6 flex items-center gap-4">
                      {stock.logo ? (
                        <img src={stock.logo} alt={stock.stockSymbol} className="h-12 w-12 rounded-full object-contain bg-white p-1" />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl font-bold text-white shadow-inner">
                          {stock.stockSymbol.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-slate-100 line-clamp-1">
                          {stock.stockSymbol}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {stock.companyName}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>

                    {/* Stock Stats */}
                    <div className="flex-1 space-y-3 mb-6 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Current Price</span>
                        <span className="font-semibold text-white">
                          {stock.c ? `$${stock.c.toFixed(2)}` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Change</span>
                        <span className={`font-semibold ${stock.d >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {stock.d ? `${stock.d >= 0 ? '+' : ''}${stock.d.toFixed(2)} (${stock.dp.toFixed(2)}%)` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Prev Close</span>
                        <span className="text-slate-300">{stock.pc ? `$${stock.pc.toFixed(2)}` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Day High/Low</span>
                        <span className="text-slate-300">{stock.h ? `$${stock.h.toFixed(2)} / $${stock.l.toFixed(2)}` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Available Qty</span>
                        <span className="text-slate-300 font-medium">{stock.availableQuantity}</span>
                      </div>
                    </div>

                    {/* Actions (Optional or just info) */}
                    <div className="mt-auto text-xs text-slate-500 text-center">
                      Last updated: {stock.t ? new Date(stock.t * 1000).toLocaleTimeString() : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => setStockPage(Math.max(1, stockPage - 1))}
                disabled={stockPage === 1}
                className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-white disabled:opacity-40 transition hover:bg-slate-700"
              >
                Previous
              </button>
              <span className="flex items-center text-slate-400">
                Page {stockPage} of {totalStockPages}
              </span>
              <button
                onClick={() => setStockPage(Math.min(totalStockPages, stockPage + 1))}
                disabled={stockPage === totalStockPages}
                className="rounded-xl bg-slate-800 border border-slate-700 px-4 py-2 text-white disabled:opacity-40 transition hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* --- USER DETAILS MODAL --- */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-[#0f172a] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

              {/* Modal Header */}
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedUser.username}'s Details
                  </h2>
                  <p className="text-sm text-slate-400">{selectedUser.email}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-slate-400 hover:text-white transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              {modalLoading ? (
                <div className="flex-1 flex items-center justify-center p-20">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="flex-1 overflow-auto flex flex-col">

                  {/* Tabs */}
                  <div className="flex border-b border-slate-700 px-6 pt-4 bg-slate-800/20">
                    <button
                      onClick={() => setModalTab("transactions")}
                      className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${modalTab === "transactions" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
                    >
                      Transactions ({modalData.transactions.length})
                    </button>
                    <button
                      onClick={() => setModalTab("portfolio")}
                      className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${modalTab === "portfolio" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-400 hover:text-slate-200"}`}
                    >
                      Portfolio ({modalData.portfolio.length})
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">

                    {/* TRANSACTIONS TAB */}
                    {modalTab === "transactions" && (
                      <div className="overflow-x-auto rounded-xl border border-slate-700">
                        <table className="w-full text-left text-sm text-slate-300">
                          <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-700">
                            <tr>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4">Symbol</th>
                              <th className="px-6 py-4">Type</th>
                              <th className="px-6 py-4">Quantity</th>
                              <th className="px-6 py-4">Price/Share</th>
                              <th className="px-6 py-4">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {modalData.transactions.length === 0 ? (
                              <tr><td colSpan="6" className="text-center py-6 text-slate-500">No transactions found.</td></tr>
                            ) : (
                              modalData.transactions.map((tx) => (
                                <tr key={tx._id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition">
                                  <td className="px-6 py-4 whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                                  <td className="px-6 py-4 font-bold text-white">{tx.stockSymbol}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${tx.transactionType === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                      {tx.transactionType}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">{tx.quantity}</td>
                                  <td className="px-6 py-4">{formatCurrency(tx.pricePerShare)}</td>
                                  <td className="px-6 py-4 font-medium">{formatCurrency(tx.totalAmount)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* PORTFOLIO TAB */}
                    {modalTab === "portfolio" && (
                      <div>
                        {/* Portfolio Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <p className="text-xs text-slate-400 mb-1">Total Investment</p>
                            <p className="text-lg font-bold">{formatCurrency(modalData.summary.totalInvestment)}</p>
                          </div>
                          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <p className="text-xs text-slate-400 mb-1">Current Value</p>
                            <p className="text-lg font-bold">{formatCurrency(modalData.summary.totalCurrentValue)}</p>
                          </div>
                          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <p className="text-xs text-slate-400 mb-1">Total P/L</p>
                            <p className={`text-lg font-bold ${modalData.summary.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {modalData.summary.totalProfit >= 0 ? '+' : ''}{formatCurrency(modalData.summary.totalProfit)}
                            </p>
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-700">
                          <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-800/50 text-xs uppercase text-slate-400 border-b border-slate-700">
                              <tr>
                                <th className="px-6 py-4">Symbol</th>
                                <th className="px-6 py-4">Owned Qty</th>
                                <th className="px-6 py-4">Avg Buy</th>
                                <th className="px-6 py-4">Current Price</th>
                                <th className="px-6 py-4">P/L</th>
                              </tr>
                            </thead>
                            <tbody>
                              {modalData.portfolio.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-6 text-slate-500">No active holdings.</td></tr>
                              ) : (
                                modalData.portfolio.map((stock) => (
                                  <tr key={stock.stockSymbol} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition">
                                    <td className="px-6 py-4 font-bold text-white">{stock.stockSymbol}</td>
                                    <td className="px-6 py-4">{stock.ownedQuantity}</td>
                                    <td className="px-6 py-4">{formatCurrency(stock.avgPrice)}</td>
                                    <td className="px-6 py-4">{formatCurrency(stock.currentPrice)}</td>
                                    <td className={`px-6 py-4 font-medium ${stock.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {stock.profitLoss >= 0 ? '+' : ''}{formatCurrency(stock.profitLoss)} ({stock.profitPercent.toFixed(2)}%)
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
