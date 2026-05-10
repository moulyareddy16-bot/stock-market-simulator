import React from "react";

const CoinIcon = ({ className = "w-4 h-4", glow = true }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className} group`}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2.5" />
        <path d="M12 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      {glow && (
        <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
};

export default CoinIcon;
