import React, { useState } from "react";
import {
  CheckCircle2,
  Briefcase,
  FileText,
  Target,
  ClipboardList,
  HelpCircle,
  Star,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Zap,
  TrendingUp,
  Building2,
} from "lucide-react";
import Badge from "../ui/Badge";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-border-custom text-[11px] text-text-sec hover:text-text-main transition-all cursor-pointer"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-success-green" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function JobMiniCard({ job, rank, sendMessage }) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-900/80 border border-border-custom hover:border-slate-700 transition-all group">
      <div className="flex items-center gap-3">
        {rank && (
          <span className="w-6 h-6 rounded-md bg-slate-800 border border-border-custom flex items-center justify-center text-[9px] font-extrabold text-text-sec flex-shrink-0">
            {rank}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-main truncate group-hover:text-primary-blue transition-colors">
            {job.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {job.company && (
              <span className="text-[10px] text-text-sec flex items-center gap-1 truncate">
                <Building2 className="w-3 h-3 flex-shrink-0" />
                {job.company}
              </span>
            )}
            {job.location && (
              <span className="text-[10px] text-text-sec flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {job.location}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {job.isPerfectMatch && (
            <span className="px-1.5 py-0.5 bg-success-green/10 border border-success-green/20 rounded-full text-[8px] text-success-green font-bold uppercase">
              Perfect
            </span>
          )}
          <Badge score={job.matchScore} className="scale-90 origin-right" />
          {job.applyUrl && (
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 rounded-lg bg-primary-blue/10 border border-primary-blue/20 flex items-center justify-center hover:bg-primary-blue/20 transition-colors"
            >
              <ExternalLink className="w-3 h-3 text-primary-blue" />
            </a>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      {sendMessage && job.id && (
        <div className="flex flex-wrap gap-1.5 mt-1 pt-1.5 border-t border-border-custom/30">
          <button
            type="button"
            onClick={() => sendMessage(`Shortlist job with ID ${job.id}`)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-border-custom text-[9px] text-text-sec hover:text-text-main transition-colors cursor-pointer"
          >
            <Star className="w-3 h-3 text-amber-400" />
            Save
          </button>
          <button
            type="button"
            onClick={() => sendMessage(`Mark job with ID ${job.id} as applied`)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-border-custom text-[9px] text-text-sec hover:text-text-main transition-colors cursor-pointer"
          >
            <Check className="w-3 h-3 text-success-green" />
            Apply
          </button>
          <button
            type="button"
            onClick={() => sendMessage(`Explain my match for job with ID ${job.id}`)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-border-custom text-[9px] text-text-sec hover:text-text-main transition-colors cursor-pointer"
          >
            <Zap className="w-3 h-3 text-primary-blue" />
            Explain Match
          </button>
          <button
            type="button"
            onClick={() => sendMessage(`Draft a cover letter for job with ID ${job.id}`)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-border-custom text-[9px] text-text-sec hover:text-text-main transition-colors cursor-pointer"
          >
            <FileText className="w-3 h-3 text-violet-400" />
            Tailor
          </button>
          <button
            type="button"
            onClick={() => sendMessage(`Generate interview prep for job with ID ${job.id}`)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-border-custom text-[9px] text-text-sec hover:text-text-main transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 text-blue-400" />
            Prep Interview
          </button>
        </div>
      )}
    </div>
  );
}

export default function AgentActionCard({ action, sendMessage }) {
  if (!action || !action.tool) return null;

  switch (action.tool) {
    case "search_jobs":
    case "suggest_apply_list": {
      const jobs = action.jobs || [];
      const isSuggest = action.tool === "suggest_apply_list";
      return (
        <div className="mt-3 space-y-2 w-full">
          <div className="flex items-center gap-2 text-[10px] text-text-sec uppercase font-bold tracking-wider mb-1">
            {isSuggest ? (
              <><Zap className="w-3.5 h-3.5 text-yellow-400" /> Top Picks — Apply Today</>
            ) : (
              <><Briefcase className="w-3.5 h-3.5 text-primary-blue" /> Search Results</>
            )}
            <span className="ml-auto px-1.5 py-0.5 rounded bg-slate-800 border border-border-custom text-[9px]">
              {jobs.length} jobs
            </span>
          </div>
          {jobs.length > 0 ? (
            jobs.map((job, idx) => (
              <JobMiniCard key={job.id || idx} job={job} rank={isSuggest ? job.rank || idx + 1 : null} sendMessage={sendMessage} />
            ))
          ) : (
            <p className="text-xs text-text-sec">No matching jobs found.</p>
          )}
        </div>
      );
    }

    case "save_job":
    case "set_application_status": {
      const isSave = action.tool === "save_job";
      return (
        <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-success-green/5 border border-success-green/20">
          <CheckCircle2 className="w-5 h-5 text-success-green flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-success-green">{action.label}</p>
            {action.title && (
              <p className="text-[11px] text-text-sec mt-0.5 truncate">
                {action.title}{action.company ? ` · ${action.company}` : ""}
              </p>
            )}
          </div>
          {!isSave && action.new_status && (
            <span className="ml-auto px-2 py-0.5 rounded-full bg-slate-800 border border-border-custom text-[10px] font-bold text-text-sec uppercase tracking-wider flex-shrink-0">
              {action.new_status}
            </span>
          )}
        </div>
      );
    }

    case "draft_cover_letter": {
      return (
        <div className="mt-3 space-y-2 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-text-sec uppercase font-bold tracking-wider">
              <FileText className="w-3.5 h-3.5 text-violet-400" />
              Cover Letter{action.title ? ` — ${action.title}` : ""}
              {action.company && <span className="text-text-sec/60 normal-case font-normal">at {action.company}</span>}
            </div>
            <CopyButton text={action.cover_letter || ""} />
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-border-custom max-h-64 overflow-y-auto">
            <p className="text-xs text-text-sec leading-relaxed whitespace-pre-line">
              {action.cover_letter}
            </p>
          </div>
        </div>
      );
    }

    case "get_skill_gap": {
      const missing = action.missing || [];
      const matched = action.matched || [];
      return (
        <div className="mt-3 space-y-3 w-full">
          <div className="flex items-center gap-2 text-[10px] text-text-sec uppercase font-bold tracking-wider">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            Skill Gap — {action.role || "Your Target Role"}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {matched.length > 0 && (
              <div className="p-3 rounded-xl bg-success-green/5 border border-success-green/15 space-y-2">
                <p className="text-[10px] font-bold text-success-green uppercase tracking-wider">
                  ✓ You Have ({matched.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matched.slice(0, 8).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-success-green/10 border border-success-green/20 text-[10px] text-success-green font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {missing.length > 0 && (
              <div className="p-3 rounded-xl bg-error-red/5 border border-error-red/15 space-y-2">
                <p className="text-[10px] font-bold text-error-red uppercase tracking-wider">
                  ✗ Missing ({Array.isArray(missing) ? missing.length : "–"})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(missing) ? missing : []).map((s) => {
                    const skill = typeof s === "string" ? s : s.skill;
                    const count = typeof s === "object" ? s.count : null;
                    return (
                      <span key={skill} className="px-2 py-0.5 rounded-md bg-error-red/10 border border-error-red/20 text-[10px] text-error-red font-medium flex items-center gap-1">
                        {skill}
                        {count && <span className="opacity-60">×{count}</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    case "get_interview_prep": {
      const questions = action.questions || [];
      return (
        <div className="mt-3 space-y-2 w-full">
          <div className="flex items-center gap-2 text-[10px] text-text-sec uppercase font-bold tracking-wider mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            Interview Prep — {action.role || ""}
          </div>
          {questions.map((q) => (
            <div key={q.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-border-custom space-y-2">
              <p className="text-xs font-semibold text-text-main flex items-start gap-2">
                <span className="w-5 h-5 rounded-md bg-primary-blue/10 border border-primary-blue/20 text-[9px] font-bold text-primary-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                  {q.id}
                </span>
                {q.question}
              </p>
              {q.type && (
                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-text-sec border border-border-custom">
                  {q.type}
                </span>
              )}
              {q.answer && (
                <p className="text-[11px] text-text-sec leading-relaxed pl-7 border-l-2 border-primary-blue/20 ml-2">
                  {q.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    case "get_daily_briefing": {
      const topMatches = action.top_matches || [];
      return (
        <div className="mt-3 space-y-3 w-full">
          <div className="flex items-center gap-2 text-[10px] text-text-sec uppercase font-bold tracking-wider">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            Daily Briefing — {action.date || "Today"}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "New Jobs", value: action.new_today, color: "blue" },
              { label: "Pending", value: action.pending_followup, color: "amber" },
              { label: "Interviews", value: action.active_interviews, color: "green" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center ${
                  color === "blue"
                    ? "bg-blue-500/5 border-blue-500/15"
                    : color === "amber"
                    ? "bg-amber-500/5 border-amber-500/15"
                    : "bg-success-green/5 border-success-green/15"
                }`}
              >
                <span className={`text-xl font-extrabold ${
                  color === "blue" ? "text-blue-400" : color === "amber" ? "text-amber-400" : "text-success-green"
                }`}>
                  {value ?? "–"}
                </span>
                <span className="text-[9px] text-text-sec uppercase font-bold tracking-wider mt-0.5">{label}</span>
              </div>
            ))}
          </div>

          {topMatches.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-text-sec uppercase font-bold tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary-blue" /> Top Matches
              </p>
              {topMatches.map((job, idx) => (
                <JobMiniCard key={job.id || idx} job={job} rank={idx + 1} />
              ))}
            </div>
          )}
        </div>
      );
    }

    case "get_application_status": {
      const { summary, applied_jobs = [], interview_jobs = [] } = action;
      return (
        <div className="mt-3 space-y-3 w-full">
          <div className="flex items-center gap-2 text-[10px] text-text-sec uppercase font-bold tracking-wider">
            <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
            Application Pipeline
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { label: "Saved", key: "saved", color: "text-slate-400" },
              { label: "Applied", key: "applied", color: "text-blue-400" },
              { label: "Interview", key: "interview", color: "text-yellow-400" },
              { label: "Offer", key: "offer", color: "text-success-green" },
              { label: "Rejected", key: "rejected", color: "text-error-red" },
            ].map(({ label, key, color }) => (
              <div key={key} className="p-2.5 rounded-xl bg-slate-900/80 border border-border-custom text-center">
                <span className={`block text-lg font-extrabold ${color}`}>{summary?.[key] ?? 0}</span>
                <span className="text-[8px] text-text-sec uppercase font-bold tracking-wider">{label}</span>
              </div>
            ))}
          </div>
          {interview_jobs.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-yellow-400 uppercase font-bold tracking-wider">Active Interviews</p>
              {interview_jobs.map((j, idx) => (
                <div key={j.id || idx} className="flex items-center gap-2 text-xs text-text-sec">
                  <ArrowRight className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                  <span>{j.title}{j.company ? ` · ${j.company}` : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}
