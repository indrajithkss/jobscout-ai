import React, { useState } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { useAI } from "../../context/AIContext";
import AIChat from "./AIChat";
import VoiceButton from "./VoiceButton";
import PromptChips from "./PromptChips";

export default function CopilotDrawer({ isOpen, onClose }) {
  const { chatHistory, sendMessage, chatLoading } = useAI();
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950 border-l border-border-custom shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-custom bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-blue shadow-md shadow-blue-500/25 text-text-main">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-text-main text-sm">AI Copilot</h3>
              <p className="text-[10px] text-text-sec">Online • Powered by JobScout</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-900 text-text-sec hover:text-text-main transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-950">
          <AIChat history={chatHistory} loading={chatLoading} />
        </div>

        {/* Voice status indicator */}
        {voiceStatus && (
          <div className="px-4 py-1.5 bg-slate-900 border-t border-border-custom text-[10px] text-primary-blue animate-pulse font-medium">
            {voiceStatus}
          </div>
        )}

        {/* Footer Chat Input */}
        <div className="p-4 border-t border-border-custom bg-slate-950 space-y-3">
          <PromptChips onChipClick={(prompt) => sendMessage(prompt)} />
          <div className="flex gap-2">
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
                placeholder="Ask AI Copilot anything..."
                className="w-full pl-3 pr-10 py-2.5 bg-slate-900 border border-border-custom focus:border-slate-700 rounded-lg text-xs text-text-main placeholder-text-sec outline-hidden focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="absolute right-2 top-2 p-1 rounded bg-primary-blue hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-primary-blue text-text-main cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
