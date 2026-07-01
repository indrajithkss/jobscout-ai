// frontend/src/components/jobs/JobAdvisorSection.jsx
// Phase 7.5.2 – AI Job Advisor Section for JobDrawer

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  AlertCircle, 
  Flame, 
  Clock, 
  TrendingUp, 
  FileText, 
  BookOpen, 
  Compass, 
  Zap, 
  ArrowUpRight 
} from "lucide-react";
import { jobsApi } from "../../services/jobsApi";
import Badge from "../ui/Badge";
import TailorResumeModal from "./TailorResumeModal";

/* ─── Skeleton Loading ───────────────────────────────────────── */
function AdvisorSkeleton() {
  return (
    <div className="animate-pulse space-y-4 pt-2">
      {/* Priority card skeleton */}
      <div className="h-12 rounded-xl bg-slate-800/60" />
      {/* Collapsible section headers */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-10 rounded-xl bg-slate-800/40 border border-slate-700/20" />
      ))}
    </div>
  );
}

/* ─── Helper for Priority Styling ───────────────────────────── */
function getPriorityStyle(priority) {
  switch (priority) {
    case "Apply Today":
      return {
        bg: "bg-red-500/10 border-red-500/30 text-red-400",
        iconColor: "text-red-400 animate-bounce",
        label: "🔥 Apply Today",
        ring: "ring-red-500/20",
        glow: "shadow-red-500/5"
      };
    case "High Priority":
      return {
        bg: "bg-orange-500/10 border-orange-500/30 text-orange-400",
        iconColor: "text-orange-400",
        label: "⚡ High Priority",
        ring: "ring-orange-500/10",
        glow: "shadow-orange-500/5"
      };
    case "Medium Priority":
      return {
        bg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
        iconColor: "text-blue-400",
        label: "📈 Medium Priority",
        ring: "ring-blue-500/10",
        glow: "shadow-blue-500/5"
      };
    default:
      return {
        bg: "bg-slate-800/60 border-slate-700/50 text-slate-400",
        iconColor: "text-slate-400",
        label: "📁 Low Priority",
        ring: "ring-slate-700/10",
        glow: "shadow-transparent"
      };
  }
}

/* ─── Collapsible Card Wrapper ───────────────────────────────── */
function CollapsibleCard({ title, icon: Icon, isOpen, onToggle, children, badge }) {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-border-custom/50 shadow-sm overflow-hidden transition-all duration-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left font-bold text-xs uppercase tracking-wider text-text-sec hover:text-text-main hover:bg-slate-900/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="w-4 h-4 text-primary-blue" />}
          <span>{title}</span>
          {badge && <span className="ml-2">{badge}</span>}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      
      {/* Content panel with transition */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[800px] border-t border-border-custom/30 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 space-y-3 bg-slate-950/20">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function JobAdvisorSection({ jobId, job }) {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);

  // Accordion state
  const [openSections, setOpenSections] = useState({
    whyJob: true,
    skills: true,
    resume: false,
    interview: false,
    improvement: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    let isMounted = true;
    const fetchAdvice = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await jobsApi.getJobAdvice(jobId);
        if (isMounted) {
          if (data) {
            setAdvice(data);
          } else {
            setError("Unable to compute advisor report. Please verify profile setup.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to fetch advice from the advisor engine.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (jobId) {
      fetchAdvice();
    }

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  if (loading) return <AdvisorSkeleton />;
  if (error || !advice) {
    return (
      <div className="flex gap-3 p-4 rounded-xl bg-error-red/5 border border-error-red/10 text-xs text-text-sec">
        <AlertCircle className="w-4 h-4 text-error-red shrink-0 mt-0.5" />
        <p>{error || "No advice report available for this job."}</p>
      </div>
    );
  }

  const pStyle = getPriorityStyle(advice.priority);
  const matchedList = job?.skills?.matched || [];

  return (
    <div className="space-y-4 pt-2">
      {/* ✨ Section Header */}
      <h4 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-2 pb-1.5 border-b border-border-custom">
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        ✨ AI Job Advisor
      </h4>

      {/* 🔥 Priority Card Widget */}
      <div className={`p-4 rounded-xl border ${pStyle.bg} flex items-center justify-between shadow-lg ${pStyle.glow}`}>
        <div className="space-y-0.5">
          <p className="text-[9px] text-text-sec uppercase font-bold tracking-wider">Scout Priority Score</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-text-main tracking-tight">{advice.priorityScore}</span>
            <span className="text-[10px] text-slate-500 font-semibold">/100</span>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-wide flex items-center gap-1.5 shadow-sm`}>
          {pStyle.label}
        </span>
      </div>

      {/* ✨ Tailor Resume Trigger Button */}
      <button
        onClick={() => setIsTailorModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md transition-all duration-200"
      >
        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
        Tailor Resume (ATS Optimize)
      </button>

      {/* ── Collapsible Card 1: Why this job? ── */}
      <CollapsibleCard
        title="Why this job?"
        icon={Compass}
        isOpen={openSections.whyJob}
        onToggle={() => toggleSection("whyJob")}
      >
        <p className="text-xs text-text-sec leading-relaxed font-medium">
          {advice.applyReason?.summary}
        </p>

        {advice.applyReason?.strengths?.length > 0 && (
          <div className="space-y-1.5 pt-1.5 border-t border-border-custom/20">
            {advice.applyReason.strengths.map((str, idx) => (
              <div key={idx} className="flex gap-2 text-[11px] text-slate-400">
                <span className="text-primary-blue font-bold">•</span>
                <p className="leading-relaxed">{str}</p>
              </div>
            ))}
          </div>
        )}

        {advice.applyReason?.matchedProjects?.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border-custom/20">
            <p className="text-[9px] text-text-sec uppercase font-bold tracking-wider">Relevant Projects</p>
            {advice.applyReason.matchedProjects.map((p, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-border-custom/40">
                <p className="text-xs font-bold text-text-main mb-0.5">{p.project}</p>
                <p className="text-[11px] text-slate-400 leading-normal">{p.reason}</p>
              </div>
            ))}
          </div>
        )}
      </CollapsibleCard>

      {/* ── Collapsible Card 2: Skill Alignment ── */}
      <CollapsibleCard
        title="Skill Alignment"
        icon={Check}
        isOpen={openSections.skills}
        onToggle={() => toggleSection("skills")}
        badge={
          <span className="px-1.5 py-0.5 bg-slate-800 rounded-md text-[9px] font-bold text-text-sec">
            {matchedList.length} Matched / {advice.missingSkills?.length || 0} Missing
          </span>
        }
      >
        {/* Matched skills */}
        {matchedList.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-success-green uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success-green"></span>
              Matched Skills ({matchedList.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {matchedList.map((skill) => (
                <span 
                  key={skill} 
                  className="px-2.5 py-1 rounded-lg bg-success-green/10 border border-success-green/20 text-xs text-success-green font-semibold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5 text-success-green" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing skills with metadata detail */}
        {advice.missingSkills?.length > 0 ? (
          <div className="space-y-2.5 pt-2 border-t border-border-custom/20">
            <p className="text-[10px] font-bold text-error-red uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-error-red"></span>
              Missing Skills & Learning Plan ({advice.missingSkills.length})
            </p>
            <div className="space-y-2">
              {advice.missingSkills.map((s, idx) => (
                <div 
                  key={s.skill || idx} 
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-900 border border-border-custom/30"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-main">{s.skill}</p>
                    <div className="flex items-center gap-2.5 mt-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {s.learningTime}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        s.importance === "High" ? "bg-red-500/10 text-red-400" :
                        s.importance === "Medium" ? "bg-amber-500/10 text-amber-400" :
                        "bg-slate-800 text-slate-400"
                      }`}>
                        {s.importance} Impact
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-0.5 shrink-0 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {s.estimatedMatchIncrease}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          matchedList.length > 0 && (
            <p className="text-[11px] text-emerald-400 font-semibold pt-2 border-t border-border-custom/20">
              ✓ Full Stack Alignment! You have 100% of the listed required skills.
            </p>
          )
        )}
      </CollapsibleCard>

      {/* ── Collapsible Card 3: Resume Suggestions ── */}
      <CollapsibleCard
        title="Resume Suggestions"
        icon={FileText}
        isOpen={openSections.resume}
        onToggle={() => toggleSection("resume")}
      >
        {advice.resumeTips?.length > 0 ? (
          <div className="space-y-2">
            {advice.resumeTips.map((tip, idx) => (
              <div key={idx} className="flex gap-2.5 p-3 rounded-lg bg-slate-900 border border-border-custom/30 text-xs text-text-sec leading-relaxed">
                <span className="w-5 h-5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-sec">No resume updates suggested. Your profile layout is solid.</p>
        )}
      </CollapsibleCard>

      {/* ── Collapsible Card 4: Interview Preparation ── */}
      <CollapsibleCard
        title="Interview Preparation"
        icon={BookOpen}
        isOpen={openSections.interview}
        onToggle={() => toggleSection("interview")}
      >
        {advice.interviewTopics?.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[10px] text-text-sec uppercase font-bold tracking-wider">Top Topics to Master</p>
            <div className="grid grid-cols-1 gap-2">
              {advice.interviewTopics.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-900 border border-border-custom/30">
                  <span className="text-xs font-semibold text-text-main leading-snug">{t.topic}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    t.difficulty === "Hard" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    t.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {t.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-text-sec">Ensure basic stack knowledge matches the job requirements.</p>
        )}
      </CollapsibleCard>

      {/* ── Collapsible Card 5: Match Improvement ── */}
      <CollapsibleCard
        title="Estimated Improvement"
        icon={TrendingUp}
        isOpen={openSections.improvement}
        onToggle={() => toggleSection("improvement")}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-900 border border-border-custom/40 rounded-xl">
              <p className="text-[9px] text-text-sec uppercase font-bold tracking-wider mb-1">Current Match</p>
              <p className="text-xl font-extrabold text-text-main">{advice.estimatedImprovement?.currentMatch}%</p>
            </div>
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
              <p className="text-[9px] text-emerald-400 uppercase font-bold tracking-wider mb-1">Potential Match</p>
              <p className="text-xl font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                {advice.estimatedImprovement?.afterTopSkill}%
                {advice.estimatedImprovement?.gain > 0 && (
                  <span className="text-xs font-bold text-emerald-400">
                    (+{advice.estimatedImprovement.gain}%)
                  </span>
                )}
              </p>
            </div>
          </div>

          {advice.estimatedImprovement?.topSkillToLearn ? (
            <div className="flex gap-3 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
              <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">Accelerated Impact</p>
                <p className="text-xs text-text-sec leading-relaxed">
                  Learning <strong className="text-emerald-300 font-semibold">{advice.estimatedImprovement.topSkillToLearn}</strong> will elevate your match score to {advice.estimatedImprovement.afterTopSkill}%, unlocking direct recommendation tiers.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-emerald-400 font-semibold text-center">
              Your profile is fully optimized for this opportunity!
            </p>
          )}
        </div>
      </CollapsibleCard>

      {/* ATS Resume Tailoring Modal */}
      <TailorResumeModal 
        isOpen={isTailorModalOpen}
        onClose={() => setIsTailorModalOpen(false)}
        jobId={jobId}
        job={job}
      />
    </div>
  );
}
