// frontend/src/pages/CareerHub.jsx
// Phase 7.5.3 – Career Hub Page (AI Command Center)
// Centralized dashboard reflecting data from Career Knowledge Engine.

import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Sparkles, 
  TrendingUp, 
  Award, 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Calendar, 
  Clock, 
  User, 
  Briefcase, 
  Layout, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  ArrowUpRight
} from "lucide-react";
import { careerApi } from "../services/careerApi";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

/* ─── Skeleton Screen ────────────────────────────────────────── */
function CareerHubSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-800 rounded" />
          <div className="h-4 w-72 bg-slate-800 rounded" />
        </div>
        <div className="h-10 w-32 bg-slate-800 rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-slate-800/50 rounded-2xl border border-slate-800" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-slate-800/40 rounded-2xl border border-slate-800" />
        <div className="h-80 bg-slate-800/40 rounded-2xl border border-slate-800" />
      </div>
    </div>
  );
}

/* ─── Sub-Component: Score Indicator Ring ────────────────────── */
function ScoreRing({ score }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg width="120" height="120" className="-rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#1E293B" strokeWidth="8" />
        <circle 
          cx="60" 
          cy="60" 
          r={radius} 
          fill="none" 
          stroke="url(#hubGradient)" 
          strokeWidth="8" 
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="hubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-text-main leading-none">{score}</span>
        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">readiness</span>
      </div>
    </div>
  );
}

/* ─── Main Page Component ────────────────────────────────────── */
export default function CareerHub() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await careerApi.getKnowledge();
      if (res) {
        setData(res);
      } else {
        setError("Could not compute career knowledge profile. Run a scout first.");
      }
    } catch (err) {
      setError("Failed to fetch consolidated candidate knowledge.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  if (loading) return <CareerHubSkeleton />;
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-text-main">Career Profile Not Ready</h2>
          <p className="text-sm text-text-sec max-w-sm leading-relaxed">
            Run a Scout Scan from the Dashboard to initialize your career knowledge base and start seeing insights here.
          </p>
        </div>
        <button
          onClick={fetchKnowledge}
          className="mt-2 px-4 py-2 bg-primary-blue hover:bg-blue-700 text-text-main text-sm font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  // Score levels formatting
  const getReadinessLevel = (score) => {
    if (score >= 85) return { label: "Elite Professional", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" };
    if (score >= 70) return { label: "Strong Candidate", color: "text-blue-400 border-blue-500/30 bg-blue-500/5" };
    return { label: "Building Momentum", color: "text-amber-400 border-amber-500/30 bg-amber-500/5" };
  };
  const readinessInfo = getReadinessLevel(data.careerReadiness);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-6 h-6 text-primary-blue animate-pulse" />
            <h1 className="text-2xl font-black text-text-main tracking-tight">AI Career Hub</h1>
          </div>
          <p className="text-sm text-text-sec">
            Your complete career profile — readiness score, skill roadmap, and market demand at a glance.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-border-custom text-xs font-semibold text-text-sec flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            {data.candidate?.name || "User"}
          </span>
          <button
            onClick={fetchKnowledge}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-border-custom rounded-lg text-xs font-semibold text-text-main cursor-pointer transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ── 1. Career Snapshot Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readiness Card */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-border-custom p-6 shadow-xl flex items-center gap-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-blue/5 rounded-full blur-3xl group-hover:bg-primary-blue/10 transition-all duration-300 pointer-events-none" />
          <ScoreRing score={data.careerReadiness} />
          <div className="space-y-1">
            <p className="text-[10px] text-text-sec uppercase font-bold tracking-wider">Status Category</p>
            <h3 className="text-base font-extrabold text-text-main leading-tight">Career Readiness</h3>
            <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${readinessInfo.color} mt-1.5`}>
              {readinessInfo.label}
            </span>
          </div>
        </div>

        {/* Weekly Goal Card */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-border-custom p-6 shadow-xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] text-violet-400 uppercase font-bold tracking-wider mb-0.5">Target Skill This Week</p>
              <h4 className="text-lg font-black text-text-main">{data.weeklyGoal?.skill || "Scan Active"}</h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <p className="text-[11px] text-text-sec line-clamp-2 my-2">{data.weeklyGoal?.action || "Run a scout to identify the highest gain learning options."}</p>
          <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
            <span className="text-[10px] text-slate-500">Expect match gain</span>
            <span className="text-xs font-bold text-emerald-400">+{data.weeklyGoal?.expectedScoreGain || 0}% Match</span>
          </div>
        </div>

        {/* Target Parameters Card */}
        <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-border-custom p-6 shadow-xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider mb-1">Preferences Scope</p>
            <div className="space-y-1.5">
              <div className="flex gap-1.5 flex-wrap">
                {data.preferredRoles?.slice(0, 2).map(r => (
                  <span key={r} className="px-2 py-0.5 bg-slate-800 border border-border-custom rounded-md text-[10px] font-semibold text-text-sec">
                    {r}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-text-sec">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>{data.preferredLocations?.join(" · ") || "Global"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/50 mt-3">
            <span className="text-[10px] text-slate-500">Active scout runs</span>
            <span className="text-xs font-extrabold text-emerald-400">{data.applicationStats?.totalJobsFound || 0} jobs found</span>
          </div>
        </div>
      </div>

      {/* ── 2. Detailed Highlights (Strengths & Weaknesses side-by-side) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-border-custom p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom/50">
            <Award className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-text-main">Top Career Strengths</h2>
          </div>
          <div className="space-y-3">
            {data.strengths?.map((s, idx) => (
              <div key={idx} className="flex gap-3.5 p-3 rounded-xl bg-slate-800/30 border border-border-custom/40">
                <div className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-[10px] shrink-0">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-main">{s.title}</h4>
                  <p className="text-[11px] text-text-sec leading-relaxed mt-0.5">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-border-custom p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom/50">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-bold text-text-main">Weak Areas (Match-Limiters)</h2>
          </div>
          <div className="space-y-3">
            {data.weakSkills?.slice(0, 4).map((w, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-border-custom/40">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-text-main">{w.skill}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Demanded in {w.demandCount} discovered jobs</p>
                </div>
                <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${
                  w.impact === "Critical" ? "bg-red-500/15 border-red-500/30 text-red-400" :
                  w.impact === "High" ? "bg-orange-500/15 border-orange-500/30 text-orange-400" :
                  "bg-amber-500/15 border-amber-500/30 text-amber-400"
                }`}>
                  {w.impact} Impact
                </span>
              </div>
            ))}
            {data.weakSkills?.length === 0 && (
              <p className="text-xs text-text-sec">Zero match-limiting gaps detected. Excellent stack coverage!</p>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Learning Plan Roadmap & Market Demand (side-by-side) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Learning Roadmap */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-border-custom p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom/50">
            <BookOpen className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-bold text-text-main">AI Learning Roadmap</h2>
          </div>
          <div className="space-y-3">
            {data.roadmap?.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-border-custom/40 group hover:border-violet-500/25 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                    {r.week.replace("Week ", "W")}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-text-main group-hover:text-violet-300 transition-colors">{r.skill}</h4>
                    <div className="flex items-center gap-2.5 text-[9px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{r.learningTime}</span>
                      <span>Difficulty: {r.difficulty}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded">
                  {r.expectedMatchIncrease} Match
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Market Demand Analysis */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-border-custom p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-custom/50">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-text-main">Dynamic Market Demand</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(data.marketDemand || {}).map(([category, items]) => {
              const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
              return (
                <div key={category} className="space-y-1.5">
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{catLabel}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800/80 border border-border-custom text-[10px] font-semibold text-text-sec rounded-lg flex items-center gap-1 transition-all"
                      >
                        {item.name}
                        <span className="opacity-50">×{item.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Reusable Recommendations Box ── */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-border-custom p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border-custom/50">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-text-main">Advisor Action Items</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.careerSummary?.recommendations?.map((rec, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 flex gap-3">
              <ArrowUpRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Recommendation {idx + 1}</h4>
                <p className="text-xs text-text-sec leading-relaxed">{rec}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. Career Pipeline Timeline ── */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-border-custom p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-border-custom/50">
          <Briefcase className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-text-main">Career Pipeline Status</h2>
        </div>
        
        {/* Horizontal Pipeline Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {[
            { label: "Discovered", count: data.applicationStats?.totalJobsFound || 0, color: "border-blue-500/20 text-blue-400" },
            { label: "Saved Roles", count: data.applicationStats?.savedJobsCount || 0, color: "border-purple-500/20 text-purple-400" },
            { label: "Applied", count: data.applicationStats?.appliedJobsCount || 0, color: "border-amber-500/20 text-amber-400" },
            { label: "Interviews", count: data.applicationStats?.interviewJobsCount || 0, color: "border-yellow-500/20 text-yellow-400" },
            { label: "Offers", count: data.applicationStats?.offersCount || 0, color: "border-emerald-500/20 text-emerald-400" }
          ].map((step, idx) => (
            <div key={idx} className={`p-4 rounded-xl bg-slate-900/40 border ${step.color} text-center space-y-1`}>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{step.label}</p>
              <h3 className="text-2xl font-black">{step.count}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Activity Timeline Log ── */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-border-custom p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border-custom/50">
          <Calendar className="w-5 h-5 text-slate-400" />
          <h2 className="text-base font-bold text-text-main">Recent Activity Timeline</h2>
        </div>
        <div className="relative border-l-2 border-slate-800 ml-3 pl-6 space-y-5 py-2">
          <div className="relative">
            <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-slate-950 border-2 border-slate-900" />
            <h4 className="text-xs font-bold text-text-main">Career Profile Initialized</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Your career profile was parsed and your knowledge base was set up.</p>
          </div>
          
          <div className="relative">
            <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-violet-500 ring-4 ring-slate-950 border-2 border-slate-900" />
            <h4 className="text-xs font-bold text-text-main">Daily Brief Activated</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">AI-generated daily summaries are now enabled after each scout run.</p>
          </div>

          {data.applicationStats?.totalJobsFound > 0 && (
            <div className="relative">
              <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-950 border-2 border-slate-900" />
              <h4 className="text-xs font-bold text-text-main">Jobs Discovered</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{data.applicationStats.totalJobsFound} opportunities found and cataloged from your active scout.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
