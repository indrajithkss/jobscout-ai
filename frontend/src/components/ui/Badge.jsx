import React from "react";

export default function Badge({ children, variant = "slate", score, className = "" }) {
  let finalVariant = variant;

  // Enforce Match Score Rules automatically when a score is provided
  if (score !== undefined) {
    if (score >= 90) finalVariant = "green";
    else if (score >= 75) finalVariant = "blue";
    else if (score >= 60) finalVariant = "yellow";
    else finalVariant = "red";
  }

  const variants = {
    green: "bg-success-green/10 text-success-green border border-success-green/20",
    blue: "bg-primary-blue/10 text-primary-blue border border-primary-blue/20",
    yellow: "bg-warning-yellow/10 text-warning-yellow border border-warning-yellow/20",
    red: "bg-error-red/10 text-error-red border border-error-red/20",
    slate: "bg-slate-800 text-text-sec border border-border-custom",
    primary: "bg-primary-blue text-text-main border border-primary-blue",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium tracking-wide border ${variants[finalVariant] || variants.slate} ${className}`}>
      {score !== undefined ? `${score}% Match` : children}
    </span>
  );
}
