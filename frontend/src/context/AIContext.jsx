import React, { createContext, useContext, useState } from "react";
import { aiService } from "../services/aiService";
import { ROUTES } from "../constants/routes";

const AIContext = createContext();

export function AIProvider({ children }) {
  const [chatHistory, setChatHistory] = useState([
    {
      id: "welcome",
      sender: "ai",
      type: "text",
      text: `Hello Indrajith! As your **AI Career Copilot**, I am here to help you secure your next dream role. 

You can ask me to:
- **Find jobs**: "Show remote MERN jobs matched to my profile"
- **Analyze skill gaps**: "Analyze my skill gap against Senior React roles"
- **Prepare for interviews**: "Generate interview prep questions for Next.js"
- **Audit specific roles**: Click "Ask AI About This Job" in any job details view to analyze its career impact.

What would you like to explore today?`
    }
  ]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const candidateProfile = {
    name: "Indrajith KS",
    role: "MERN Developer",
    skills: ["React", "Express.js", "Node.js", "MongoDB", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Supabase", "SQL"]
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      type: "text",
      text
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const reply = await aiService.sendMessage(text, chatHistory);
      setChatHistory(prev => [...prev, reply]);
    } catch (err) {
      console.error("Failed to generate AI response", err);
      setChatHistory(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          type: "text",
          text: "I encountered an error trying to process that prompt. Please try again."
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const askAIAboutJob = async (job, navigate) => {
    setSelectedJob(job);
    const promptText = `Analyze this role:\n**${job.title}** at **${job.company}**\nLocation: ${job.location}\nMatch Score: ${job.matchScore}%`;
    
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      type: "text",
      text: promptText
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatLoading(true);
    
    // Redirect users to the flagship /copilot view
    navigate(ROUTES.COPILOT);

    try {
      const reply = await aiService.sendMessage(promptText, chatHistory);
      setChatHistory(prev => [...prev, reply]);
    } catch (err) {
      console.error("Failed to analyze job context", err);
      setChatHistory(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "ai",
          type: "text",
          text: "I encountered an error analyzing that job. Please try again."
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearHistory = () => {
    setChatHistory([
      {
        id: "welcome-reset",
        sender: "ai",
        type: "text",
        text: "Conversation cleared. How can your career agent assist you now?"
      }
    ]);
  };

  return (
    <AIContext.Provider
      value={{
        chatHistory,
        selectedJob,
        candidateProfile,
        voiceMode,
        chatLoading,
        setSelectedJob,
        setVoiceMode,
        sendMessage: handleSendMessage,
        askAIAboutJob,
        clearHistory
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
