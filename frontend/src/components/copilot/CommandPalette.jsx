import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Compass, 
  Briefcase, 
  Bookmark, 
  ClipboardList, 
  BarChart3, 
  Sparkles, 
  Clock, 
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Settings
} from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { useAI } from "../../context/AIContext";

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();
  const { sendMessage, selectedJob, askAIAboutJob, askAISkillGap, askAIInterviewPrep } = useAI();

  // Load recent searches from localStorage on mount/open
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("jobscout_recent_searches");
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse recent searches", e);
        }
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const saveRecentSearch = (text) => {
    if (!text.trim()) return;
    const cleanText = text.trim();
    let updated = [cleanText, ...recentSearches.filter(s => s.toLowerCase() !== cleanText.toLowerCase())];
    updated = updated.slice(0, 5); // limit to 5 recent searches
    setRecentSearches(updated);
    localStorage.setItem("jobscout_recent_searches", JSON.stringify(updated));
  };

  const handleExecuteAIAction = (text) => {
    saveRecentSearch(text);
    navigate(ROUTES.COPILOT);
    sendMessage(text);
    onClose();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleExecuteAIAction(query);
    }
  };

  // Define static navigation list
  const navItems = [
    { name: "Dashboard", category: "Navigation", icon: Compass, action: () => { navigate(ROUTES.DASHBOARD); onClose(); } },
    { name: "Jobs Directory", category: "Navigation", icon: Briefcase, action: () => { navigate(ROUTES.JOBS); onClose(); } },
    { name: "AI Copilot Chat", category: "Navigation", icon: Sparkles, action: () => { navigate(ROUTES.COPILOT); onClose(); } },
    { name: "Saved Jobs List", category: "Navigation", icon: Bookmark, action: () => { navigate(ROUTES.SAVED); onClose(); } },
    { name: "Applied Jobs Pipeline", category: "Navigation", icon: ClipboardList, action: () => { navigate(ROUTES.APPLIED); onClose(); } },
    { name: "Analytics & Career Insights", category: "Navigation", icon: BarChart3, action: () => { navigate(ROUTES.ANALYTICS); onClose(); } },
    { name: "Job Preferences Settings", category: "Navigation", icon: Settings, action: () => { navigate(ROUTES.PREFERENCES); onClose(); } },
  ];

  // Define AI Actions dynamically based on whether there's a selected job
  const aiActions = [
    {
      name: "Find jobs with my profile match",
      desc: "Scout new roles aligned with MERN developer skills",
      icon: Sparkles,
      action: () => handleExecuteAIAction("Find jobs matching my skills")
    },
    {
      name: selectedJob 
        ? `Analyze selected job: ${selectedJob.title}`
        : "Analyze selected job",
      desc: selectedJob 
        ? "Evaluate career impact for this role"
        : "Please focus a job first in the jobs directory",
      icon: BrainCircuit,
      action: () => {
        if (selectedJob) {
          askAIAboutJob(selectedJob, navigate);
          onClose();
        } else {
          handleExecuteAIAction("Analyze my active job focus");
        }
      }
    },
    {
      name: selectedJob 
        ? `Generate interview prep for ${selectedJob.title}`
        : "Generate interview prep questions",
      desc: selectedJob 
        ? "Get tailored interview questions"
        : "Create generic interview Q&As for your profile",
      icon: ClipboardList,
      action: () => {
        if (selectedJob) {
          askAIInterviewPrep(selectedJob, navigate);
          onClose();
        } else {
          handleExecuteAIAction("Generate interview prep questions for a MERN developer");
        }
      }
    },
    {
      name: selectedJob 
        ? `Analyze skill gaps for ${selectedJob.title}`
        : "Analyze skill gap analysis",
      desc: selectedJob 
        ? "Check profile against job requirements"
        : "Compare your profile against target market requirements",
      icon: TrendingUp,
      action: () => {
        if (selectedJob) {
          askAISkillGap(selectedJob, navigate);
          onClose();
        } else {
          handleExecuteAIAction("What skills am I missing for the top jobs?");
        }
      }
    }
  ];

  // Filter items matching query
  const filteredNav = navItems.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAI = aiActions.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  const filteredRecent = recentSearches.filter(search =>
    search.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md transition-opacity duration-300">
      {/* Click outside container to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Palette Container */}
      <form 
        onSubmit={handleSearchSubmit}
        className="relative w-full max-w-xl bg-slate-950/95 border border-border-custom rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
      >
        {/* Search Input bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border-custom bg-slate-900/40">
          <Search className="w-5 h-5 text-text-sec shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search navigation, run AI actions, or ask Copilot..."
            className="flex-1 bg-transparent border-0 text-text-main placeholder-text-sec text-xs sm:text-sm outline-hidden focus:outline-hidden"
            autoFocus
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-text-sec font-mono border border-border-custom/50 shadow-xs">
              ENTER
            </kbd>
            <kbd className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-text-sec font-mono border border-border-custom/50 shadow-xs">
              ESC
            </kbd>
          </div>
        </div>

        {/* Action Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          
          {/* Direct AI Query option */}
          {query.trim() && (
            <div className="pb-1.5 border-b border-border-custom/20">
              <button
                type="submit"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-primary-blue/10 border border-primary-blue/20 hover:bg-primary-blue/15 hover:border-primary-blue/30 text-left cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-primary-blue" />
                  <div>
                    <p className="text-xs font-bold text-text-main">Ask Career Copilot</p>
                    <p className="text-[11px] text-primary-blue/90 font-medium truncate max-w-sm sm:max-w-md mt-0.5">
                      "{query}"
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-primary-blue" />
              </button>
            </div>
          )}

          {/* Recent Searches Section */}
          {filteredRecent.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-text-sec uppercase tracking-wider px-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Recent Searches
              </h4>
              <div className="space-y-0.5">
                {filteredRecent.map((search, idx) => (
                  <button
                    key={`recent-${idx}`}
                    type="button"
                    onClick={() => handleExecuteAIAction(search)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-900/60 text-xs sm:text-sm text-text-sec hover:text-text-main transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Clock className="w-4 h-4 text-text-sec group-hover:text-primary-blue shrink-0" />
                      <span className="truncate">{search}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-text-sec transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Actions Section */}
          {filteredAI.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-text-sec uppercase tracking-wider px-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary-blue" />
                AI Actions & Operations
              </h4>
              <div className="space-y-0.5">
                {filteredAI.map((action, idx) => (
                  <button
                    key={`ai-${idx}`}
                    type="button"
                    onClick={action.action}
                    className="w-full flex items-start gap-3.5 px-3 py-2.5 rounded-xl text-left hover:bg-slate-900/60 text-xs sm:text-sm text-text-sec hover:text-text-main transition-colors cursor-pointer group"
                  >
                    <action.icon className="w-4 h-4 text-text-sec group-hover:text-primary-blue shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-text-main group-hover:text-primary-blue transition-colors">
                        {action.name}
                      </p>
                      <p className="text-[10px] text-text-sec mt-0.5 truncate leading-relaxed">
                        {action.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Section */}
          {filteredNav.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-text-sec uppercase tracking-wider px-3 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Quick Navigation
              </h4>
              <div className="space-y-0.5">
                {filteredNav.map((item, idx) => (
                  <button
                    key={`nav-${idx}`}
                    type="button"
                    onClick={item.action}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-900/60 text-xs sm:text-sm text-text-sec hover:text-text-main transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-text-sec group-hover:text-primary-blue shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-text-sec transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredAI.length === 0 && filteredRecent.length === 0 && (
            <div className="py-12 text-center text-xs text-text-sec">
              No matching actions or commands found. Press Enter to submit search directly to Copilot.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
