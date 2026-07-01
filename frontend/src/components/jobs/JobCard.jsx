import React from "react";
import { MapPin, Globe, ExternalLink, Bookmark, BookmarkCheck, Sparkles } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function JobCard({ job, onViewClick, onSaveToggle }) {
  const isSaved = job.status === "Saved";

  const getStatusColor = (status) => {
    switch (status) {
      case "Applied":
        return "blue";
      case "Interview":
        return "yellow";
      case "Offer":
        return "green";
      case "Rejected":
        return "red";
      case "Saved":
        return "slate";
      default:
        return "slate";
    }
  };

  return (
    <Card hover className="flex flex-col justify-between h-full bg-card-bg border border-border-custom hover:border-slate-700 transition-all duration-200">
      <div className="space-y-4">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            {/* Logo/Icon placeholder */}
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 font-bold text-text-main text-sm uppercase shrink-0">
              {job.company.substring(0, 2)}
            </div>
            <div>
              <h3 className="font-semibold text-text-main text-sm sm:text-base hover:text-primary-blue transition-colors duration-150 line-clamp-1">
                {job.title}
              </h3>
              <p className="text-xs text-text-sec font-medium">
                {job.company}
              </p>
            </div>
          </div>
          {/* Match Score Badge */}
          <Badge score={job.matchScore} className="shrink-0" />
        </div>

        {/* Info Grid */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-sec">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {job.location}
          </div>
          <div className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            {job.source}
          </div>
        </div>

        {/* Truncated Description */}
        <p className="text-xs sm:text-sm text-text-sec/80 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* AI Match Explanation */}
        {job.skills && (
          <div className="p-3 rounded-lg bg-slate-950/50 border border-border-custom/50 space-y-2 text-[11px]">
            <p className="font-semibold text-text-main text-[10px] uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary-blue" />
              AI Match Details
            </p>
            <div className="grid grid-cols-2 gap-2">
              {/* Why this matches */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-success-green font-medium">✓ Matched</span>
                <p className="text-text-sec truncate leading-snug">
                  {job.skills.matched.slice(0, 3).join(", ")}
                </p>
              </div>
              {/* Missing skills */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-error-red font-medium">✗ Missing</span>
                <p className="text-text-sec truncate leading-snug">
                  {job.skills.missing.length > 0 ? job.skills.missing.slice(0, 2).join(", ") : "None"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between border-t border-border-custom/50 pt-4 mt-4">
        {/* Left Side: Status / Found time */}
        <div className="flex items-center gap-2">
          {job.status && job.status !== "None" && (
            <Badge variant={getStatusColor(job.status)}>
              {job.status}
            </Badge>
          )}
          <span className="text-[10px] text-text-sec">
            {job.createdAt}
          </span>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Save/Bookmark Toggle */}
          <button
            type="button"
            onClick={onSaveToggle}
            className="p-1.5 rounded-lg bg-slate-900 border border-border-custom hover:border-slate-800 text-text-sec hover:text-text-main transition-colors"
            title={isSaved ? "Saved" : "Save Job"}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-primary-blue fill-primary-blue/10" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>

          {/* View Drawer Button */}
          <Button variant="secondary" size="sm" onClick={onViewClick} className="py-1">
            View
          </Button>

          {/* Apply External URL Link */}
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-primary-blue hover:bg-blue-700 text-text-main transition-colors shadow-md shadow-blue-500/10"
            title="Apply Directly"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </Card>
  );
}
