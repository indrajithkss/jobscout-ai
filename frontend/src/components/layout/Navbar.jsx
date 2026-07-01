import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, Bell, X } from "lucide-react";
import { ROUTES } from "../../constants/routes";

const PAGE_TITLES = {
  [ROUTES.DASHBOARD]: "Dashboard",
  [ROUTES.CAREER_HUB]: "Career Hub",
  [ROUTES.COPILOT]: "AI Copilot",
  [ROUTES.PREFERENCES]: "Job Preferences",
  [ROUTES.JOBS]: "Jobs",
  [ROUTES.SAVED]: "Saved Jobs",
  [ROUTES.APPLIED]: "Application Tracker",
  [ROUTES.ANALYTICS]: "Analytics",
};

export default function Navbar({ onMenuOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState(0); // placeholder — wire to real data when notifications exist

  const pageTitle = PAGE_TITLES[location.pathname] || "JobScout AI";

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`${ROUTES.JOBS}?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 border-b border-border-custom bg-bg/80 backdrop-blur-md gap-3">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuOpen}
          className="p-1.5 rounded-lg lg:hidden hover:bg-slate-900 text-text-sec hover:text-text-main flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base md:text-lg font-semibold text-text-main tracking-tight truncate">
          {pageTitle}
        </h2>
      </div>

      {/* Right: search + actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block w-56 md:w-72">
          <span className="absolute inset-y-0 left-3 flex items-center text-text-sec pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search jobs... (Enter)"
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/50 hover:bg-slate-900/80 focus:bg-slate-950 text-xs text-text-main border border-border-custom hover:border-slate-800 focus:border-slate-700 rounded-lg placeholder-text-sec outline-none transition-all duration-200"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-2.5 flex items-center text-text-sec hover:text-text-main"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-border-custom hover:border-slate-800 text-text-sec hover:text-text-main transition-all duration-200"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {notifications > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-blue rounded-full" />
          )}
        </button>

        {/* Preferences shortcut */}
        <button
          type="button"
          onClick={() => navigate(ROUTES.PREFERENCES)}
          className="hidden md:flex items-center justify-center p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-border-custom hover:border-slate-800 text-text-sec hover:text-text-main transition-all duration-200"
          title="Settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
