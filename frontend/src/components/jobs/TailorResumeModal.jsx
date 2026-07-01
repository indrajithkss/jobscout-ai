// frontend/src/components/jobs/TailorResumeModal.jsx
// Phase 8.0 – ATS Resume Tailoring Modal

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  Copy, 
  Check, 
  Download, 
  Cpu, 
  FolderOpen, 
  Layers, 
  AlertCircle, 
  ArrowRight, 
  FileJson,
  BookOpen,
  Plus
} from "lucide-react";
import { jobsApi } from "../../services/jobsApi";

/* ─── Circular Score Ring ────────────────────────────────────── */
function ATSSingleRing({ score, label, color }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1 bg-slate-900/60 border border-border-custom/50 px-4 py-3 rounded-xl min-w-[100px]">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg width="68" height="68" className="-rotate-90">
          <circle cx="34" cy="34" r={radius} fill="none" stroke="#1E293B" strokeWidth="5" />
          <circle 
            cx="34" cy="34" r={radius} fill="none" 
            stroke={color} 
            strokeWidth="5" 
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-sm font-black text-text-main">{score}%</span>
      </div>
      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

/* ─── Skeletons ──────────────────────────────────────────────── */
function TailorSkeleton() {
  return (
    <div className="space-y-5 animate-pulse p-4">
      <div className="flex justify-center gap-6">
        <div className="h-24 w-28 bg-slate-800/60 rounded-xl" />
        <div className="h-24 w-28 bg-slate-800/60 rounded-xl" />
      </div>
      <div className="h-32 bg-slate-800/40 rounded-xl border border-slate-700/10" />
      <div className="h-24 bg-slate-800/40 rounded-xl border border-slate-700/10" />
      <div className="h-24 bg-slate-800/40 rounded-xl border border-slate-700/10" />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function TailorResumeModal({ isOpen, onClose, jobId, job }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Copy success feedback states
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedSkills, setCopiedSkills] = useState(false);
  const [copiedKeywords, setCopiedKeywords] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTailoredResume = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await jobsApi.tailorJobResume(jobId);
        if (isMounted) {
          if (res) {
            setData(res);
          } else {
            setError("Could not tailer resume assets. Verify candidate profile settings.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to run ATS Resume Tailoring Engine calculations.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (isOpen && jobId) {
      fetchTailoredResume();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, jobId]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyText = (text, setCopiedState) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const handleExportJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Tailored_Resume_${job?.company?.replace(/\s+/g, "_") || "Job"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-950 border border-border-custom shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 scale-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-custom bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-text-main text-base">ATS Resume Tailoring Preview</h3>
              <p className="text-[11px] text-text-sec mt-0.5">Optimizing content alignment for {job?.title} at {job?.company}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-900 text-text-sec hover:text-text-main transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <TailorSkeleton />
          ) : error || !data ? (
            <div className="flex gap-3 p-4 rounded-xl bg-error-red/5 border border-error-red/10 text-xs text-text-sec justify-center">
              <AlertCircle className="w-4 h-4 text-error-red shrink-0" />
              <p>{error || "No tailoring parameters available."}</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* ── ATS SCORE IMPROVEMENT HEADER ── */}
              <div className="p-4 rounded-xl bg-slate-900/30 border border-border-custom/50 flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-1.5 text-center md:text-left">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-[8px] text-emerald-400 font-extrabold uppercase tracking-wider border border-emerald-500/25">ATS Insight</span>
                  <h4 className="text-sm font-bold text-text-main">ATS Score Optimization</h4>
                  <p className="text-[11px] text-text-sec max-w-md">
                    Optimizing keyword density and reordering elements yields a potential matching score increase of <strong className="text-emerald-400">+{data.ats?.improvement}%</strong>.
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <ATSSingleRing score={data.ats?.current} label="Current Match" color="#F59E0B" />
                  <ArrowRight className="w-4 h-4 text-slate-500 hidden sm:block" />
                  <ATSSingleRing score={data.ats?.expected} label="Tailored Match" color="#10B981" />
                </div>
              </div>

              {/* ── PROFESSIONAL SUMMARY COMPARISON ── */}
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-border-custom/50">
                  <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Professional Summary Alignment</h4>
                  <button 
                    onClick={() => handleCopyText(data.summary?.tailored, setCopiedSummary)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-text-sec hover:text-text-main bg-slate-900 border border-border-custom rounded hover:border-slate-800 transition-colors cursor-pointer"
                  >
                    {copiedSummary ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedSummary ? "Copied!" : "Copy Summary"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-border-custom/40 space-y-1.5">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Original Summary</p>
                    <p className="text-xs text-text-sec leading-relaxed">{data.summary?.original}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1.5 relative">
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Tailored Summary</p>
                    <p className="text-xs text-text-sec leading-relaxed">
                      {data.summary?.tailored.split(/(specializing in [^.]+)/).map((p, i) => 
                        p.startsWith("specializing in") ? (
                          <span key={i} className="bg-emerald-500/10 text-emerald-300 font-medium px-0.5 rounded">{p}</span>
                        ) : <span key={i}>{p}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── SKILLS OPTIMIZATION COMPARISON ── */}
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-border-custom/50">
                  <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Skills List Reordering</h4>
                  <button 
                    onClick={() => handleCopyText(data.skills?.optimized?.join(", "), setCopiedSkills)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-text-sec hover:text-text-main bg-slate-900 border border-border-custom rounded hover:border-slate-800 transition-colors cursor-pointer"
                  >
                    {copiedSkills ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedSkills ? "Copied!" : "Copy Skills"}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-border-custom/40 space-y-2">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Original Ordering</p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills?.original?.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-slate-950 border border-slate-900 rounded text-[10px] text-text-sec">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-border-custom/40 space-y-2">
                    <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Optimized Ordering (Matched First)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills?.optimized?.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-slate-950 border border-emerald-500/10 text-[10px] text-emerald-300 font-semibold flex items-center gap-0.5">
                          <Check className="w-3 h-3 text-emerald-500" />
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── PROJECT RE-RANKING & METRICS ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Order */}
                <div className="p-4 rounded-xl bg-slate-900/30 border border-border-custom/40 space-y-3">
                  <p className="text-[10px] font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-primary-blue" />
                    Recommended Project Order
                  </p>
                  <div className="space-y-2">
                    {data.projects?.recommendedOrder?.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-slate-950 border border-border-custom/30 text-xs">
                        <span className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center font-bold text-[10px] text-text-sec">{idx + 1}</span>
                        <span className="font-semibold text-text-main">{p}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-sec leading-relaxed border-t border-border-custom/20 pt-2.5 mt-2">
                    {data.projects?.reason}
                  </p>
                </div>

                {/* ATS Keywords */}
                <div className="p-4 rounded-xl bg-slate-900/30 border border-border-custom/40 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold text-text-main uppercase tracking-wider flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-violet-400" />
                        ATS Keywords & Coverage
                      </p>
                      <button 
                        onClick={() => handleCopyText([...data.keywords?.matched, ...data.keywords?.recommended].join(", "), setCopiedKeywords)}
                        className="p-1 hover:text-text-main text-text-sec cursor-pointer"
                        title="Copy Keywords"
                      >
                        {copiedKeywords ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-[9px] text-success-green uppercase font-bold tracking-wider mb-1">Matched Keywords ({data.keywords?.matched?.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {data.keywords?.matched?.map(k => (
                            <span key={k} className="px-1.5 py-0.5 bg-success-green/10 text-[9px] text-success-green rounded border border-success-green/20">{k}</span>
                          ))}
                        </div>
                      </div>

                      {data.keywords?.recommended?.length > 0 && (
                        <div>
                          <p className="text-[9px] text-amber-400 uppercase font-bold tracking-wider mb-1">Recommended to Add ({data.keywords?.recommended?.length})</p>
                          <div className="flex flex-wrap gap-1">
                            {data.keywords?.recommended?.map(k => (
                              <span key={k} className="px-1.5 py-0.5 bg-amber-500/10 text-[9px] text-amber-300 rounded border border-amber-500/20 flex items-center gap-0.5">
                                <Plus className="w-2.5 h-2.5" />
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2.5 border-t border-border-custom/20 mt-3 text-[10px]">
                    <span className="text-slate-500">ATS coverage matching rate:</span>
                    <span className="font-bold text-text-main">{data.keywords?.coverage}%</span>
                  </div>
                </div>
              </div>

              {/* ── IMPROVEMENT NOTES ── */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 flex gap-3">
                <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">Improvement Notes</h4>
                  <p className="text-xs text-text-sec leading-relaxed">{data.notes}</p>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-border-custom bg-slate-950/60 flex flex-wrap gap-3 items-center justify-between">
          <button 
            onClick={handleExportJSON}
            disabled={loading || !data}
            className="px-4 py-2 bg-slate-900 border border-border-custom hover:border-slate-800 text-xs font-semibold text-text-main rounded-lg flex items-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <FileJson className="w-4 h-4 text-blue-400" />
            Export JSON Data
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-border-custom text-text-sec hover:text-text-main hover:bg-slate-900 hover:border-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
            <button 
              disabled={true}
              className="px-4 py-2 bg-primary-blue/30 text-text-main/50 border border-primary-blue/20 rounded-lg text-xs font-semibold cursor-not-allowed flex items-center gap-2"
              title="Coming soon"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF (Pro)
            </button>
            <button 
              disabled={true}
              className="px-4 py-2 bg-slate-850 text-text-main/50 border border-border-custom rounded-lg text-xs font-semibold cursor-not-allowed flex items-center gap-2"
              title="Coming soon"
            >
              <Download className="w-3.5 h-3.5" />
              Download DOCX (Pro)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
