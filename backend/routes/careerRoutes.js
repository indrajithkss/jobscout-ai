// backend/routes/careerRoutes.js
// Phase 7.5.1 – Career Intelligence API

const express = require("express");
const router = express.Router();
const { getCareerIntelligence } = require("../services/careerIntelligenceService");
const { buildCandidateKnowledge } = require("../services/careerKnowledgeService");

// GET /api/career/intelligence
router.get("/intelligence", async (req, res) => {
  try {
    const intelligence = await getCareerIntelligence();
    res.json({
      success: true,
      ...intelligence,
    });
  } catch (err) {
    console.error("[CareerRoutes] /intelligence error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// GET /api/career/knowledge
router.get("/knowledge", async (req, res) => {
  try {
    const knowledge = await buildCandidateKnowledge();
    res.json({
      success: true,
      knowledge
    });
  } catch (err) {
    console.error("[CareerRoutes] /knowledge error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
