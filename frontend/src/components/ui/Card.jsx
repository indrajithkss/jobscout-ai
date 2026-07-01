import React from "react";

export default function Card({ children, className = "", onClick, hover = false }) {
  const baseStyles = "bg-card-bg border border-border-custom rounded-xl p-5 shadow-xs overflow-hidden";
  const hoverStyles = hover 
    ? "hover:border-slate-700 hover:shadow-lg transition-all duration-200 cursor-pointer hover:shadow-slate-950/40" 
    : "";

  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
