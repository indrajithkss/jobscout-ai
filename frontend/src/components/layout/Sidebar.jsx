import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  ClipboardList,
  BarChart3,
  Settings,
  X,
  Sparkles,
  Compass,
  LogOut,
} from "lucide-react";
import axios from "axios";
import { ROUTES } from "../../constants/routes";

export default function Sidebar({ isOpen, onClose }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/resume/profile")
      .then((res) => {
        if (res.data?.success && res.data?.profile) {
          setProfile(res.data.profile);
        }
      })
      .catch(() => {});
  }, []);

  // Derive initials from name or fallback to "JS"
  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "JS";

  const displayName = profile?.name || "Your Profile";
  const displayRole = profile?.currentTitle || profile?.targetRole || "Job Seeker";

  const navItems = [
    { name: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: "Career Hub", path: ROUTES.CAREER_HUB, icon: Compass },
    { name: "AI Copilot", path: ROUTES.COPILOT, icon: Sparkles, badge: "AI" },
    { name: "Job Preferences", path: ROUTES.PREFERENCES, icon: Settings },
    { name: "Jobs", path: ROUTES.JOBS, icon: Briefcase },
    { name: "Saved Jobs", path: ROUTES.SAVED, icon: Bookmark },
    { name: "Application Tracker", path: ROUTES.APPLIED, icon: ClipboardList },
    { name: "Analytics", path: ROUTES.ANALYTICS, icon: BarChart3 },
  ];

  return (
    <>
      {/* Sidebar container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-slate-950 border-r border-border-custom transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border-custom">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-blue shadow-md shadow-blue-500/25">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-text-main">
              JobScout AI
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg lg:hidden hover:bg-slate-900 text-text-sec hover:text-text-main"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) => {
                const base =
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer";
                if (item.path === ROUTES.COPILOT) {
                  return isActive
                    ? `${base} bg-blue-950/40 text-primary-blue border border-primary-blue/30`
                    : `${base} text-text-main/90 bg-slate-900/30 hover:bg-slate-900/60 border border-primary-blue/10 hover:border-primary-blue/25`;
                }
                return isActive
                  ? `${base} bg-slate-800/80 text-primary-blue`
                  : `${base} text-text-sec hover:text-text-main hover:bg-slate-900/50`;
              }}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      item.path === ROUTES.COPILOT
                        ? "text-primary-blue"
                        : isActive
                        ? "text-primary-blue"
                        : "text-text-sec group-hover:text-text-main"
                    }`}
                  />
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded bg-primary-blue/15 text-[9px] text-primary-blue uppercase font-bold border border-primary-blue/20">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Profile card at bottom */}
        <div className="p-3 border-t border-border-custom bg-slate-950">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card-bg border border-border-custom/50">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex-shrink-0">
              <span className="font-semibold text-text-main text-sm">{initials}</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success-green border-2 border-card-bg rounded-full" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-main truncate">{displayName}</p>
              <p className="text-[11px] text-text-sec truncate">{displayRole}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
