// frontend/src/components/dashboard/CareerBriefCard.jsx
// Phase 7.0 – AI Daily Career Brief Card
// Self-contained — fetches /api/jobs/daily-summary on mount and on refreshTrigger change.

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  TrendingUp,
  Briefcase,
  Star,
  Layers,
  ExternalLink,
  ChevronRight,
  Clock,
  Lightbulb,
  RefreshCw,
  Zap,
} from "lucide-react";
import { jobsApi } from "../../services/jobsApi";
import Badge from "../ui/Badge";

/* ─── Skeleton sub-component ─────────────────────────────────── */
function CareerBriefSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      {/* Stat pills */}
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 flex-1 rounded-xl bg-slate-800/60" />
        ))}
      </div>
      {/* Top jobs */}
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-slate-800/60" />
        ))}
      </div>
      {/* Skills */}
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-6 w-16 rounded-full bg-slate-800/60" />
        ))}
      </div>
      {/* Recommendation */}
      <div className="h-16 rounded-xl bg-amber-500/5 border border-amber-500/10" />
    </div>
  );
}

/* ─── Skill chip color by frequency ─────────────────────────── */
function skillChipClass(count) {
  if (count >= 5) return "bg-blue-500/15 border-blue-500/30 text-blue-300";
  if (count >= 3) return "bg-violet-500/15 border-violet-500/30 text-violet-300";
  return "bg-slate-700/60 border-slate-600/40 text-slate-300";
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function CareerBriefCard({ refreshTrigger }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await jobsApi.getDailySummary();
      setSummary(data);
    } catch (err) {
      setError("Could not load career brief. Try running a scout scan first.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Auto-refresh whenever parent signals a scout run completed
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchSummary();
    }
  }, [refreshTrigger, fetchSummary]);

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          <h2 className="text-sm sm:text-base font-bold text-text-main">
            Today's AI Career Brief
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
            AI Generated
          </span>
          {summary?.generatedAt && !loading && (
            <span className="flex items-center gap-1 text-[10px] text-text-sec/60">
              <Clock className="w-3 h-3" />
              Updated {formatTime(summary.generatedAt)}
            </span>
          )}
        </div>

        {/* Manual refresh button */}
        <button
          onClick={() => fetchSummary(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-border-custom text-[10px] text-text-sec hover:text-text-main hover:border-slate-600 transition-all duration-200 disabled:opacity-40 cursor-pointer"
        >
          <RefreshCw
            className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Card body */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-border-custom p-5 shadow-xl">
        {loading ? (
          <CareerBriefSkeleton />
        ) : error || !summary ? (
          /* Empty / Error state */
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-sm text-text-sec max-w-xs">
              {error || "No career brief yet. Run a Scout Scan to generate today's summary."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ── Row 1: Stat pills ──────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Jobs Found",
                  value: summary.jobsFound,
                  icon: Briefcase,
                  color: "blue",
                },
                {
                  label: "High Matches",
                  value: summary.highMatches,
                  icon: Star,
                  color: "amber",
                },
                {
                  label: "Both Matched",
                  value: summary.bothMatches,
                  icon: Layers,
                  color: "green",
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border py-3 px-2 text-center ${
                    color === "blue"
                      ? "bg-blue-500/8 border-blue-500/20"
                      : color === "amber"
                      ? "bg-amber-500/8 border-amber-500/20"
                      : "bg-emerald-500/8 border-emerald-500/20"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      color === "blue"
                        ? "text-blue-400"
                        : color === "amber"
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  />
                  <span
                    className={`text-xl font-extrabold leading-none ${
                      color === "blue"
                        ? "text-blue-400"
                        : color === "amber"
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {value}
                  </span>
                  <span className="text-[9px] text-text-sec uppercase font-bold tracking-wider">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Row 2: Top 3 Jobs ──────────────────────────────── */}
            {summary.topJobs && summary.topJobs.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-text-sec uppercase font-bold tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                  Top Matches Today
                </div>
                <div className="space-y-2">
                  {summary.topJobs.slice(0, 3).map((job, idx) => (
                    <div
                      key={job.id || idx}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/40 border border-border-custom/50 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rank */}
                        <span className="w-5 h-5 rounded-md bg-slate-700/80 border border-border-custom flex items-center justify-center text-[9px] font-extrabold text-text-sec flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text-main truncate group-hover:text-blue-300 transition-colors">
                            {job.title}
                          </p>
                          <p className="text-[10px] text-text-sec truncate">
                            {job.company}
                            {job.location ? ` · ${job.location}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge score={job.matchScore} className="scale-90 origin-right" />
                        {job.applyUrl && (
                          <a
                            href={job.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500/20 transition-colors"
                            title="Apply"
                          >
                            <ExternalLink className="w-3 h-3 text-blue-400" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* See all link */}
                {summary.topJobs.length > 3 && (
                  <div className="flex items-center justify-end">
                    <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-0.5 cursor-pointer hover:underline">
                      +{summary.topJobs.length - 3} more matches
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ── Row 3: Top Skills ──────────────────────────────── */}
            {summary.topSkills && summary.topSkills.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-text-sec uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                  Top Requested Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {summary.topSkills.map(({ skill, count }) => (
                    <span
                      key={skill}
                      className={`px-2.5 py-1 rounded-full border text-[10px] font-semibold flex items-center gap-1 ${skillChipClass(count)}`}
                      title={`Requested in ${count} job${count !== 1 ? "s" : ""}`}
                    >
                      {skill}
                      <span className="opacity-60">×{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Row 4: AI Recommendation ───────────────────────── */}
            {summary.recommendation && (
              <div className="flex gap-3 p-3.5 rounded-xl bg-amber-500/6 border border-amber-500/20">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1">
                    AI Recommendation
                  </p>
                  <p className="text-xs text-text-sec leading-relaxed">
                    {/* Render **bold** markdown-style text inline */}
                    {summary.recommendation.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={i} className="text-amber-300 font-semibold">
                          {part.slice(2, -2)}
                        </strong>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
