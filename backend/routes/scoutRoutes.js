const express = require("express");
const router = express.Router();
const { runScout } = require("../services/jobScoutService");
const fs = require("fs");
const path = require("path");

const LAST_SCOUT_FILE = path.join(__dirname, "../utils/lastScoutRun.json");

router.post("/run", async (req, res) => {
  try {
    const result = await runScout();
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("Scout Run Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/diagnostics", async (req, res) => {
  try {
    const scoutRunService = require("../services/scoutRunService");
    const lastRun = await scoutRunService.getLatestScoutRun();

    // Free providers — always active, no keys required
    const providers = [
      { provider: "Remotive",  configured: true, healthy: true, note: "Free API — no key required" },
      { provider: "Arbeitnow", configured: true, healthy: true, note: "Free API — no key required" },
      { provider: "The Muse",  configured: true, healthy: true, note: "Free API — no key required" }
    ];

    let filterBreakdown = {
      indiaJobsFound: lastRun ? lastRun.india_jobs_found : 0,
      globalJobsFiltered: 0
    };

    try {
      if (fs.existsSync(LAST_SCOUT_FILE)) {
        const fileStats = JSON.parse(fs.readFileSync(LAST_SCOUT_FILE, "utf-8"));
        filterBreakdown.globalJobsFiltered = fileStats.globalJobsFiltered || 0;
        if (fileStats.indiaJobsFound) {
          filterBreakdown.indiaJobsFound = fileStats.indiaJobsFound;
        }
      }
    } catch (err) {
      console.error("Failed to read lastScoutRun.json for diagnostics:", err);
    }

    res.json({
      success: true,
      providers,
      lastRun: lastRun || {},
      sourceBreakdown: (lastRun && lastRun.source_breakdown) ? lastRun.source_breakdown : {},
      filterBreakdown
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
