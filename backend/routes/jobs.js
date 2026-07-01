const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");
const { getLatestProfile } = require("../services/profileService");
const { enrichJobs } = require("../services/jobScoutService");
const { generateDailySummary } = require("../services/dailySummaryService");
const { generateAdvisor } = require("../services/advisorService");
const { generateResumePreview } = require("../services/resumeTailoringService");
const fs = require("fs");
const path = require("path");
const PREF_FILE = path.join(__dirname, "../utils/preferences.json");
const LAST_SCOUT_FILE = path.join(__dirname, "../utils/lastScoutRun.json");

// 1. Get all jobs (enriched)
router.get("/", async (req, res) => {
  try {
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (jobsError) {
      return res.status(500).json({
        success: false,
        error: jobsError.message,
      });
    }

    let profileSkills = [];
    try {
      const profile = await getLatestProfile();
      if (profile && profile.skills) {
        profileSkills = profile.skills;
      }
    } catch (err) {
      console.error("Failed to fetch profile skills for enrichment:", err);
    }

    const enriched = enrichJobs(jobs || [], profileSkills);

    res.json({
      success: true,
      jobs: enriched,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// 2. Get analytics
router.get("/analytics", async (req, res) => {
  try {
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, status, ai_score, discovery_type, source_type");

    if (jobsError) {
      return res.status(500).json({
        success: false,
        error: jobsError.message,
      });
    }

    const list = jobs || [];
    const totalFound = list.length;
    const highMatch = list.filter(j => j.ai_score >= 80).length;
    const saved = list.filter(j => j.status === "saved").length;

    const appliedList = list.filter(j => ["applied", "interview", "rejected", "offer"].includes(j.status));
    const applied = appliedList.length;

    const pipeline = {
      applied: list.filter(j => j.status === "applied").length,
      interview: list.filter(j => j.status === "interview").length,
      rejected: list.filter(j => j.status === "rejected").length,
      offer: list.filter(j => j.status === "offer").length,
    };

    const resumeMatches = list.filter(j => j.status === "new" && j.discovery_type === "resume").length;
    const preferenceMatches = list.filter(j => j.status === "new" && j.discovery_type === "preference").length;
    const bothMatches = list.filter(j => j.status === "new" && j.discovery_type === "both").length;

    // Real vs Generated tracking (Phase 5.5)
    const realJobsFound = list.filter(j => j.source_type === "real" || !j.source_type).length;
    const generatedJobsFound = list.filter(j => j.source_type === "generated").length;

    // India filter validation stats (Phase 5.6) — read from last scout run file
    let indiaJobsFound = 0;
    let globalJobsFiltered = 0;
    let scoutedAt = null;
    try {
      if (fs.existsSync(LAST_SCOUT_FILE)) {
        const lastRun = JSON.parse(fs.readFileSync(LAST_SCOUT_FILE, "utf-8"));
        indiaJobsFound = lastRun.indiaJobsFound || 0;
        globalJobsFiltered = lastRun.globalJobsFiltered || 0;
        scoutedAt = lastRun.scoutedAt || null;
      } else {
        // Fallback: estimate from current DB jobs (all saved jobs were India-eligible)
        indiaJobsFound = totalFound;
        globalJobsFiltered = 0;
      }
    } catch (_) {
      indiaJobsFound = totalFound;
      globalJobsFiltered = 0;
    }

    // Latest run history record (Phase 6.1)
    let latestScoutRun = null;
    try {
      const scoutRunService = require("../services/scoutRunService");
      latestScoutRun = await scoutRunService.getLatestScoutRun();
    } catch (err) {
      console.error("Failed to fetch latest scout run for analytics:", err);
    }

    const totalAppliedAndHigher = applied;
    const interviewRate = totalAppliedAndHigher > 0
      ? Math.round(((pipeline.interview + pipeline.offer) / totalAppliedAndHigher) * 100)
      : 0;
    const offerRate = totalAppliedAndHigher > 0
      ? Math.round((pipeline.offer / totalAppliedAndHigher) * 100)
      : 0;

    const monthlyApplications = [
      { month: "Jan", found: 28, applied: 3, interviews: 1, offers: 0 },
      { month: "Feb", found: 35, applied: 4, interviews: 2, offers: 0 },
      { month: "Mar", found: 42, applied: 5, interviews: 1, offers: 1 },
      { month: "Apr", found: 49, applied: 7, interviews: 3, offers: 0 },
      { month: "May", found: 56, applied: 8, interviews: 4, offers: 1 },
      { month: "Jun", found: totalFound, applied: applied, interviews: pipeline.interview, offers: pipeline.offer }
    ];

    res.json({
      success: true,
      analytics: {
        stats: {
          totalFound,
          highMatch,
          saved,
          applied, // Applications Sent
          interviews: pipeline.interview,
          offers: pipeline.offer,
          resumeMatches,
          preferenceMatches,
          bothMatches,
          realJobsFound,
          generatedJobsFound,
          indiaJobsFound,
          globalJobsFiltered,
          scoutedAt,
          preferredCountry: (() => {
            try {
              if (fs.existsSync(PREF_FILE)) {
                return JSON.parse(fs.readFileSync(PREF_FILE, "utf-8")).preferred_country || "India";
              }
            } catch (_) {}
            return "India";
          })(),
          interviewRate,
          offerRate,
          latestScoutRun // Phase 6.1
        },
        pipeline,
        monthlyApplications
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// 2.5. Get job advice (AI Advisor Engine)
router.get("/:id/advice", async (req, res) => {
  try {
    const { id } = req.params;
    const advice = await generateAdvisor(id);
    res.json({
      success: true,
      advice: {
        priority: advice.priority,
        priorityScore: advice.priorityScore,
        applyReason: advice.applyReason,
        missingSkills: advice.missingSkills,
        resumeTips: advice.resumeTips,
        interviewTopics: advice.interviewTopics,
        estimatedImprovement: advice.estimatedImprovement
      }
    });
  } catch (err) {
    console.error("[AdvisorRoute] Error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// 2.6. Post job tailoring (ATS Resume Optimization Engine)
router.post("/:id/tailor-resume", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await generateResumePreview(id);
    res.json({
      success: true,
      tailoredResume: {
        summary: {
          original: result.summary.original,
          tailored: result.summary.tailored,
          notes: result.summary.notes
        },
        skills: {
          original: result.skills.original,
          optimized: result.skills.optimized,
          hidden: result.skills.hidden,
          recommended: result.skills.recommended
        },
        projects: {
          recommendedOrder: result.projects.recommendedOrder,
          reason: result.projects.reason,
          relevantTechnologies: result.projects.relevantTechnologies
        },
        keywords: {
          matched: result.keywords.matched,
          missing: result.keywords.missing,
          recommended: result.keywords.recommended,
          coverage: result.keywords.coverage
        },
        ats: {
          current: result.ats.current,
          expected: result.ats.expected,
          improvement: result.ats.improvement
        },
        notes: result.notes
      }
    });
  } catch (err) {
    console.error("[TailorRoute] Error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// 3. Update job status
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: "Status is required" });
    }

    status = status.toLowerCase();

    // Map UI "none" representation to "new" database representation
    if (status === "none") {
      status = "new";
    }

    const allowedStatuses = ["new", "saved", "applied", "interview", "offer", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status: ${status}` });
    }

    const { data, error } = await supabase
      .from("jobs")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      job: data[0]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// 4. Seed Route (kept for compatibility)
router.post("/seed", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .insert([
        {
          title: "Full Stack Developer",
          company: "ABC Technologies",
          location: "Bangalore",
          source: "Wellfound",
          apply_link: "https://example.com",
          description: "React + Node.js Developer",
          ai_score: 90,
          status: "new"
        }
      ])
      .select();

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// 5. Daily Career Brief Summary (Phase 7.0)
router.get("/daily-summary", async (req, res) => {
  try {
    const summary = await generateDailySummary();
    res.json({
      success: true,
      summary,
    });
  } catch (err) {
    console.error("[DailySummary] Route error:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;