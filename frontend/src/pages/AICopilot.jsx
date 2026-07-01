import React, { useState } from "react";
import { useAI } from "../context/AIContext";
import {
  Send,
  Volume2,
  VolumeX,
  Briefcase,
  Trash2,
  ClipboardList,
  Bookmark,
  Sparkles,
  Star,
  AlertTriangle,
  MapPin,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Bot,
  Zap,
  FileText,
  HelpCircle,
  Activity,
  ChevronRight,
} from "lucide-react";
import AIChat from "../components/copilot/AIChat";
import PromptChips from "../components/copilot/PromptChips";
import VoiceButton from "../components/copilot/VoiceButton";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

// ── Quick action chips the agent understands ──────────────────────────────────
const QUICK_ACTIONS = [
  { icon: Star, label: "Daily Briefing", prompt: "Give me my full daily briefing — what's new, what should I prioritize, and what are today's top picks?" },
  { icon: Zap, label: "Best to Apply", prompt: "Suggest the top 3 jobs I should apply to right now, ranked by match and strategic fit." },
  { icon: TrendingUp, label: "Skill Gap", prompt: "Analyze my skill gap across the top matched jobs. What should I learn next?" },
  { icon: ClipboardList, label: "Pipeline Status", prompt: "Review my application pipeline. What's the current status and what follow-ups do I need?" },
  { icon: FileText, label: "Cover Letter", prompt: "Draft a personalized cover letter for my highest matched job." },
  { icon: HelpCircle, label: "Interview Prep", prompt: "Generate interview prep questions for my top matched role." },
];

export default function AICopilot() {
  const {
    chatHistory,
    sendMessage,
    chatLoading,
    agentThinking,
    selectedJob,
    setSelectedJob,
    voiceMode,
    setVoiceMode,
    clearHistory,
    askAISkillGap,
    askAIInterviewPrep,
  } = useAI();

  const [inputText, setInputText] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("");
  const navigate = useNavigate();

  const handleSend = () => {
    if (!inputText.trim() || chatLoading) return;
    sendMessage(inputText);
    setInputText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt) => {
    if (chatLoading) return;
    sendMessage(prompt);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-8rem)]">

      {/* ── Left Pane: Chat ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-slate-900/30 backdrop-blur-md border border-border-custom rounded-2xl overflow-hidden min-w-0 shadow-2xl relative">

        {/* Chat Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-custom bg-slate-950/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-success-green rounded-full border-2 border-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-text-main text-sm tracking-tight">Scout Agent</h3>
                <span className="px-1.5 py-0.5 rounded bg-primary-blue/15 border border-primary-blue/25 text-[9px] text-primary-blue font-bold uppercase tracking-wider">
                  AGENT
                </span>
              </div>
              <p className="text-[10px] text-text-sec">
                {chatLoading
                  ? agentThinking || "Running..."
                  : "Powered by Gemini · 10 real-action tools · Always on"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice toggle */}
            <button
              type="button"
              onClick={() => setVoiceMode(!voiceMode)}
              className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer ${
                voiceMode
                  ? "bg-primary-blue/20 border-primary-blue/40 text-primary-blue"
                  : "bg-slate-950 border-border-custom text-text-sec hover:text-text-main hover:border-slate-800"
              }`}
              title={voiceMode ? "Voice: On" : "Voice: Off"}
            >
              {voiceMode ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Clear */}
            <button
              type="button"
              onClick={clearHistory}
              className="p-2 rounded-xl bg-slate-950 border border-border-custom text-text-sec hover:text-error-red hover:border-error-red/40 hover:bg-error-red/5 transition-all duration-300 cursor-pointer"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <AIChat history={chatHistory} loading={chatLoading} onJobClick={null} sendMessage={sendMessage} />

        {/* Quick action chips — only when chat is idle */}
        {chatHistory.length <= 2 && !chatLoading && (
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_ACTIONS.map(({ icon: Icon, label, prompt }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleQuickAction(prompt)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-border-custom hover:border-primary-blue/30 text-[11px] text-text-sec hover:text-text-main transition-all duration-200 text-left cursor-pointer group"
                >
                  <Icon className="w-3.5 h-3.5 text-primary-blue flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-medium truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 pb-4 pt-2 border-t border-border-custom/50 bg-slate-950/40 flex-shrink-0">
          {/* Agent thinking indicator */}
          {chatLoading && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <Activity className="w-3 h-3 text-primary-blue animate-pulse" />
              <span className="text-[10px] text-primary-blue font-semibold animate-pulse">
                {agentThinking || "Scout is working..."}
              </span>
            </div>
          )}

          <div className="flex items-end gap-3">
            {/* Voice input */}
            {voiceMode && (
              <VoiceButton
                onTranscript={(transcript) => {
                  setInputText(transcript);
                  setVoiceStatus("Received: " + transcript.substring(0, 40));
                }}
              />
            )}

            {/* Text input */}
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={chatLoading}
                rows={1}
                placeholder={chatLoading ? "Scout is working..." : "Ask Scout to do something... (Enter to send)"}
                className="w-full px-4 py-3 pr-12 bg-slate-900/60 border border-border-custom focus:border-primary-blue/50 hover:border-slate-800 rounded-xl text-sm text-text-main placeholder-text-sec outline-none transition-all resize-none disabled:opacity-50 max-h-28 overflow-y-auto"
                style={{ height: "auto", minHeight: "44px" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 112) + "px";
                }}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={chatLoading || !inputText.trim()}
                className="absolute right-3 bottom-3 p-1.5 rounded-lg bg-primary-blue hover:bg-blue-600 text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-blue-500/20"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {voiceStatus && (
            <p className="text-[10px] text-text-sec mt-1 px-1">{voiceStatus}</p>
          )}
        </div>
      </div>

      {/* ── Right Pane: Context Sidebar ──────────────────────────── */}
      <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 overflow-y-auto">

        {/* Agent Capabilities */}
        <Card className="p-4 bg-gradient-to-br from-blue-950/30 to-indigo-950/20 border border-primary-blue/15 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4 text-primary-blue" />
            <h4 className="text-xs font-bold text-text-main">Scout's Capabilities</h4>
          </div>
          <div className="space-y-2">
            {[
              { icon: Star, label: "Daily Briefing", color: "text-amber-400" },
              { icon: Briefcase, label: "Job Search & Save", color: "text-blue-400" },
              { icon: FileText, label: "Cover Letter Draft", color: "text-violet-400" },
              { icon: TrendingUp, label: "Skill Gap Analysis", color: "text-success-green" },
              { icon: HelpCircle, label: "Interview Prep", color: "text-blue-400" },
              { icon: ClipboardList, label: "Pipeline Review", color: "text-amber-400" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2.5 text-[11px] text-text-sec">
                <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border-custom/40">
            <p className="text-[10px] text-text-sec leading-relaxed">
              Scout can take <span className="text-primary-blue font-semibold">real actions</span> — saving jobs, updating statuses, drafting letters — all from chat.
            </p>
          </div>
        </Card>

        {/* Focused Job Context */}
        {selectedJob ? (
          <Card className="p-4 bg-card-bg border border-border-custom shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-blue animate-pulse" />
                <h4 className="text-xs font-bold text-text-main">Job Context</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="text-[10px] text-text-sec hover:text-error-red transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2.5">
              <div>
                <p className="text-xs font-semibold text-text-main line-clamp-2">{selectedJob.title}</p>
                {selectedJob.company && (
                  <p className="text-[11px] text-text-sec mt-0.5">{selectedJob.company}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge score={selectedJob.matchScore} />
                {selectedJob.location && (
                  <span className="text-[10px] text-text-sec flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{selectedJob.location}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => sendMessage(`Show my skill gap for "${selectedJob.title}" (Job ID: ${selectedJob.id})`)}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-900 border border-border-custom hover:border-primary-blue/30 text-[10px] text-text-sec hover:text-text-main transition-all cursor-pointer"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  Skill Gap
                </button>
                <button
                  type="button"
                  onClick={() => sendMessage(`Draft a cover letter for "${selectedJob.title}" (Job ID: ${selectedJob.id})`)}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-900 border border-border-custom hover:border-primary-blue/30 text-[10px] text-text-sec hover:text-text-main transition-all cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-violet-400" />
                  Cover Letter
                </button>
                <button
                  type="button"
                  onClick={() => sendMessage(`Generate interview prep for "${selectedJob.title}" (Job ID: ${selectedJob.id})`)}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-900 border border-border-custom hover:border-primary-blue/30 text-[10px] text-text-sec hover:text-text-main transition-all col-span-2 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3 text-blue-400" />
                  Interview Prep
                </button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4 bg-card-bg border border-dashed border-border-custom shadow-xl">
            <div className="flex flex-col items-center justify-center py-4 text-center gap-2">
              <MessageSquare className="w-6 h-6 text-text-sec opacity-30" />
              <p className="text-xs text-text-sec">No Job Context</p>
              <p className="text-[10px] text-text-sec/70 leading-relaxed max-w-[180px]">
                Open a job and tap <span className="text-primary-blue">Ask AI</span> to focus Scout on that role.
              </p>
            </div>
          </Card>
        )}

        {/* Quick action panel */}
        <Card className="p-4 bg-card-bg border border-border-custom shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h4 className="text-xs font-bold text-text-main">Quick Actions</h4>
          </div>
          <div className="space-y-1.5">
            {QUICK_ACTIONS.map(({ icon: Icon, label, prompt }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleQuickAction(prompt)}
                disabled={chatLoading}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900/60 border border-transparent hover:border-border-custom text-[11px] text-text-sec hover:text-text-main transition-all duration-200 text-left cursor-pointer group disabled:opacity-50"
              >
                <Icon className="w-3.5 h-3.5 text-primary-blue flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-medium flex-1">{label}</span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </Card>

        {/* Pro tip */}
        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <div className="flex items-start gap-2">
            <BrainCircuit className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1">Pro Tip</p>
              <p className="text-[10px] text-text-sec leading-relaxed">
                Tell Scout your target company and it'll find matching jobs, draft a cover letter, and prep your interview — all in one conversation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
