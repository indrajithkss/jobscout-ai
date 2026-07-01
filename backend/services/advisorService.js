// backend/services/advisorService.js
// AI Job Advisor Engine – Deterministic, reusable analysis layer.
// Zero Gemini API calls. All logic from DB data.
// Designed for reuse by: Resume Tailoring, Cover Letter, Interview Prep, Auto Apply.

const { supabase } = require("../config/supabase");
const { getLatestProfile } = require("./profileService");
const { enrichJobs } = require("./jobScoutService");
const fs = require("fs");
const path = require("path");

const PREF_FILE = path.join(__dirname, "../utils/preferences.json");
const clamp = (v) => Math.min(100, Math.max(0, Math.round(v)));

// ─── Data Loaders ────────────────────────────────────────────────────────────

/** Load the candidate profile from Supabase. */
async function loadProfile() {
  const profile = await getLatestProfile();
  return profile || { name: "", email: "", skills: [], projects: [], education: "", experience: "" };
}

/** Load job preferences from local file or Supabase. */
async function loadPreferences() {
  try {
    if (fs.existsSync(PREF_FILE)) {
      return JSON.parse(fs.readFileSync(PREF_FILE, "utf-8"));
    }
  } catch (_) {}

  const { data } = await supabase
    .from("job_preferences")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  if (data && data.length > 0) return data[0];

  return {
    target_roles: [],
    preferred_locations: [],
    remote_allowed: true,
    preferred_country: "India",
  };
}

/** Load a single job row from Supabase and enrich it. */
async function loadJob(jobId) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

// ─── 1. generateApplyReason ──────────────────────────────────────────────────

/**
 * Explains WHY a job is recommended for this candidate.
 * Analyzes resume skills, preferred role, location, projects, experience, AI score.
 *
 * @returns {{ summary, strengths[], matchedRequirements[], matchedProjects[] }}
 */
function generateApplyReason(job, profile, preferences) {
  const profileSkills = (profile.skills || []).map((s) => s.toLowerCase());
  const matchedSkills = (job.matched_skills || []);
  const aiScore = job.ai_score || 0;
  const jobTitleLower = (job.title || "").toLowerCase();
  const jobDescLower = (job.description || "").toLowerCase();
  const jobLocationLower = (job.location || "").toLowerCase();

  // --- Strengths ---
  const strengths = [];

  // Skill alignment
  if (matchedSkills.length >= 4) {
    strengths.push(`Strong skill coverage with ${matchedSkills.length} matching skills: ${matchedSkills.slice(0, 5).join(", ")}.`);
  } else if (matchedSkills.length >= 2) {
    strengths.push(`Relevant skills include ${matchedSkills.join(", ")}.`);
  }

  // Role alignment
  const targetRoles = (preferences.target_roles || []).map((r) => r.toLowerCase());
  const roleMatch = targetRoles.some((r) => jobTitleLower.includes(r) || r.includes(jobTitleLower));
  if (roleMatch) {
    strengths.push(`This role aligns directly with your target career path.`);
  }

  // Location alignment
  const prefLocations = (preferences.preferred_locations || []).map((l) => l.toLowerCase());
  const locationMatch =
    jobLocationLower.includes("remote") ||
    prefLocations.some((l) => jobLocationLower.includes(l) || l.includes(jobLocationLower));
  if (locationMatch) {
    strengths.push(`Location (${job.location}) matches your preferences.`);
  }

  // Experience relevance
  const experienceText = (profile.experience || "").toLowerCase();
  if (experienceText.length > 50) {
    // Check if job description has keywords from experience
    const expWords = experienceText.split(/\s+/).filter((w) => w.length > 4);
    const descWords = new Set(jobDescLower.split(/\s+/));
    const overlapCount = expWords.filter((w) => descWords.has(w)).length;
    if (overlapCount >= 5) {
      strengths.push(`Your professional experience shows strong relevance to this role's requirements.`);
    }
  }

  // High AI score
  if (aiScore >= 85) {
    strengths.push(`AI analysis rates this as an excellent match at ${aiScore}%.`);
  } else if (aiScore >= 70) {
    strengths.push(`AI match score of ${aiScore}% indicates strong alignment.`);
  }

  // --- Matched Requirements ---
  const matchedRequirements = matchedSkills.map((skill) => ({
    skill,
    source: profileSkills.includes(skill.toLowerCase()) ? "resume" : "profile",
  }));

  // --- Matched Projects ---
  const projects = profile.projects || [];
  const matchedProjects = [];
  projects.forEach((proj) => {
    const projLower = (typeof proj === "string" ? proj : "").toLowerCase();
    // Check if any job skill or keyword appears in the project name
    const relevantSkills = matchedSkills.filter((s) => projLower.includes(s.toLowerCase()));
    // Also check against job description keywords
    const descKeywords = ["api", "full-stack", "fullstack", "react", "node", "android", "mobile", "database", "cloud", "deploy"];
    const descMatches = descKeywords.filter((kw) => projLower.includes(kw) && jobDescLower.includes(kw));
    const allMatches = [...new Set([...relevantSkills, ...descMatches])];

    if (allMatches.length > 0) {
      matchedProjects.push({
        project: proj,
        relevantSkills: allMatches,
        reason: `Demonstrates ${allMatches.slice(0, 3).join(", ")} relevant to this role.`,
      });
    }
  });

  // --- Summary ---
  const summaryParts = [];
  if (matchedSkills.length > 0) {
    summaryParts.push(`Your ${matchedSkills.slice(0, 3).join(", ")} experience strongly aligns with this role`);
  }
  if (matchedProjects.length > 0) {
    summaryParts.push(`Your ${matchedProjects[0].project} project demonstrates the exact skills requested`);
  }
  if (roleMatch) {
    summaryParts.push(`this position matches your target career direction`);
  }

  const summary = summaryParts.length > 0
    ? summaryParts.join(". ") + "."
    : `This role has a ${aiScore}% match with your profile. Review the skill breakdown below for details.`;

  return { summary, strengths, matchedRequirements, matchedProjects };
}

// ─── 2. generateMissingSkills ────────────────────────────────────────────────

/**
 * Analyzes each missing skill with importance, learning time, and estimated match increase.
 * @returns {Array<{ skill, importance, learningTime, estimatedMatchIncrease }>}
 */
function generateMissingSkills(job, profile) {
  const missing = job.missing_skills || [];
  const total = (job.matched_skills || []).length + missing.length;
  if (missing.length === 0 || total === 0) return [];

  // Per-skill base match increase: adding 1 skill moves the fraction
  const baseIncrease = total > 0 ? (1 / total) * 100 : 5;

  const LEARNING_DB = {
    docker: { time: "1 week", hours: 12, importance: "High" },
    kubernetes: { time: "3 weeks", hours: 20, importance: "High" },
    aws: { time: "2 weeks", hours: 24, importance: "High" },
    azure: { time: "2 weeks", hours: 20, importance: "Medium" },
    gcp: { time: "2 weeks", hours: 20, importance: "Medium" },
    typescript: { time: "1 week", hours: 15, importance: "High" },
    graphql: { time: "1 week", hours: 10, importance: "Medium" },
    redis: { time: "4 days", hours: 8, importance: "Medium" },
    postgresql: { time: "1 week", hours: 12, importance: "Medium" },
    mongodb: { time: "1 week", hours: 10, importance: "Medium" },
    python: { time: "2 weeks", hours: 20, importance: "High" },
    rust: { time: "4 weeks", hours: 30, importance: "Medium" },
    go: { time: "3 weeks", hours: 24, importance: "Medium" },
    terraform: { time: "2 weeks", hours: 16, importance: "Medium" },
    react: { time: "2 weeks", hours: 15, importance: "High" },
    "next.js": { time: "1 week", hours: 12, importance: "High" },
    vue: { time: "1 week", hours: 12, importance: "Medium" },
    angular: { time: "2 weeks", hours: 16, importance: "Medium" },
    "node.js": { time: "1 week", hours: 12, importance: "High" },
    express: { time: "4 days", hours: 8, importance: "Medium" },
    django: { time: "2 weeks", hours: 16, importance: "Medium" },
    java: { time: "3 weeks", hours: 24, importance: "High" },
    "c++": { time: "4 weeks", hours: 30, importance: "Medium" },
    swift: { time: "3 weeks", hours: 20, importance: "Medium" },
    kotlin: { time: "2 weeks", hours: 16, importance: "Medium" },
    "ci/cd": { time: "1 week", hours: 10, importance: "High" },
    webgl: { time: "3 weeks", hours: 20, importance: "Low" },
    redux: { time: "4 days", hours: 8, importance: "Medium" },
    "tailwind css": { time: "3 days", hours: 6, importance: "Low" },
    "system design": { time: "3 weeks", hours: 24, importance: "High" },
  };

  return missing.map((skill, idx) => {
    const key = skill.toLowerCase().trim();
    const info = LEARNING_DB[key] || {
      time: missing.length <= 3 ? "1 week" : "2 weeks",
      hours: 10,
      importance: idx === 0 ? "High" : idx <= 2 ? "Medium" : "Low",
    };

    // Estimate match increase: first skills contribute more (diminishing returns)
    const positionWeight = 1 / (idx + 1);
    const rawIncrease = baseIncrease * positionWeight;
    const estimatedMatchIncrease = `+${Math.max(1, Math.round(rawIncrease))}%`;

    return {
      skill,
      importance: info.importance,
      learningTime: info.time,
      estimatedMatchIncrease,
    };
  });
}

// ─── 3. generateResumeTips ───────────────────────────────────────────────────

/**
 * Generates resume improvement suggestions specific to this job.
 * @returns {string[]}
 */
function generateResumeTips(job, profile) {
  const tips = [];
  const matchedSkills = job.matched_skills || [];
  const missingSkills = job.missing_skills || [];
  const projects = profile.projects || [];
  const jobTitleLower = (job.title || "").toLowerCase();
  const jobDescLower = (job.description || "").toLowerCase();

  // 1. Project ordering suggestion
  if (projects.length > 0) {
    // Find the most relevant project
    let bestProject = null;
    let bestScore = 0;
    projects.forEach((proj) => {
      const projLower = (typeof proj === "string" ? proj : "").toLowerCase();
      const score = matchedSkills.filter((s) => projLower.includes(s.toLowerCase())).length;
      if (score > bestScore) {
        bestScore = score;
        bestProject = proj;
      }
    });
    if (bestProject && bestScore > 0) {
      tips.push(`Move "${bestProject}" to the top of your Projects section — it best demonstrates the skills this role requires.`);
    }
  }

  // 2. Highlight matched skills
  matchedSkills.slice(0, 4).forEach((skill) => {
    const skillLower = skill.toLowerCase();
    // Check if the skill appears with specific technical context in the description
    if (jobDescLower.includes(skillLower)) {
      tips.push(`Highlight ${skill} experience prominently — the job description specifically mentions it.`);
    }
  });

  // 3. Mention missing skills if candidate has adjacent skills
  const profileSkillsLower = (profile.skills || []).map((s) => s.toLowerCase());
  missingSkills.slice(0, 3).forEach((skill) => {
    const skillLower = skill.toLowerCase();
    // Check for adjacent/related skills
    const adjacencies = {
      docker: ["linux", "deployment", "devops"],
      aws: ["cloud", "deployment", "infrastructure"],
      typescript: ["javascript", "react"],
      graphql: ["api", "rest", "node"],
      redis: ["database", "caching", "mongodb"],
      kubernetes: ["docker", "devops", "cloud"],
      "next.js": ["react", "javascript", "frontend"],
      postgresql: ["sql", "database", "mysql"],
    };
    const related = adjacencies[skillLower] || [];
    const hasRelated = related.some((r) => profileSkillsLower.some((ps) => ps.includes(r)));
    if (hasRelated) {
      tips.push(`Mention ${skill} awareness or exposure — your existing skills suggest transferable knowledge.`);
    }
  });

  // 4. Job-specific keyword suggestions from description
  const importantKeywords = ["rest api", "jwt", "authentication", "microservices", "agile", "scrum", "ci/cd", "testing", "optimization", "performance", "scalable", "distributed"];
  importantKeywords.forEach((kw) => {
    if (jobDescLower.includes(kw)) {
      const profileText = `${(profile.skills || []).join(" ")} ${(profile.projects || []).join(" ")} ${profile.experience || ""}`.toLowerCase();
      if (profileText.includes(kw.split(" ")[0])) {
        tips.push(`Mention "${kw}" explicitly — the job description emphasises this and your profile shows relevant experience.`);
      }
    }
  });

  // 5. Experience section advice
  if ((profile.experience || "").length < 100) {
    tips.push(`Expand your Experience section with specific achievements, metrics, and technologies used.`);
  }

  // Deduplicate and limit
  const unique = [...new Set(tips)];
  return unique.slice(0, 8);
}

// ─── 4. generateInterviewTopics ──────────────────────────────────────────────

/**
 * Returns technical topics likely required for this role with difficulty levels.
 * @returns {Array<{ topic, difficulty }>}
 */
function generateInterviewTopics(job, profile) {
  const allSkills = [...(job.matched_skills || []), ...(job.missing_skills || [])];
  const jobDescLower = (job.description || "").toLowerCase();
  const profileSkillsLower = (profile.skills || []).map((s) => s.toLowerCase());

  const TOPIC_DB = {
    react: [
      { topic: "React Hooks (useState, useEffect, useRef)", difficulty: "Medium" },
      { topic: "Component Lifecycle & Re-rendering", difficulty: "Medium" },
      { topic: "State Management Patterns", difficulty: "Hard" },
    ],
    "node.js": [
      { topic: "Event Loop & Async Patterns", difficulty: "Hard" },
      { topic: "Express Middleware Chain", difficulty: "Medium" },
      { topic: "Stream Processing", difficulty: "Hard" },
    ],
    javascript: [
      { topic: "Closures & Scope Chain", difficulty: "Medium" },
      { topic: "Promises & async/await", difficulty: "Easy" },
      { topic: "Prototypal Inheritance", difficulty: "Hard" },
    ],
    typescript: [
      { topic: "Generics & Utility Types", difficulty: "Hard" },
      { topic: "Type Guards & Narrowing", difficulty: "Medium" },
    ],
    mongodb: [
      { topic: "MongoDB Indexing & Aggregation", difficulty: "Medium" },
      { topic: "Schema Design & Embedding vs Referencing", difficulty: "Medium" },
    ],
    sql: [
      { topic: "SQL Joins & Subqueries", difficulty: "Easy" },
      { topic: "Query Optimization & Indexing", difficulty: "Hard" },
    ],
    docker: [
      { topic: "Container Orchestration Basics", difficulty: "Medium" },
      { topic: "Dockerfile Multi-stage Builds", difficulty: "Medium" },
    ],
    aws: [
      { topic: "AWS EC2, S3, and IAM fundamentals", difficulty: "Medium" },
      { topic: "Serverless with Lambda", difficulty: "Hard" },
    ],
    python: [
      { topic: "Python Decorators & Generators", difficulty: "Medium" },
      { topic: "GIL and Concurrency", difficulty: "Hard" },
    ],
    java: [
      { topic: "JVM Memory Model", difficulty: "Hard" },
      { topic: "Spring Boot Dependency Injection", difficulty: "Medium" },
    ],
    android: [
      { topic: "Activity Lifecycle", difficulty: "Easy" },
      { topic: "Jetpack Compose State", difficulty: "Medium" },
    ],
    kotlin: [
      { topic: "Coroutines & Flow", difficulty: "Medium" },
      { topic: "Sealed Classes & Data Classes", difficulty: "Easy" },
    ],
    html: [
      { topic: "Semantic HTML & Accessibility", difficulty: "Easy" },
    ],
    css: [
      { topic: "Flexbox & Grid Layout", difficulty: "Easy" },
      { topic: "CSS Specificity & Cascade", difficulty: "Medium" },
    ],
    git: [
      { topic: "Git Rebase vs Merge", difficulty: "Easy" },
    ],
  };

  // Collect topics from skill-based DB
  const topics = [];
  const seen = new Set();
  allSkills.forEach((skill) => {
    const key = skill.toLowerCase().trim();
    const entries = TOPIC_DB[key];
    if (entries) {
      entries.forEach((e) => {
        if (!seen.has(e.topic)) {
          seen.add(e.topic);
          topics.push(e);
        }
      });
    }
  });

  // Add general topics from description keywords
  const descTopics = [
    { kw: "rest", topic: "REST API Design & HTTP Methods", difficulty: "Easy" },
    { kw: "jwt", topic: "JWT Authentication & Token Refresh", difficulty: "Medium" },
    { kw: "authentication", topic: "OAuth 2.0 & Session Management", difficulty: "Medium" },
    { kw: "microservice", topic: "Microservices Communication Patterns", difficulty: "Hard" },
    { kw: "testing", topic: "Unit Testing & Integration Testing", difficulty: "Medium" },
    { kw: "ci/cd", topic: "CI/CD Pipeline Design", difficulty: "Medium" },
    { kw: "scalab", topic: "System Scalability & Load Balancing", difficulty: "Hard" },
    { kw: "algorithm", topic: "Data Structures & Algorithms", difficulty: "Hard" },
  ];
  descTopics.forEach(({ kw, topic, difficulty }) => {
    if (jobDescLower.includes(kw) && !seen.has(topic)) {
      seen.add(topic);
      topics.push({ topic, difficulty });
    }
  });

  // If still too few, add System Design for senior-looking roles
  if (topics.length < 3 && (jobDescLower.includes("senior") || jobDescLower.includes("architect") || jobDescLower.includes("lead"))) {
    if (!seen.has("System Design")) {
      topics.push({ topic: "System Design & Architecture", difficulty: "Hard" });
    }
  }

  // Sort: matched skill topics first, then by difficulty
  const diffOrder = { Easy: 0, Medium: 1, Hard: 2 };
  topics.sort((a, b) => (diffOrder[a.difficulty] || 1) - (diffOrder[b.difficulty] || 1));

  return topics.slice(0, 10);
}

// ─── 5. calculatePriority ────────────────────────────────────────────────────

/**
 * Multi-dimensional priority scoring.
 * NOT just AI score — weighted across 6 dimensions.
 *
 * @returns {{ priorityScore, priority }}
 */
function calculatePriority(job, profile, preferences) {
  const matchedSkills = job.matched_skills || [];
  const missingSkills = job.missing_skills || [];
  const totalSkills = matchedSkills.length + missingSkills.length;

  // --- 1. AI Match (35%) ---
  const aiMatchScore = job.ai_score || 0;

  // --- 2. Resume Match (25%) ---
  const resumeMatchScore = totalSkills > 0
    ? (matchedSkills.length / totalSkills) * 100
    : 0;

  // --- 3. Preference Match (15%) ---
  const targetRoles = (preferences.target_roles || []).map((r) => r.toLowerCase());
  const titleLower = (job.title || "").toLowerCase();
  let preferenceScore = 0;
  if (targetRoles.length === 0) {
    preferenceScore = 50; // Neutral — no preferences set
  } else if (targetRoles.some((r) => titleLower.includes(r) || r.includes(titleLower))) {
    preferenceScore = 100;
  } else {
    // Partial word overlap
    const titleWords = titleLower.split(/\s+/);
    const hasPartial = targetRoles.some((r) => {
      const rWords = r.split(/\s+/);
      return rWords.some((w) => titleWords.includes(w) && w.length > 2);
    });
    preferenceScore = hasPartial ? 60 : 10;
  }

  // --- 4. Location Match (10%) ---
  const jobLoc = (job.location || "").toLowerCase();
  const prefLocs = (preferences.preferred_locations || []).map((l) => l.toLowerCase());
  const remoteAllowed = preferences.remote_allowed !== false;
  let locationScore = 0;
  if (jobLoc.includes("remote") && remoteAllowed) {
    locationScore = 100;
  } else if (prefLocs.some((l) => jobLoc.includes(l) || l.includes(jobLoc))) {
    locationScore = 100;
  } else if (remoteAllowed && !jobLoc) {
    locationScore = 50;
  } else {
    locationScore = 10;
  }

  // --- 5. Job Freshness (10%) ---
  let freshnessScore = 50;
  if (job.created_at) {
    const ageMs = Date.now() - new Date(job.created_at).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays <= 1) freshnessScore = 100;
    else if (ageDays <= 3) freshnessScore = 80;
    else if (ageDays <= 7) freshnessScore = 60;
    else if (ageDays <= 14) freshnessScore = 30;
    else freshnessScore = 10;
  }

  // --- 6. Company Quality (5%) ---
  // Heuristic: real source jobs, known platforms, having apply links all signal quality
  let companyQualityScore = 50;
  if (job.source_type === "real") companyQualityScore += 20;
  if (job.apply_link && job.apply_link.startsWith("https://")) companyQualityScore += 15;
  if (job.company_website) companyQualityScore += 15;
  companyQualityScore = Math.min(100, companyQualityScore);

  // --- Weighted composite ---
  const priorityScore = clamp(
    aiMatchScore * 0.35 +
    resumeMatchScore * 0.25 +
    preferenceScore * 0.15 +
    locationScore * 0.10 +
    freshnessScore * 0.10 +
    companyQualityScore * 0.05
  );

  // Priority tier
  let priority;
  if (priorityScore >= 85) priority = "Apply Today";
  else if (priorityScore >= 70) priority = "High Priority";
  else if (priorityScore >= 50) priority = "Medium Priority";
  else priority = "Low Priority";

  return {
    priorityScore,
    priority,
    breakdown: {
      aiMatch: clamp(aiMatchScore),
      resumeMatch: clamp(resumeMatchScore),
      preferenceMatch: clamp(preferenceScore),
      locationMatch: clamp(locationScore),
      freshness: clamp(freshnessScore),
      companyQuality: clamp(companyQualityScore),
    },
  };
}

// ─── 6. generateAdvisor (Master) ─────────────────────────────────────────────

/**
 * Master function. Fetches all data, runs all 5 analysis functions, returns combined advice.
 * @param {string} jobId
 * @returns {Promise<Object>}
 */
async function generateAdvisor(jobId) {
  // Load all data in parallel
  const [rawJob, profile, preferences] = await Promise.all([
    loadJob(jobId),
    loadProfile(),
    loadPreferences(),
  ]);

  if (!rawJob) {
    throw new Error(`Job not found: ${jobId}`);
  }

  // Enrich the job to get matched_skills / missing_skills if not already present
  const profileSkills = profile.skills || [];
  const enriched = enrichJobs([rawJob], profileSkills);
  const job = {
    ...rawJob,
    matched_skills: rawJob.matched_skills || enriched[0]?.skills?.matched || [],
    missing_skills: rawJob.missing_skills || enriched[0]?.skills?.missing || [],
  };

  // Run all analysis functions
  const priorityResult = calculatePriority(job, profile, preferences);
  const applyReason = generateApplyReason(job, profile, preferences);
  const missingSkills = generateMissingSkills(job, profile);
  const resumeTips = generateResumeTips(job, profile);
  const interviewTopics = generateInterviewTopics(job, profile);

  // Estimated improvement: current vs potential after learning top missing skill
  const currentScore = job.ai_score || 0;
  const topMissing = missingSkills[0];
  const potentialGain = topMissing
    ? parseInt(topMissing.estimatedMatchIncrease.replace(/[^0-9]/g, ""), 10)
    : 0;
  const potentialScore = Math.min(100, currentScore + potentialGain);

  const estimatedImprovement = {
    currentMatch: currentScore,
    afterTopSkill: potentialScore,
    topSkillToLearn: topMissing?.skill || null,
    gain: potentialGain,
  };

  console.log(
    `[Advisor] Job "${job.title}" at ${job.company}: Priority=${priorityResult.priority} (${priorityResult.priorityScore}), ` +
    `Matched=${(job.matched_skills || []).length}, Missing=${(job.missing_skills || []).length}, ` +
    `Tips=${resumeTips.length}, Topics=${interviewTopics.length}`
  );

  return {
    priority: priorityResult.priority,
    priorityScore: priorityResult.priorityScore,
    priorityBreakdown: priorityResult.breakdown,
    applyReason,
    missingSkills,
    resumeTips,
    interviewTopics,
    estimatedImprovement,
  };
}

module.exports = {
  generateAdvisor,
  generateApplyReason,
  generateMissingSkills,
  generateResumeTips,
  generateInterviewTopics,
  calculatePriority,
};
