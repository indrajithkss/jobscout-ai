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
        <button
          type="button"
          onClick={() => setCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-primary-blue hover:bg-blue-700 text-text-main shadow-lg shadow-blue-500/20 border border-primary-blue/30 cursor-pointer group transition-all duration-300 hover:scale-110 active:scale-95"
          title="Open AI Copilot"
        >
          {/* Outer pulse indicator rings */}
          <span className="absolute inset-0 rounded-full bg-primary-blue/20 animate-ping group-hover:animate-none opacity-60"></span>
          <Sparkles className="w-5 h-5 relative z-10" />
        </button>

        {/* Copilot Drawer slide-over chat panel */}
        <CopilotDrawer isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />

        {/* Command Palette search overlay */}
        <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      </div>
    </AIProvider>
  );
}
