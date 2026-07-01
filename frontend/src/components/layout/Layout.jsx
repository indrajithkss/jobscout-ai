import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import CopilotDrawer from "../copilot/CopilotDrawer";
import CommandPalette from "../copilot/CommandPalette";
import { Sparkles } from "lucide-react";
import { AIProvider } from "../../context/AIContext";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global Ctrl + K Hotkey listener to toggle search palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AIProvider>
      <div className="flex h-screen overflow-hidden bg-bg">
        {/* Left Sidebar Menu */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Right Content Section */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Sticky Header Topbar */}
          <Navbar onMenuOpen={() => setSidebarOpen(true)} />

          {/* Dynamic Page Views Wrapper */}
          <main className="flex-1 overflow-y-auto bg-bg">
            <div className="mx-auto max-w-[1600px] p-4 md:p-8">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Floating AI Career Orb */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => setCopilotOpen(true)}
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-text-main shadow-2xl shadow-blue-500/40 border border-white/10 cursor-pointer group transition-all duration-500 hover:scale-110 active:scale-95"
            title="Open AI Copilot"
          >
            {/* Pulsing ring outer waves */}
            <span className="absolute inset-0 rounded-full bg-blue-500/35 animate-ping opacity-60 group-hover:opacity-100 transition-opacity"></span>
            <span className="absolute -inset-1 rounded-full bg-indigo-500/20 blur-xs animate-pulse"></span>
            
            {/* Sparkles icon with custom rotation on hover */}
            <Sparkles className="w-6 h-6 relative z-10 text-white group-hover:rotate-12 transition-transform duration-300" />
            
            {/* Active Indicator Badge */}
            <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 z-20">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-bg"></span>
            </span>
          </button>
        </div>

        {/* Copilot Drawer slide-over chat panel */}
        <CopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />

        {/* Command Palette search overlay */}
        <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      </div>
    </AIProvider>
  );
}
