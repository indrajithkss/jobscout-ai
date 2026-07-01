// frontend/src/components/dashboard/CareerReadinessCard.jsx
// Phase 7.5.1 – Career Readiness Widget with animated SVG circular progress ring

import React, { useEffect, useRef } from "react";
import { Shield, TrendingUp, FileText, Code2, FolderOpen, Send, Mic } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

function scoreTier(score) {
  if (score >= 85) return { label: "Elite",        color: "#10B981", bg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" };
  if (score >= 70) return { label: "Strong",       color: "#3B82F6", bg: "bg-blue-500/15 border-blue-500/30 text-blue-400" };
  if (score >= 50) return { label: "Developing",   color: "#F59E0B", bg: "bg-amber-500/15 border-amber-500/30 text-amber-400" };
  return               { label: "Getting Started", color: "#EF4444", bg: "bg-red-500/15 border-red-500/30 text-red-400" };
}

function barColor(score) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

// ─── SVG Circular Progress Ring ─────────────────────────────────────────────

function CircularRing({ score, size = 140, stroke = 10 }) {
  const tier = scoreTier(score);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  const circleRef = useRef(null);

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;
    // Animate from full offset → computed offset
    circle.style.strokeDashoffset = circumference;
    requestAnimationFrame(() => {
      circle.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)";
      circle.style.strokeDashoffset = offset;
    });
  }, [score, circumference, offset]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="#1E293B"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={tier.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{ filter: `drop-shadow(0 0 6px ${tier.color}60)` }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-3xl font-black leading-none"
          style={{ color: tier.color }}
        >
          {score}
        </span>
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          /100
        </span>
      </div>
    </div>
  );
}

// ─── Dimension Row ───────────────────────────────────────────────────────────

const DIMENSIONS = [
  { key: "resumeStrength",      label: "Resume",      Icon: FileText, weight: "25%" },
  { key: "skillsMatch",         label: "Skills",      Icon: Code2,    weight: "30%" },
  { key: "projectRelevance",    label: "Projects",    Icon: FolderOpen,weight: "20%" },
  { key: "applicationActivity", label: "Activity",    Icon: Send,     weight: "15%" },
  { key: "interviewReadiness",  label: "Interviews",  Icon: Mic,      weight: "10%" },
];

function DimensionRow({ label, Icon, score, weight }) {
  const color = barColor(score);
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-6 h-6 rounded-md bg-slate-800 border border-border-custom flex items-center justify-center flex-shrink-0">
        <Icon className="w-3 h-3 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-text-sec font-semibold">{label}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-500 font-medium">{weight}</span>
            <span className="text-[10px] text-text-main font-bold">{score}</span>
          </div>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CareerReadinessSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="flex items-center gap-6">
        <div className="w-[140px] h-[140px] rounded-full bg-slate-800/60 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-slate-800 rounded" />
                <div className="h-3 w-8 bg-slate-800 rounded" />
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CareerReadinessCard({ data, loading }) {
  const tier = data ? scoreTier(data.careerReadiness) : null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/90 border border-border-custom p-5 shadow-xl h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-text-main">Career Readiness</h3>
        </div>
        {tier && (
          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${tier.bg}`}>
            {tier.label}
          </span>
        )}
      </div>

      {loading || !data ? (
        <CareerReadinessSkeleton />
      ) : (
        <div className="flex items-center gap-5">
          {/* Ring */}
          <div className="flex-shrink-0">
            <CircularRing score={data.careerReadiness} />
          </div>

          {/* Dimension bars */}
          <div className="flex-1 space-y-3 min-w-0">
            {DIMENSIONS.map(({ key, label, Icon, weight }) => (
              <DimensionRow
                key={key}
                label={label}
                Icon={Icon}
                score={data[key] ?? 0}
                weight={weight}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
