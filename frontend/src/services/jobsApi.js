import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://jobscout-backend-8ytl.onrender.com/api";

export const jobsApi = {
  getJobs: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      if (response.data && response.data.success) {
        return response.data.jobs;
      }
      return [];
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
  },

  getSavedJobs: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      if (response.data && response.data.success) {
        return response.data.jobs.filter(job => job.status === "saved");
      }
      return [];
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      return [];
    }
  },

  getAppliedJobs: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      if (response.data && response.data.success) {
        return response.data.jobs.filter(job => ["applied", "interview", "rejected", "offer"].includes(job.status));
      }
      return [];
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
      return [];
    }
  },

  getAnalytics: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/analytics`);
      if (response.data && response.data.success) {
        return response.data.analytics;
      }
      return {
        stats: { totalFound: 0, highMatch: 0, saved: 0, applied: 0, interviewRate: 0, offerRate: 0 },
        pipeline: { applied: 0, interview: 0, rejected: 0, offer: 0 },
        monthlyApplications: []
      };
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return {
        stats: { totalFound: 0, highMatch: 0, saved: 0, applied: 0, interviewRate: 0, offerRate: 0 },
        pipeline: { applied: 0, interview: 0, rejected: 0, offer: 0 },
        monthlyApplications: []
      };
    }
  },

  updateJobStatus: async (jobId, status) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/jobs/${jobId}`, { status });
      return response.data.success;
    } catch (error) {
      console.error("Error updating job status:", error);
      return false;
    }
  },

  runScout: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/scout/run`);
      return response.data;
    } catch (error) {
      console.error("Error running job collection scout:", error);
      throw error;
    }
  },

  // Phase 7.0 – AI Daily Career Brief
  getDailySummary: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/daily-summary`);
      if (response.data && response.data.success) {
        return response.data.summary;
      }
      return null;
    } catch (error) {
      console.error("Error fetching daily summary:", error);
      return null;
    }
  },

  // Phase 7.5.2 – AI Job Advisor Engine
  getJobAdvice: async (jobId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}/advice`);
      if (response.data && response.data.success) {
        return response.data.advice;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching advice for job ${jobId}:`, error);
      return null;
    }
  },

  // Phase 8.0 – AI Resume Tailoring Engine
  tailorJobResume: async (jobId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/jobs/${jobId}/tailor-resume`);
      if (response.data && response.data.success) {
        return response.data.tailoredResume;
      }
      return null;
    } catch (error) {
      console.error(`Error tailoring resume for job ${jobId}:`, error);
      return null;
    }
  }
};
