import React from "react";
import Card from "../ui/Card";

export default function StatCard({ title, value, icon: Icon, description, trend, trendType = "neutral" }) {
  const trendColors = {
    up: "text-success-green bg-success-green/10 border border-success-green/20",
    down: "text-error-red bg-error-red/10 border border-error-red/20",
    neutral: "text-text-sec bg-slate-800 border border-border-custom"
  };

  return (
    <Card className="flex flex-col justify-between h-full bg-card-bg border border-border-custom">
      <div className="flex items-start justify-between">
        <span className="text-xs sm:text-sm font-semibold text-text-sec">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-900 border border-border-custom text-text-sec shadow-xs">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
          {value}
        </h3>
        {description && (
          <p className="text-[10px] sm:text-xs text-text-sec flex items-center gap-1.5">
            {trend && (
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide ${trendColors[trendType]}`}>
                {trend}
              </span>
            )}
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}
