import axios from "axios";

const BASE = "http://localhost:5000/api";

export const aiService = {
  /**
   * Simple chat — sends a single message to the basic Gemini copilot.
   */
  sendMessage: async (message) => {
    try {
      const response = await axios.post(
        `${BASE}/copilot/chat`,
        { message },
        { timeout: 15000 }
      );
      if (response.data?.success && response.data?.reply) {
        return response.data.reply;
      }
      throw new Error("Invalid backend response format");
    } catch (error) {
      console.error("Copilot API error:", error);
      throw new Error("Unable to contact JobScout AI. Please try again.");
    }
  },
};

export const agentService = {
  /**
   * Agent chat — sends message + full history to the Scout agent.
   * Returns { reply: string, actions: Array }
   */
  sendMessage: async (message, history = []) => {
    try {
      const response = await axios.post(
        `${BASE}/agent/chat`,
        { message, history },
        { timeout: 30000 } // agents can take longer
      );
      if (response.data?.success) {
        return {
          reply: response.data.reply,
          actions: response.data.actions || [],
          suggestedActions: response.data.suggestedActions || [],
        };
      }
      throw new Error(response.data?.error || "Agent error");
    } catch (error) {
      console.error("Agent API error:", error);
      throw new Error(
        error.response?.data?.error ||
          "Scout is temporarily unavailable. Please try again."
      );
    }
  },
};
