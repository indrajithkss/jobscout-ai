import React, { useEffect } from "react";
import { X, Calendar, MapPin, Globe, ExternalLink, ThumbsUp, Award, Sparkles, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAI } from "../../context/AIContext";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import JobAdvisorSection from "./JobAdvisorSection";

function relativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_LABELS = {
  new: "New Opportunity",
  saved: "Saved",
  applied: "Applied",
  interview: "Interviewing",
  offer: "Offer Received",
  rejected: "Archived",
};

const STATUS_CLASS = {
  applied: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  interview: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  offer: "text-green-400 bg-green-500/10 border-green-500/20",
  rejected: "text-red-400 bg-red-500/10 border-red-500/20",
  saved: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

export default function JobDrawer({ isOpen, onClose, job, onStatusChange }) {
  const navigate = useNavigate();
  const { askAIAboutJob } = useAI();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!job) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-over panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-950 border-l border-border-custom shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-custom bg-slate-950 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0">
              <span className="font-bold text-text-main text-sm">
                {job.title.split(/\s+/).map((w) => w.charAt(0)).join("").substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-text-main text-base line-clamp-1">{job.title}</h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {job.company && (
                  <span className="flex items-center gap-1 text-[11px] text-text-sec">
                    <Building2 className="w-3 h-3 flex-shrink-0" />
                    {job.company}
                  </span>
                )}
                {job.source_type === "real" && (
                  <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] text-emerald-400 font-semibold">
                    ● LIVE
                  </span>
                )}
                {job.status && job.status !== "new" && (
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold uppercase tracking-wider ${
                      STATUS_CLASS[job.status] || "text-slate-400 bg-slate-500/10 border-slate-500/20"
                    }`}
                  >
                    {STATUS_LABELS[job.status] || job.status}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-900 text-text-sec hover:text-text-main transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-card-bg border border-border-custom/50 text-xs text-text-sec">
            {job.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-blue flex-shrink-0" />
                <div>
                  <p className="font-medium text-text-main">Location</p>
                  <p>{job.location}</p>
                </div>
              </div>
            )}
            {job.source && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary-blue flex-shrink-0" />
                <div>
                  <p className="font-medium text-text-main">Source</p>
                  <p className="flex items-center gap-1">
                    {job.source}
                    {job.source_type === "real" && (
                      <span className="text-emerald-400 font-bold">✓</span>
                    )}
                  </p>
                </div>
              </div>
            )}
            {job.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-blue flex-shrink-0" />
                <div>
                  <p className="font-medium text-text-main">Discovered</p>
                  <p>{relativeTime(job.createdAt)}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary-blue flex-shrink-0" />
              <div>
                <p className="font-medium text-text-main">Match Score</p>
                <Badge score={job.matchScore} />
              </div>
            </div>
          </div>

          {/* AI Match Analysis */}
          {job.skills && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-2 pb-1.5 border-b border-border-custom">
                AI Match Analysis
              </h4>

              {job.recommendation && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary-blue/5 border border-primary-blue/10">
                  <ThumbsUp className="w-4 h-4 text-primary-blue mt-0.5 flex-shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <p className="font-semibold text-text-main mb-0.5">Recommendation</p>
                    <p className="text-text-sec">{job.recommendation}</p>
                  </div>
                </div>
              )}

              {job.skills.matched?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-success-green uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-green" />
                    Matched Skills ({job.skills.matched.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.matched.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-success-green/10 border border-success-green/20 text-xs text-success-green font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.skills.missing?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-error-red uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-error-red" />
                    Missing Skills ({job.skills.missing.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.missing.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-error-red/10 border border-error-red/20 text-xs text-error-red font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Job Advisor */}
          <JobAdvisorSection jobId={job.id} job={job} />

          {/* Description */}
          {job.description && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider pb-1.5 border-b border-border-custom">
                Job Description
              </h4>
              <p className="text-xs sm:text-sm text-text-sec leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border-custom bg-slate-950/60 flex flex-col gap-3 flex-shrink-0">
          {/* Status selector */}
          <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-900 border border-border-custom/50">
            <span className="text-xs font-bold text-text-main uppercase tracking-wider">
              Application Status
            </span>
            <select
              value={job.status || "new"}
              onChange={async (e) => {
                await onStatusChange(job.id, e.target.value);
              }}
              className="px-3 py-1.5 bg-slate-950 border border-border-custom hover:border-slate-800 rounded-lg text-xs font-semibold text-text-main outline-none transition-colors cursor-pointer"
            >
              <option value="new">New</option>
              <option value="saved">Saved</option>
              <option value="applied">Applied</option>
              <option value="interview">Interviewing</option>
              <option value="offer">Offer Received</option>
              <option value="rejected">Archived / Rejected</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 text-xs sm:text-sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold"
              onClick={() => {
                askAIAboutJob(job, navigate);
                onClose();
              }}
            >
              <Sparkles className="w-4 h-4 text-primary-blue animate-pulse" />
              Ask AI
            </Button>
          </div>
          {job.applyUrl && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-primary-blue hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 transition-colors"
            >
              Apply Now
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </>
  );
}
