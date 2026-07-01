// frontend/src/components/dashboard/SkillRoadmapCard.jsx
// Phase 7.5.1 – Skill Roadmap Widget

import React from "react";
import { Map, Clock, BarChart2 } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function impactStyle(impact) {
  switch (impact) {
    case "High":   return "bg-red-500/15 border-red-500/30 text-red-400";
    case "Medium": return "bg-amber-500/15 border-amber-500/30 text-amber-400";
    default:       return "bg-slate-700/60 border-slate-600/40 text-slate-300";
  }
}

function priorityColor(priority) {
  if (priority === 1) return "bg-gradient-to-br from-amber-400 to-orange-500 text-black";
  if (priority === 2) return "bg-gradient-to-br from-slate-400 to-slate-500 text-white";
  if (priority === 3) return "bg-gradient-to-br from-amber-700 to-orange-800 text-white";
  return "bg-slate-800 border border-border-custom text-slate-400";
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkillRoadmapSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40">
          <div className="w-6 h-6 rounded-lg bg-slate-700 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between">
              <div className="h-3 w-24 bg-slate-700 rounded" />
              <div className="h-5 w-14 bg-slate-700 rounded-full" />
            </div>
            <div className="h-1 bg-slate-700 rounded-full" />
          </div>
          <div className="h-5 w-10 bg-slate-700 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Skill Row ───────────────────────────────────────────────────────────────

function SkillRow({ skill, demandCount, matchImpact, priority, estimatedHours, maxDemand }) {
  const barWidth = maxDemand > 0 ? Math.round((demandCount / maxDemand) * 100) : 0;
  const barColor =
    matchImpact === "High"   ? "bg-gradient-to-r from-red-500 to-rose-400" :
    matchImpact === "Medium" ? "bg-gradient-to-r from-amber-500 to-yellow-400" :
                               "bg-gradient-to-r from-slate-500 to-slate-400";

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-border-custom/30 hover:border-border-custom hover:bg-slate-800/50 transition-all duration-200 group">
      {/* Priority badge */}
      <div
        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black flex-shrink-0 ${priorityColor(priority)}`}
      >
        {priority}
      </div>

      {/* Skill info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-xs font-semibold text-text-main truncate group-hover:text-blue-300 transition-colors">
            {skill}
          </span>
          <span className={`flex-shrink-0 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${impactStyle(matchImpact)}`}>
            {matchImpact}
          </span>
        </div>
        {/* Demand bar */}
        <div className="h-1 bg-slate-700/60 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Hours chip */}
      <div className="flex items-center gap-1 flex-shrink-0 text-[9px] text-slate-400 font-medium">
        <Clock className="w-2.5 h-2.5" />
        {estimatedHours}h
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SkillRoadmapCard({ data, loading }) {
  const roadmap = data?.skillRoadmap || [];
  const maxDemand = roadmap.length > 0 ? Math.max(...roadmap.map((s) => s.demandCount)) : 1;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-border-custom p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
            <Map className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <h3 className="text-sm font-bold text-text-main">Skill Roadmap</h3>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[9px] text-text-sec">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" /> Low
            </span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-text-sec">
            <BarChart2 className="w-3 h-3" />
            <span>by demand</span>
          </div>
        </div>
      </div>

      {loading ? (
        <SkillRoadmapSkeleton />
      ) : roadmap.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Map className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-xs text-text-sec max-w-xs">
            Run a Scout Scan to generate your personalised skill roadmap.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {roadmap.map((item) => (
            <SkillRow
              key={item.skill}
              {...item}
              maxDemand={maxDemand}
            />
          ))}
        </div>
      )}
    </div>
  );
}
