import { useEffect, useState } from "react";
import api from "../service/api";
import { TableSkeleton } from "./Skeleton";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const res = await api.get("/transactions/history");
        setTransactions(res.data.payload || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) return <div className="p-10"><TableSkeleton rows={10} /></div>;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      <header>
        <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Transaction History</h1>
        <p className="text-slate-400 mt-1 font-medium">Keep track of all your simulated trading activity</p>
      </header>

      <section className="glass-card rounded-[2.5rem] overflow-hidden border-slate-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Quantity</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Price</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {transactions.length === 0 ? (
                <tr>
                  <td className="px-8 py-10 text-center text-slate-500 font-medium" colSpan="6">
                    No trading activity found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        tx.transactionType === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${tx.transactionType === "BUY" ? "bg-emerald-400" : "bg-red-400"}`} />
                        {tx.transactionType}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-white uppercase">{tx.stockSymbol}</p>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-white">{tx.quantity}</td>
                    <td className="px-8 py-6 text-right font-medium text-slate-400">${tx.pricePerShare?.toFixed(2)}</td>
                    <td className="px-8 py-6 text-right font-black text-white">${tx.totalAmount?.toFixed(2)}</td>
                    <td className="px-8 py-6 text-right font-medium text-slate-500 text-sm">
                      {new Date(tx.createdAt).toLocaleDateString()}
                      <span className="block text-[10px] uppercase">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Transactions;