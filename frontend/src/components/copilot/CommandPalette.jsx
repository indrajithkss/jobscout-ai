import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Compass, Briefcase, Bookmark, ClipboardList, BarChart3, Sparkles } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { useAI } from "../../context/AIContext";

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { sendMessage } = useAI();

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

  const items = [
    // Navigation group
    { name: "Go to Dashboard", category: "Navigation", icon: Compass, action: () => { navigate(ROUTES.DASHBOARD); onClose(); } },
    { name: "Go to Jobs Directory", category: "Navigation", icon: Briefcase, action: () => { navigate(ROUTES.JOBS); onClose(); } },
    { name: "Go to AI Copilot", category: "Navigation", icon: Sparkles, action: () => { navigate(ROUTES.COPILOT); onClose(); } },
    { name: "Go to Saved Jobs", category: "Navigation", icon: Bookmark, action: () => { navigate(ROUTES.SAVED); onClose(); } },
    { name: "Go to Applied Pipeline", category: "Navigation", icon: ClipboardList, action: () => { navigate(ROUTES.APPLIED); onClose(); } },
    { name: "Go to Analytics & Insights", category: "Navigation", icon: BarChart3, action: () => { navigate(ROUTES.ANALYTICS); onClose(); } },
    // AI Actions group
    { name: "Find jobs with my profile match", category: "AI Action", icon: Sparkles, action: () => { navigate(ROUTES.COPILOT); sendMessage("Find jobs matching my skills"); onClose(); } },
    { name: "Analyze skill gaps on current jobs", category: "AI Action", icon: Sparkles, action: () => { navigate(ROUTES.COPILOT); sendMessage("What skills am I missing for the top jobs?"); onClose(); } },
    { name: "Generate interview prep questions", category: "AI Action", icon: Sparkles, action: () => { navigate(ROUTES.COPILOT); sendMessage("Generate interview prep questions for a MERN developer"); onClose(); } },
    { name: "Analyze my application strategy", category: "AI Action", icon: Sparkles, action: () => { navigate(ROUTES.COPILOT); sendMessage("Review my application status and suggest next steps"); onClose(); } },
  ];

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/75 backdrop-blur-xs">
      {/* Click outside container */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Palette Container */}
      <div className="relative w-full max-w-lg bg-slate-950 border border-border-custom rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[450px]">
        {/* Search Input bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border-custom bg-slate-900/50">
          <Search className="w-5 h-5 text-text-sec shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search actions..."
            className="flex-1 bg-transparent border-0 text-text-main placeholder-text-sec text-xs sm:text-sm outline-hidden focus:outline-hidden"
            autoFocus
          />
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-text-sec font-mono border border-border-custom">
            ESC
          </kbd>
        </div>

        {/* Action Items List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-border-custom/30">
          {filteredItems.length > 0 ? (
            // Group by category
            ["Navigation", "AI Action"].map(category => {
              const categoryItems = filteredItems.filter(i => i.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category} className="py-2 first:pt-1 last:pb-1">
                  <h4 className="text-[9px] font-bold text-text-sec uppercase tracking-wider px-3 mb-1">
                    {category === "Navigation" ? "Navigation" : "AI Actions & Prompts"}
                  </h4>
                  <div className="space-y-0.5">
                    {categoryItems.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={item.action}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-slate-900 text-xs sm:text-sm text-text-sec hover:text-text-main transition-colors cursor-pointer group"
                      >
                        <item.icon className="w-4 h-4 text-text-sec group-hover:text-primary-blue transition-colors shrink-0" />
                        <span className="flex-1 truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-text-sec">
              No matching actions or commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
