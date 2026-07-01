// frontend/src/components/dashboard/WeeklyGoalCard.jsx
// Phase 7.5.1 – Weekly Goal Widget

import React from "react";
import { Target, Clock, TrendingUp, Zap, ArrowUpRight } from "lucide-react";

function WeeklyGoalSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-32 bg-slate-800 rounded" />
      <div className="h-4 w-full bg-slate-800 rounded" />
      <div className="flex gap-3">
        <div className="h-12 flex-1 bg-slate-800 rounded-xl" />
        <div className="h-12 flex-1 bg-slate-800 rounded-xl" />
      </div>
      <div className="h-16 bg-slate-800/40 border border-slate-700/30 rounded-xl" />
    </div>
  );
}

export default function WeeklyGoalCard({ data, loading }) {
  const goal = data?.weeklyGoal;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-border-custom p-5 shadow-xl h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
          <Target className="w-3.5 h-3.5 text-violet-400" />
        </div>
        <h3 className="text-sm font-bold text-text-main">Weekly Goal</h3>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[9px] text-violet-400 font-bold uppercase tracking-wider">
          AI Pick
        </span>
      </div>

      {loading || !goal ? (
        <WeeklyGoalSkeleton />
      ) : (
        <div className="flex flex-col gap-4 flex-1">
          {/* Skill name + demand chip */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-text-sec uppercase font-bold tracking-wider mb-1">
                Focus Skill This Week
              </p>
              <h4 className="text-xl font-extrabold text-text-main leading-tight">
                {goal.skill}
              </h4>
            </div>
            {goal.demandCount > 0 && (
              <span className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/25 text-[10px] text-violet-300 font-bold">
                <Zap className="w-2.5 h-2.5" />
                {goal.demandCount} jobs demand it
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-border-custom/50">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <p className="text-[9px] text-text-sec uppercase font-bold tracking-wider">
                  Est. Time
                </p>
                <p className="text-sm font-extrabold text-blue-400">
                  {goal.estimatedHours}h
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/50 border border-border-custom/50">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[9px] text-text-sec uppercase font-bold tracking-wider">
                  Score Gain
                </p>
                <p className="text-sm font-extrabold text-emerald-400">
                  +{goal.expectedScoreGain}pts
                </p>
              </div>
            </div>
          </div>

          {/* Action recommendation */}
          {goal.action && (
            <div className="mt-auto flex gap-3 p-3.5 rounded-xl bg-violet-500/6 border border-violet-500/20">
              <ArrowUpRight className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] text-violet-400 font-bold uppercase tracking-wider mb-1">
                  Recommended Action
                </p>
                <p className="text-xs text-text-sec leading-relaxed">{goal.action}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
