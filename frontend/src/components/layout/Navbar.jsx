import React from "react";
import { useLocation } from "react-router-dom";
import { Menu, Search, Bell } from "lucide-react";
import { ROUTES } from "../../constants/routes";

export default function Navbar({ onMenuOpen }) {
  const location = useLocation();

  // Dynamically calculate view title based on active path
  const getPageTitle = () => {
    switch (location.pathname) {
      case ROUTES.DASHBOARD:
        return "Dashboard";
      case ROUTES.JOBS:
        return "Jobs Directory";
      case ROUTES.SAVED:
        return "Saved Jobs";
      case ROUTES.APPLIED:
        return "Application Pipeline";
      case ROUTES.ANALYTICS:
        return "Analytics & Insights";
      default:
        return "JobScout AI";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 border-b border-border-custom bg-bg/80 backdrop-blur-md">
      {/* Page Title & Hamburger */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuOpen}
          className="p-1.5 rounded-lg lg:hidden hover:bg-slate-900 text-text-sec hover:text-text-main"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base md:text-lg font-semibold text-text-main tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      {/* Right Navbar Section */}
      <div className="flex items-center gap-4">
        {/* Search Input bar */}
        <div className="relative hidden sm:block w-64 md:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center text-text-sec">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Quick search jobs, companies..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/50 hover:bg-slate-900/80 focus:bg-slate-950 text-xs text-text-main border border-border-custom hover:border-slate-800 focus:border-slate-700 rounded-lg placeholder-text-sec outline-hidden transition-all duration-200"
          />
        </div>

        {/* Notifications button */}
        <button
          type="button"
          className="relative p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-border-custom hover:border-slate-800 text-text-sec hover:text-text-main transition-all duration-200"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-blue rounded-full"></span>
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 border border-slate-700 font-medium text-xs text-text-main">
          IK
        </div>
      </div>
    </header>
  );
}
