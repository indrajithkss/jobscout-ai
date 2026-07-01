import React, { createContext, useContext, useState } from "react";
import { agentService } from "../services/aiService";
import { ROUTES } from "../constants/routes";

const AIContext = createContext();

const WELCOME_MESSAGE = {
  id: "welcome",
  sender: "ai",
  isAgent: true,
  type: "text",
  text: `Hello! I'm **Scout** — your autonomous AI career agent. I don't just talk, I take action.

Here's what I can do for you:
- **"What should I do today?"** → Full daily briefing with top picks
- **"Find me remote React jobs"** → Search & surface matched roles
- **"Draft a cover letter for Razorpay"** → Write personalized letter, save to your profile
- **"Show my skill gap"** → Analyze missing skills across your top matches
- **"Who should I follow up with?"** → Review your application pipeline
- **"Prep me for a Node.js interview"** → Generate questions + model answers

What would you like to tackle first?`,
  actions: [],
};

export function AIProvider({ children }) {
  const [chatHistory, setChatHistory] = useState([WELCOME_MESSAGE]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [agentThinking, setAgentThinking] = useState("");

  const handleSendMessage = async (text, contextJob = null) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      type: "text",
      text,
    };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatLoading(true);
    setAgentThinking("Thinking...");

    // Build history to send (last 10 messages for context, keeping full structure for turn memory)
    const historyToSend = chatHistory
      .filter((m) => m.sender === "user" || m.sender === "ai")
      .slice(-10);

    // If a job is focused, prepend context
    let enrichedMessage = text;
    if (contextJob) {
      enrichedMessage = `[Context: Currently viewing job "${contextJob.title}" at ${contextJob.company || "unknown"} — Match Score: ${contextJob.matchScore}%, Job ID: ${contextJob.id}]\n\n${text}`;
    } else if (selectedJob) {
      enrichedMessage = `[Context: Currently viewing job "${selectedJob.title}" at ${selectedJob.company || "unknown"} — Match Score: ${selectedJob.matchScore}%, Job ID: ${selectedJob.id}]\n\n${text}`;
    }

    try {
      setAgentThinking("Running tools...");
      const result = await agentService.sendMessage(enrichedMessage, historyToSend);

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        isAgent: true,
        type: "text",
        text: result.reply,
        actions: result.actions || [],
        suggestedActions: result.suggestedActions || [],
      };
      setChatHistory((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Agent error:", err);
      setChatHistory((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          isAgent: true,
          type: "text",
          text: err.message || "Scout encountered an error. Please try again.",
          actions: [],
        },
      ]);
    } finally {
      setChatLoading(false);
      setAgentThinking("");
    }
  };

  const askAIAboutJob = async (job, navigate) => {
    setSelectedJob(job);
    navigate(ROUTES.COPILOT);
    await handleSendMessage(
      `Analyze this job and tell me if I should apply: "${job.title}"${job.company ? ` at ${job.company}` : ""}. What are my chances, what's missing, and what's your recommendation?`,
      job
    );
  };

  const askAISkillGap = async (job, navigate) => {
    setSelectedJob(job);
    navigate(ROUTES.COPILOT);
    await handleSendMessage(
      `Show me my skill gap for this role: "${job.title}"${job.company ? ` at ${job.company}` : ""}`,
      job
    );
  };

  const askAIInterviewPrep = async (job, navigate) => {
    setSelectedJob(job);
    navigate(ROUTES.COPILOT);
    await handleSendMessage(
      `Generate interview prep questions for "${job.title}"${job.company ? ` at ${job.company}` : ""}`,
      job
    );
  };

  const clearHistory = () => {
    setChatHistory([
      {
        ...WELCOME_MESSAGE,
        id: `welcome-${Date.now()}`,
        text: "Conversation cleared. Ready to help — what's your next move?",
      },
    ]);
    setSelectedJob(null);
  };

  return (
    <AIContext.Provider
      value={{
        chatHistory,
        selectedJob,
        voiceMode,
        chatLoading,
        agentThinking,
        setSelectedJob,
        setVoiceMode,
        sendMessage: handleSendMessage,
        askAIAboutJob,
        askAISkillGap,
        askAIInterviewPrep,
        clearHistory,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
}
