import React, { useEffect } from "react";
import { X, Calendar, MapPin, Globe, ExternalLink, ThumbsUp, Award, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAI } from "../../context/AIContext";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function JobDrawer({ isOpen, onClose, job }) {
  const navigate = useNavigate();
  const { askAIAboutJob } = useAI();

  // Prevent body scrolling when drawer is open to look clean
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

  if (!job) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Slide-over panel container */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-950 border-l border-border-custom shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-custom bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 font-bold text-text-main text-sm">
              {job.company.substring(0, 2)}
            </div>
            <div>
              <h3 className="font-semibold text-text-main text-base line-clamp-1">{job.title}</h3>
              <p className="text-xs text-text-sec">{job.company}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-900 text-text-sec hover:text-text-main transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid widget */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-card-bg border border-border-custom/50 text-xs text-text-sec">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-blue" />
              <div>
                <p className="font-medium text-text-main">Location</p>
                <p>{job.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary-blue" />
              <div>
                <p className="font-medium text-text-main">Source</p>
                <p>{job.source}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-blue" />
              <div>
                <p className="font-medium text-text-main">Discovered</p>
                <p>{job.createdAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary-blue" />
              <div>
                <p className="font-medium text-text-main">Match Rating</p>
                <Badge score={job.matchScore} />
              </div>
            </div>
          </div>

          {/* AI Match Analysis Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider flex items-center gap-2 pb-1.5 border-b border-border-custom">
              AI Match Analysis
            </h4>
            
            {/* Score Recommendation */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary-blue/5 border border-primary-blue/10">
              <ThumbsUp className="w-4.5 h-4.5 text-primary-blue mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-semibold text-text-main mb-0.5">Recommendation</p>
                <p className="text-text-sec text-xs">{job.recommendation}</p>
              </div>
            </div>

            {/* Matched Skills */}
            <div className="space-y-2">
              <p className="text-[10px] sm:text-xs font-bold text-success-green uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success-green"></span>
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

            {/* Missing Skills */}
            <div className="space-y-2">
              <p className="text-[10px] sm:text-xs font-bold text-error-red uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-error-red"></span>
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
          </div>

          {/* Job Description details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider pb-1.5 border-b border-border-custom">
              Job Description
            </h4>
            <p className="text-xs sm:text-sm text-text-sec leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-border-custom bg-slate-950/60 flex flex-col gap-3">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
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
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-primary-blue hover:bg-blue-700 text-text-main shadow-lg shadow-blue-900/15"
          >
            Apply Now
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </>
  );
}
