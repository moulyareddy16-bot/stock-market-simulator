import React from "react";

const CoinIcon = ({ className = "w-4 h-4", glow = true }) => {
  return (
    <span className={`inline-flex items-center justify-center font-black opacity-70 ${className}`}>
      $
    </span>
  );
};

export default CoinIcon;
