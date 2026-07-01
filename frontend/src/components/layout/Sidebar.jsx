import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  Bookmark, 
  ClipboardList, 
  BarChart3, 
  Settings,
  X,
  Sparkles
} from "lucide-react";
import { ROUTES } from "../../constants/routes";

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { name: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: "AI Copilot", path: ROUTES.COPILOT, icon: Sparkles },
    { name: "Jobs", path: ROUTES.JOBS, icon: Briefcase },
    { name: "Saved Jobs", path: ROUTES.SAVED, icon: Bookmark },
    { name: "Applied Jobs", path: ROUTES.APPLIED, icon: ClipboardList },
    { name: "Analytics", path: ROUTES.ANALYTICS, icon: BarChart3 },
  ];

  return (
    <>
      {/* Sidebar container */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-slate-950 border-r border-border-custom transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border-custom">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-blue shadow-md shadow-blue-500/25">
              <span className="font-bold text-text-main text-sm">JS</span>
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-text-main to-text-sec bg-clip-text text-transparent">
              JobScout AI
            </span>
          </div>
          {/* Mobile close button */}
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-lg lg:hidden hover:bg-slate-900 text-text-sec hover:text-text-main"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose(); // close on mobile after navigation
              }}
              className={({ isActive }) => {
                const baseClasses = "flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer";
                if (item.path === ROUTES.COPILOT) {
                  return isActive 
                    ? `${baseClasses} bg-blue-950/30 text-primary-blue border-l-2 border-primary-blue pl-3 shadow-xs` 
                    : `${baseClasses} text-text-main/90 bg-slate-900/30 hover:bg-slate-900/60 border border-primary-blue/15 hover:border-primary-blue/35`;
                }
                return isActive 
                  ? `${baseClasses} bg-slate-900 text-primary-blue border-l-2 border-primary-blue pl-3` 
                  : `${baseClasses} text-text-sec hover:text-text-main hover:bg-slate-900/50`;
              }}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-4 h-4 transition-colors ${
                    item.path === ROUTES.COPILOT 
                      ? "text-primary-blue" 
                      : isActive 
                      ? "text-primary-blue" 
                      : "text-text-sec group-hover:text-text-main"
                  }`} />
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.path === ROUTES.COPILOT && (
                    <span className="px-1.5 py-0.5 rounded-md bg-primary-blue/15 text-[8px] text-primary-blue uppercase font-bold border border-primary-blue/20">
                      new
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
          <div className="pt-4 border-t border-border-custom/50 mt-4">
            <div className="flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium text-text-sec cursor-not-allowed opacity-60">
              <Settings className="w-4 h-4" />
              Settings
            </div>
          </div>
        </nav>

        {/* Profile Card Bottom Section */}
        <div className="p-4 border-t border-border-custom bg-slate-950">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-card-bg border border-border-custom/50">
            {/* Avatar with initial */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 border border-slate-700">
              <span className="font-semibold text-text-main text-sm">IK</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success-green border-2 border-card-bg rounded-full"></span>
            </div>
            {/* Info details */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-main truncate">
                Indrajith KS
              </p>
              <p className="text-xs text-text-sec truncate">
                MERN Developer
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}
    </>
  );
}
