import { Link } from "react-router-dom";
import CoinIcon from "./CoinIcon";

function StockCard({ stock }) {
  // Mocking some data that might not be in the stock object yet
  const price = stock.currentPrice || 154.20;
  const change = stock.change || "+2.45%";
  const isUp = !change.startsWith("-");

  return (
    <div className="glass-card p-6 rounded-2xl group transition-all hover:scale-[1.02] active:scale-[0.98]">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase">
            {stock.stockSymbol}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate max-w-[150px]">
            {stock.companyName}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-transform group-hover:rotate-12 ${
          isUp ? "bg-emerald-500/10" : "bg-red-500/10"
        }`}>
          {isUp ? "📈" : "📉"}
        </div>
      </div>

      <div className="mt-8 flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Price</p>
          <p className="text-2xl font-black text-white">${price.toFixed(2)}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">24h Change</p>
          <p className={`font-black ${isUp ? "text-emerald-400" : "text-red-400"}`}>
            {change}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-800/50 flex gap-2">
        <Link 
          to={`/stocks/${stock.stockSymbol}`}
          className="flex-1 btn-secondary py-2 text-xs flex items-center justify-center gap-2"
        >
          Details
        </Link>
        <Link 
          to={`/stocks/${stock.stockSymbol}`}
          className="flex-1 btn-primary py-2 text-xs flex items-center justify-center"
        >
          Trade Now
        </Link>
      </div>
    </div>
  );
}

export default StockCard;
