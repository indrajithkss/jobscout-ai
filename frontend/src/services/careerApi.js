// frontend/src/services/careerApi.js
// Phase 7.5.1 – Career Intelligence API client

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://jobscout-backend-8ytl.onrender.com/api";

export const careerApi = {
  /**
   * Fetches the full Career Intelligence object.
   * Returns null on error so components degrade gracefully.
   */
  getIntelligence: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/career/intelligence`);
      if (response.data && response.data.success) {
        const { success, ...data } = response.data;
        return data;
      }
      return null;
    } catch (error) {
      console.error("[careerApi] Error fetching career intelligence:", error);
      return null;
    }
  },

  /**
   * Fetches the full Career Knowledge data.
   */
  getKnowledge: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/career/knowledge`);
      if (response.data && response.data.success) {
        return response.data.knowledge;
      }
      return null;
    } catch (error) {
      console.error("[careerApi] Error fetching career knowledge:", error);
      return null;
    }
  }
};
