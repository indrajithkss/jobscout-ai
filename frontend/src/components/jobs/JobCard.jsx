import React, { useState, useEffect, useRef } from "react";
import { MapPin, Globe, ExternalLink, Sparkles, ChevronDown, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAI } from "../../context/AIContext";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

// Format ISO date as relative time
function relativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 2) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

const STATUS_COLORS = {
  applied: "blue",
  interview: "yellow",
  offer: "green",
  rejected: "red",
  saved: "slate",
};

const STATUS_LABELS = {
  new: "",
  saved: "Saved",
  applied: "Applied",
  interview: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};

export default function JobCard({ job, onViewClick, onStatusChange }) {
  const isSaved = job.status === "saved";
  const navigate = useNavigate();
  const { askAIAboutJob } = useAI();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const titleInitials = job.title
    .split(/\s+/)
    .map((w) => w.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const statusLabel = STATUS_LABELS[job.status] || job.status || "";
  const statusColor = STATUS_COLORS[job.status] || "slate";

  return (
    <Card hover className="flex flex-col justify-between h-full bg-card-bg border border-border-custom hover:border-slate-700 transition-all duration-200">
      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 font-bold text-text-main text-sm uppercase shrink-0">
              {titleInitials}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-text-main text-sm hover:text-primary-blue transition-colors duration-150 line-clamp-1">
                {job.title}
              </h3>
              {job.company && (
                <p className="text-[11px] text-text-sec flex items-center gap-1 mt-0.5 truncate">
                  <Building2 className="w-3 h-3 flex-shrink-0" />
                  {job.company}
                </p>
              )}
            </div>
          </div>
          <Badge score={job.matchScore} className="shrink-0" />
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-sec">
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate max-w-[120px]">{job.location}</span>
            </div>
          )}
          {job.source && (
            <div className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              {job.source}
            </div>
          )}
        </div>

        {/* Description */}
        {job.description && (
          <p className="text-xs text-text-sec/80 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}

        {/* AI Match Panel */}
        {job.skills && (
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-border-custom/50 space-y-2.5 hover:border-slate-800 transition-colors">
            <p className="font-bold text-text-main text-[10px] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary-blue animate-pulse" />
              AI Match
            </p>

            <div className="space-y-2">
              {job.skills.matched?.length > 0 && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-text-sec font-semibold uppercase tracking-wide">
                    Matched:
                  </span>
                  <div className="space-y-0.5 pl-0.5">
                    {job.skills.matched.slice(0, 3).map((skill) => (
                      <div key={skill} className="flex items-center gap-1 text-[11px] text-success-green font-medium">
                        <span>✓</span>
                        <span className="truncate">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-0.5">
                <span className="text-[10px] text-text-sec font-semibold uppercase tracking-wide">
                  Missing:
                </span>
                <div className="space-y-0.5 pl-0.5">
                  {job.skills.missing?.length > 0 ? (
                    job.skills.missing.slice(0, 2).map((skill) => (
                      <div key={skill} className="flex items-center gap-1 text-[11px] text-error-red font-medium">
                        <span>✗</span>
                        <span className="truncate">{skill}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-success-green font-medium">
                      <span>✓</span>
                      <span>None — full match</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                askAIAboutJob(job, navigate);
              }}
              className="mt-1 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-950/30 border border-blue-500/20 hover:bg-blue-600/20 hover:border-blue-500/40 text-[10px] font-bold text-primary-blue hover:text-text-main transition-all duration-300 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI About This Job
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border-custom/50 pt-4 mt-4 relative">
        <div className="flex items-center gap-2">
          {job.status && job.status !== "new" && statusLabel && (
            <Badge variant={statusColor}>{statusLabel}</Badge>
          )}
          <span className="text-[10px] text-text-sec/70">{relativeTime(job.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2" ref={menuRef}>
          {/* Actions dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-border-custom hover:border-slate-800 text-text-sec hover:text-text-main transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              <span>Actions</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-2 z-50 w-44 bg-slate-950 border border-border-custom rounded-xl shadow-2xl p-1.5 space-y-0.5">
                {[
                  { label: isSaved ? "Unsave" : "Save Job", status: isSaved ? "new" : "saved" },
                  { label: "Mark as Applied", status: "applied" },
                  { label: "Mark as Interview", status: "interview" },
                  { label: "Mark as Offer", status: "offer" },
                  { label: "Mark as Rejected", status: "rejected" },
                ].map(({ label, status }) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      onStatusChange(job.id, status);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-slate-900 text-text-main font-medium cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button variant="secondary" size="sm" onClick={onViewClick} className="py-1 px-2.5 text-[11px] h-7">
            View
          </Button>

          {job.applyUrl && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center p-1.5 rounded-lg bg-primary-blue hover:bg-blue-700 text-white transition-colors shadow-md shadow-blue-500/10"
              title="Apply Directly"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
