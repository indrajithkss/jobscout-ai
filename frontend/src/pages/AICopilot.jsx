import React, { useState } from "react";
import { useAI } from "../context/AIContext";
import { Send, Volume2, VolumeX, Briefcase, Trash2, Award, ClipboardCheck, Bookmark, Sparkles } from "lucide-react";
import AIChat from "../components/copilot/AIChat";
import PromptChips from "../components/copilot/PromptChips";
import VoiceButton from "../components/copilot/VoiceButton";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

export default function AICopilot() {
  const { 
    chatHistory, 
    sendMessage, 
    chatLoading, 
    selectedJob, 
    setSelectedJob,
    voiceMode, 
    setVoiceMode,
    clearHistory 
  } = useAI();

  const [inputText, setInputText] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-10rem)]">
      
      {/* Left Pane: Conversation logs */}
      <div className="flex-1 flex flex-col bg-card-bg border border-border-custom rounded-xl overflow-hidden min-w-0">
        
        {/* Chat Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-custom bg-slate-900/20">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-blue/10 text-primary-blue border border-primary-blue/20">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-semibold text-text-main text-sm">AI Career Copilot</h3>
              <p className="text-[10px] text-text-sec">Online • Ready to assist</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Voice Mode Toggle */}
            <button
              type="button"
              onClick={() => setVoiceMode(!voiceMode)}
              className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                voiceMode 
                  ? "bg-primary-blue/10 border-primary-blue/30 text-primary-blue" 
                  : "bg-slate-900 border-border-custom text-text-sec hover:text-text-main"
              }`}
              title={voiceMode ? "Voice Response Mode: On" : "Voice Response Mode: Off"}
            >
              {voiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            {/* Clear History */}
            <button
              type="button"
              onClick={clearHistory}
              className="p-2 rounded-lg bg-slate-900 border border-border-custom text-text-sec hover:text-error-red hover:border-error-red/30 transition-all duration-200 cursor-pointer"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message logs */}
        <AIChat 
          history={chatHistory} 
          loading={chatLoading} 
          onJobClick={(job) => setSelectedJob(job)}
        />

        {/* Voice status floating bar */}
        {voiceStatus && (
          <div className="px-5 py-1.5 bg-slate-900 border-t border-border-custom text-[10px] text-primary-blue animate-pulse font-medium">
            {voiceStatus}
          </div>
        )}

        {/* Chat input panel */}
        <div className="p-4 border-t border-border-custom bg-slate-900/20 space-y-3">
          <PromptChips onChipClick={(prompt) => sendMessage(prompt)} />
          <div className="flex gap-3">
            <VoiceButton 
              onTranscription={(text) => setInputText(text)}
              onStatusChange={(status) => setVoiceStatus(status)}
            />
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your career copilot about roles, skill gaps, or interview prep..."
                className="w-full pl-4 pr-12 py-3 bg-slate-950 border border-border-custom focus:border-slate-700 rounded-lg text-xs sm:text-sm text-text-main placeholder-text-sec outline-hidden focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="absolute right-2 top-2 p-1.5 rounded-md bg-primary-blue hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-primary-blue text-text-main cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: Context Sidebar */}
      <div className="w-full lg:w-80 flex flex-col bg-card-bg border border-border-custom rounded-xl p-5 space-y-6">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-text-main flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-primary-blue" />
            AI Context Panel
          </h3>
          <p className="text-xs text-text-sec mt-0.5">Focusing job context details.</p>
        </div>

        {selectedJob ? (
          <div className="space-y-5">
            {/* Active Job details */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-border-custom space-y-3">
              <div>
                <h4 className="font-semibold text-text-main text-xs sm:text-sm leading-snug line-clamp-2">
                  {selectedJob.title}
                </h4>
                <p className="text-[11px] text-text-sec mt-0.5">{selectedJob.company}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border-custom/50">
                <span className="text-[10px] text-text-sec">Match Rating</span>
                <Badge score={selectedJob.matchScore} />
              </div>
            </div>

            {/* Missing Skills list */}
            <div className="space-y-2">
              <p className="text-[10px] sm:text-xs font-semibold text-text-main uppercase tracking-wide">
                Missing Requirements
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.skills?.missing && selectedJob.skills.missing.length > 0 ? (
                  selectedJob.skills.missing.map(skill => (
                    <span 
                      key={skill} 
                      className="px-2 py-0.5 rounded bg-error-red/10 border border-error-red/20 text-[10px] text-error-red font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-success-green font-medium">✓ 100% Skills Match</span>
                )}
              </div>
            </div>

            {/* Workflow statuses */}
            <div className="space-y-3.5 pt-4 border-t border-border-custom/50">
              <p className="text-[10px] sm:text-xs font-semibold text-text-main uppercase tracking-wide">
                Workflow Status
              </p>
              
              <div className="flex items-center justify-between text-xs text-text-sec">
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  Saved
                </span>
                <span className="font-semibold text-text-main">
                  {selectedJob.status === "Saved" ? "Yes" : "No"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-text-sec">
                <span className="flex items-center gap-1.5">
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Application Status
                </span>
                <span className={`font-semibold uppercase text-[10px] tracking-wide px-2 py-0.5 rounded-full ${
                  ["Applied", "Interview", "Offer"].includes(selectedJob.status)
                    ? "bg-success-green/10 text-success-green border border-success-green/20"
                    : "bg-slate-800 text-text-sec border border-border-custom"
                }`}>
                  {selectedJob.status || "Not Started"}
                </span>
              </div>
            </div>

            {/* Context action buttons */}
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center gap-2 text-xs"
                onClick={() => setSelectedJob(null)}
              >
                Clear Context Focus
              </Button>
            </div>
          </div>
        ) : (
          /* Empty context placeholder */
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-border-custom/40 rounded-xl bg-slate-950/20">
            <Briefcase className="w-8 h-8 text-text-sec opacity-40 mb-3" />
            <p className="text-xs text-text-main font-semibold">No Job Focused</p>
            <p className="text-[10px] text-text-sec mt-1.5 max-w-[200px] leading-relaxed">
              Explore the Jobs index and click "Ask AI About This Job" to view analysis profiles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
