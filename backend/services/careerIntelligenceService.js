// backend/services/careerIntelligenceService.js
// Phase 7.5.1 – AI Career Intelligence Engine
// All scores are computed dynamically from live Supabase data.
// No hardcoded benchmark values.

const { supabase } = require("../config/supabase");

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Clamp a value between 0 and 100 and round to integer. */
const clamp = (v) => Math.min(100, Math.max(0, Math.round(v)));

/**
 * Build a frequency map of all skills demanded across a list of job rows.
 * Uses both matched_skills and missing_skills from DB rows.
 * @param {Array} jobs  Raw Supabase job rows
 * @returns {Map<string, { label: string, count: number }>}
 */
function buildDemandMap(jobs) {
  const map = new Map();
  jobs.forEach((job) => {
    const skills = [
      ...(job.matched_skills || []),
      ...(job.missing_skills || []),
    ];
    skills.forEach((s) => {
      const key = s.toLowerCase().trim();
      if (!key) return;
      if (!map.has(key)) map.set(key, { label: s, count: 0 });
      map.get(key).count += 1;
    });
  });
  return map;
}

// ─── Dimension Calculators ───────────────────────────────────────────────────

/**
 * Resume Strength (25% weight)
 * Measures profile completeness from candidate_profiles.
 * Scoring rubric (all cumulative, max 100):
 *   - Has name:             10
 *   - Has email:            10
 *   - Skills count:         up to 40 (4 pts per skill, capped at 10 skills)
 *   - Projects count:       up to 20 (5 pts per project, capped at 4)
 *   - Has education:        10
 *   - Experience length:    up to 10 (1 pt per 50 chars, capped at 500 chars)
 */
async function calculateResumeStrength() {
  try {
    const { data, error } = await supabase
      .from("candidate_profiles")
      .select("name, email, skills, projects, education, experience")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return 0;
    const p = data[0];

    let score = 0;
    if (p.name && p.name.trim()) score += 10;
    if (p.email && p.email.trim()) score += 10;

    const skillCount = Array.isArray(p.skills) ? p.skills.length : 0;
    score += Math.min(40, skillCount * 4);

    const projCount = Array.isArray(p.projects) ? p.projects.length : 0;
    score += Math.min(20, projCount * 5);

    if (p.education && p.education.trim()) score += 10;

    const expLen = (p.experience || "").length;
    score += Math.min(10, Math.floor(expLen / 50));

    return clamp(score);
  } catch (err) {
    console.error("[CareerIntelligence] calculateResumeStrength error:", err.message);
    return 0;
  }
}

/**
 * Skills Match (30% weight)
 * % of unique market-demanded skills covered by the candidate's profile skills.
 * Market demand = union of all matched_skills + missing_skills across current jobs.
 */
async function calculateSkillsMatch() {
  try {
    const [profileRes, jobsRes] = await Promise.all([
      supabase
        .from("candidate_profiles")
        .select("skills")
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("jobs")
        .select("matched_skills, missing_skills"),
    ]);

    if (profileRes.error || jobsRes.error) return 0;
    if (!profileRes.data || profileRes.data.length === 0) return 0;

    const profileSkills = (profileRes.data[0].skills || []).map((s) =>
      s.toLowerCase().trim()
    );
    if (profileSkills.length === 0) return 0;

    const jobs = jobsRes.data || [];
    if (jobs.length === 0) return 0;

    // Build unique market demand set
    const demandSet = new Set();
    jobs.forEach((job) => {
      [...(job.matched_skills || []), ...(job.missing_skills || [])].forEach(
        (s) => demandSet.add(s.toLowerCase().trim())
      );
    });
    if (demandSet.size === 0) return 0;

    // Count how many demanded skills the candidate covers
    let covered = 0;
    demandSet.forEach((demanded) => {
      const match = profileSkills.some(
        (cs) => cs === demanded || cs.includes(demanded) || demanded.includes(cs)
      );
      if (match) covered++;
    });

    return clamp((covered / demandSet.size) * 100);
  } catch (err) {
    console.error("[CareerIntelligence] calculateSkillsMatch error:", err.message);
    return 0;
  }
}

/**
 * Project Relevance (20% weight)
 * Measures how well candidate's projects align with market demands.
 * Method: keyword match between project strings and top-demand skill terms.
 */
async function calculateProjectRelevance() {
  try {
    const [profileRes, jobsRes] = await Promise.all([
      supabase
        .from("candidate_profiles")
        .select("projects, skills")
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("jobs")
        .select("matched_skills, missing_skills"),
    ]);

    if (profileRes.error || jobsRes.error) return 0;
    if (!profileRes.data || profileRes.data.length === 0) return 0;

    const profile = profileRes.data[0];
    const projects = Array.isArray(profile.projects) ? profile.projects : [];
    if (projects.length === 0) return 0;

    // Build demand map from jobs
    const jobs = jobsRes.data || [];
    const demandMap = buildDemandMap(jobs);
    if (demandMap.size === 0) return 0;

    // Get top 20 demanded skill keywords
    const topDemanded = Array.from(demandMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map((d) => d.label.toLowerCase());

    // Build project text corpus
    const projectText = projects.join(" ").toLowerCase();
    const profileSkillText = (profile.skills || []).join(" ").toLowerCase();
    const corpus = `${projectText} ${profileSkillText}`;

    // Count matched demand keywords in corpus
    let matched = 0;
    topDemanded.forEach((keyword) => {
      if (corpus.includes(keyword)) matched++;
    });

    // Score: % of top demanded skills mentioned in projects, scaled generously
    // (having 5/20 = 25%, but that's actually strong project alignment → scale to 0–100)
    const rawPct = matched / topDemanded.length;
    // Scale: 0→0, 0.25→60, 0.5→80, 1.0→100 using sqrt-ish curve
    const scaled = Math.sqrt(rawPct) * 100;

    return clamp(scaled);
  } catch (err) {
    console.error("[CareerIntelligence] calculateProjectRelevance error:", err.message);
    return 0;
  }
}

/**
 * Application Activity (15% weight)
 * Ratio of jobs actioned (saved/applied/interview/offer) vs total jobs discovered.
 * Represents how proactively the candidate is engaging with matches.
 */
async function calculateApplicationActivity() {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("status");

    if (error || !data || data.length === 0) return 0;

    const total = data.length;
    const actioned = data.filter((j) =>
      ["saved", "applied", "interview", "offer"].includes(j.status)
    ).length;

    if (total === 0) return 0;

    // Raw ratio, but scale it: even 10% engagement is decent (30 pts)
    // 20% engagement = 50 pts, 50% = 80 pts (very active), 100% = 100
    const ratio = actioned / total;
    const scaled = Math.sqrt(ratio) * 100;

    return clamp(scaled);
  } catch (err) {
    console.error("[CareerIntelligence] calculateApplicationActivity error:", err.message);
    return 0;
  }
}

/**
 * Interview Readiness (10% weight)
 * Derived from average AI score of jobs at interview/offer status.
 * Fallback: uses average score of all applied jobs.
 * Further fallback: uses average of all saved jobs.
 * Baseline of 30 if no jobs have progressed at all (new user).
 */
async function calculateInterviewReadiness() {
  try {
    const { data, error } = await supabase
      .from("jobs")
      .select("status, ai_score");

    if (error || !data || data.length === 0) return 30;

    // Primary: jobs at interview or offer stage
    const interviewJobs = data.filter((j) =>
      ["interview", "offer"].includes(j.status)
    );
    if (interviewJobs.length > 0) {
      const avg =
        interviewJobs.reduce((sum, j) => sum + (j.ai_score || 0), 0) /
        interviewJobs.length;
      return clamp(avg);
    }

    // Fallback 1: applied jobs avg score
    const appliedJobs = data.filter((j) => j.status === "applied");
    if (appliedJobs.length > 0) {
      const avg =
        appliedJobs.reduce((sum, j) => sum + (j.ai_score || 0), 0) /
        appliedJobs.length;
      // Discount slightly — applied but not interviewed yet
      return clamp(avg * 0.8);
    }

    // Fallback 2: saved jobs avg score
    const savedJobs = data.filter((j) => j.status === "saved");
    if (savedJobs.length > 0) {
      const avg =
        savedJobs.reduce((sum, j) => sum + (j.ai_score || 0), 0) /
        savedJobs.length;
      return clamp(avg * 0.6);
    }

    // Baseline for completely new users
    return 30;
  } catch (err) {
    console.error("[CareerIntelligence] calculateInterviewReadiness error:", err.message);
    return 30;
  }
}

/**
 * Career Readiness (composite score)
 * Weighted average of all 5 dimensions:
 *   Resume Strength:      25%
 *   Skills Match:         30%
 *   Project Relevance:    20%
 *   Application Activity: 15%
 *   Interview Readiness:  10%
 */
async function calculateCareerReadiness(scores) {
  const {
    resumeStrength,
    skillsMatch,
    projectRelevance,
    applicationActivity,
    interviewReadiness,
  } = scores;

  const weighted =
    resumeStrength * 0.25 +
    skillsMatch * 0.30 +
    projectRelevance * 0.20 +
    applicationActivity * 0.15 +
    interviewReadiness * 0.10;

  return clamp(weighted);
}

// ─── Goal & Roadmap Generators ───────────────────────────────────────────────

/**
 * Weekly Goal
 * Identifies the single highest-impact missing skill and recommends a focused action.
 * @returns {{ skill, demandCount, estimatedHours, expectedScoreGain, action }}
 */
async function generateWeeklyGoal() {
  try {
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("missing_skills, ai_score");

    if (error || !jobs || jobs.length === 0) {
      return {
        skill: "Run a Scout Scan",
        demandCount: 0,
        estimatedHours: 0,
        expectedScoreGain: 0,
        action: "Run a scout scan to discover jobs and generate your weekly goal.",
      };
    }

    // Build missing skills frequency
    const freq = new Map();
    jobs.forEach((job) => {
      (job.missing_skills || []).forEach((s) => {
        const key = s.toLowerCase().trim();
        if (!key) return;
        if (!freq.has(key)) freq.set(key, { label: s, count: 0, avgJobScore: 0, jobScores: [] });
        const entry = freq.get(key);
        entry.count += 1;
        if (job.ai_score) entry.jobScores.push(job.ai_score);
      });
    });

    if (freq.size === 0) {
      return {
        skill: "Apply to More Jobs",
        demandCount: 0,
        estimatedHours: 0,
        expectedScoreGain: 5,
        action: "Your skills already cover current market demands. Focus on applying to high-match roles.",
      };
    }

    // Pick top skill by demand count
    const sorted = Array.from(freq.values()).sort((a, b) => b.count - a.count);
    const top = sorted[0];

    // Estimate hours based on skill type
    const SKILL_HOURS = {
      docker: 12, kubernetes: 20, aws: 24, typescript: 15, graphql: 10,
      redis: 8, postgresql: 12, mongodb: 10, python: 20, rust: 30,
      terraform: 16, go: 24, react: 15, "next.js": 12, vue: 12,
      angular: 16, "node.js": 12, express: 8, django: 16, fastapi: 10,
    };
    const key = top.label.toLowerCase();
    const estimatedHours =
      SKILL_HOURS[key] ||
      (top.count >= 5 ? 20 : top.count >= 3 ? 14 : 8);

    // Expected score gain: proportional to how many jobs it unlocks
    const expectedScoreGain = Math.min(15, Math.round((top.count / jobs.length) * 50));

    // Generate action recommendation
    const ACTION_MAP = {
      docker: "Build and dockerise a Node.js or Python app. Push to Docker Hub.",
      kubernetes: "Complete the official Kubernetes basics course and deploy a local cluster.",
      aws: "Deploy a full-stack app on AWS EC2 with S3 storage and RDS database.",
      typescript: "Convert an existing JavaScript project to TypeScript with strict mode.",
      graphql: "Build a GraphQL API with Apollo Server and connect it to a React frontend.",
      redis: "Integrate Redis caching into an existing Express API project.",
      terraform: "Provision an AWS S3 bucket and EC2 instance using Terraform modules.",
    };

    const action =
      ACTION_MAP[key] ||
      `Build a project that demonstrates ${top.label} and add it to your resume to signal this skill.`;

    return {
      skill: top.label,
      demandCount: top.count,
      estimatedHours,
      expectedScoreGain,
      action,
    };
  } catch (err) {
    console.error("[CareerIntelligence] generateWeeklyGoal error:", err.message);
    return {
      skill: "Unknown",
      demandCount: 0,
      estimatedHours: 0,
      expectedScoreGain: 0,
      action: "Run a scout scan to generate your weekly goal.",
    };
  }
}

/**
 * Skill Roadmap
 * Ranks all missing skills by: demand frequency × inverse current skill overlap.
 * Returns top 8 skills with priority, impact tier, estimated hours.
 * @returns {Array<{ skill, demandCount, matchImpact, priority, estimatedHours }>}
 */
async function generateSkillRoadmap() {
  try {
    const [profileRes, jobsRes] = await Promise.all([
      supabase
        .from("candidate_profiles")
        .select("skills")
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("jobs")
        .select("missing_skills, matched_skills, ai_score"),
    ]);

    if (profileRes.error || jobsRes.error) return [];
    const profile = profileRes.data?.[0] || {};
    const jobs = jobsRes.data || [];

    const profileSkillsLower = (profile.skills || []).map((s) =>
      s.toLowerCase().trim()
    );

    // Build missing skill frequency map
    const freq = new Map();
    jobs.forEach((job) => {
      (job.missing_skills || []).forEach((s) => {
        const key = s.toLowerCase().trim();
        if (!key) return;
        if (!freq.has(key))
          freq.set(key, { label: s, missingCount: 0, totalCount: 0 });
        freq.get(key).missingCount += 1;
        freq.get(key).totalCount += 1;
      });
      (job.matched_skills || []).forEach((s) => {
        const key = s.toLowerCase().trim();
        if (!key) return;
        if (!freq.has(key))
          freq.set(key, { label: s, missingCount: 0, totalCount: 0 });
        freq.get(key).totalCount += 1;
      });
    });

    // Filter to only skills the candidate is MISSING
    const missingOnly = Array.from(freq.entries())
      .filter(([key]) => {
        return !profileSkillsLower.some(
          (cs) => cs === key || cs.includes(key) || key.includes(cs)
        );
      })
      .map(([key, data]) => ({
        skill: data.label,
        demandCount: data.missingCount,
        totalCount: data.totalCount,
        missingRate: data.totalCount > 0 ? data.missingCount / data.totalCount : 0,
      }));

    if (missingOnly.length === 0) return [];

    const maxDemand = Math.max(...missingOnly.map((s) => s.demandCount));

    // Score each skill: demand * missing rate (skills you don't have that are frequently required)
    const scored = missingOnly
      .map((s) => ({
        ...s,
        score: s.demandCount * s.missingRate,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    // Assign priority and impact tier
    const SKILL_HOURS = {
      docker: 12, kubernetes: 20, aws: 24, typescript: 15, graphql: 10,
      redis: 8, postgresql: 12, mongodb: 10, python: 20, rust: 30,
      terraform: 16, go: 24, react: 15, "next.js": 12, vue: 12,
      angular: 16, "node.js": 12, express: 8, django: 16, fastapi: 10,
    };

    return scored.map((s, idx) => {
      const normalizedDemand = maxDemand > 0 ? s.demandCount / maxDemand : 0;
      const matchImpact =
        normalizedDemand >= 0.7 ? "High" :
        normalizedDemand >= 0.4 ? "Medium" : "Low";

      const key = s.skill.toLowerCase();
      const estimatedHours = SKILL_HOURS[key] || (s.demandCount >= 5 ? 20 : s.demandCount >= 3 ? 14 : 8);

      return {
        skill: s.skill,
        demandCount: s.demandCount,
        matchImpact,
        priority: idx + 1,
        estimatedHours,
      };
    });
  } catch (err) {
    console.error("[CareerIntelligence] generateSkillRoadmap error:", err.message);
    return [];
  }
}

// ─── Master Export ───────────────────────────────────────────────────────────

/**
 * Computes the full Career Intelligence object.
 * Runs all dimension calculations in parallel for performance.
 * @returns {Promise<Object>}
 */
async function getCareerIntelligence() {
  const [
    resumeStrength,
    skillsMatch,
    projectRelevance,
    applicationActivity,
    interviewReadiness,
    weeklyGoal,
    skillRoadmap,
  ] = await Promise.all([
    calculateResumeStrength(),
    calculateSkillsMatch(),
    calculateProjectRelevance(),
    calculateApplicationActivity(),
    calculateInterviewReadiness(),
    generateWeeklyGoal(),
    generateSkillRoadmap(),
  ]);

  const scores = {
    resumeStrength,
    skillsMatch,
    projectRelevance,
    applicationActivity,
    interviewReadiness,
  };

  const careerReadiness = await calculateCareerReadiness(scores);

  console.log(`[CareerIntelligence] Readiness: ${careerReadiness}% | Resume: ${resumeStrength} | Skills: ${skillsMatch} | Projects: ${projectRelevance} | Activity: ${applicationActivity} | Interview: ${interviewReadiness}`);

  return {
    careerReadiness,
    resumeStrength,
    skillsMatch,
    projectRelevance,
    applicationActivity,
    interviewReadiness,
    weeklyGoal,
    skillRoadmap,
  };
}

module.exports = {
  getCareerIntelligence,
  calculateCareerReadiness,
  calculateResumeStrength,
  calculateSkillsMatch,
  calculateProjectRelevance,
  calculateApplicationActivity,
  calculateInterviewReadiness,
  generateWeeklyGoal,
  generateSkillRoadmap,
};
