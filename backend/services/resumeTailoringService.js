// backend/services/resumeTailoringService.js
// Phase 8.0 – AI Resume Tailoring Engine
// Deterministic, ATS-optimized resume customization. Zero duplicate calculations.

const { supabase } = require("../config/supabase");
const { getLatestProfile } = require("./profileService");
const { generateAdvisor } = require("./advisorService");
const { buildCandidateKnowledge } = require("./careerKnowledgeService");
const fs = require("fs");
const path = require("path");

const PREF_FILE = path.join(__dirname, "../utils/preferences.json");
const clamp = (v) => Math.min(100, Math.max(0, Math.round(v)));

// ─── Helpers ────────────────────────────────────────────────────────────────

async function loadProfile() {
  const profile = await getLatestProfile();
  return profile || { name: "", email: "", skills: [], projects: [], education: "", experience: "" };
}

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
  return data?.[0] || { target_roles: [], preferred_locations: [] };
}

async function loadJob(jobId) {
  const { data } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .limit(1);
  return data?.[0] || null;
}

// ─── 1. generateTailoredSummary ──────────────────────────────────────────────

/**
 * Rewrites ONLY the professional summary.
 * Highlights most relevant technologies already present in the candidate profile.
 * Never invents experience, certifications, or skills.
 *
 * @returns {{ original, tailored, notes }}
 */
function generateTailoredSummary(job, profile) {
  const profileSkills = profile.skills || [];
  const matchedSkills = job.matched_skills || [];
  const companyName = job.company || "target company";
  const jobTitle = job.title || "Software Engineer";

  // Derive original summary from profile experience or standard template
  const original = (profile.experience && profile.experience.length > 80)
    ? profile.experience.split(/[.\n]/).slice(0, 3).join(". ").trim() + "."
    : `Experienced Developer with a focus on building web applications using ${profileSkills.slice(0, 4).join(", ") || "modern stacks"}.`;

  // Build tailored summary strictly highlighting matching profile skills
  const highlightSkills = matchedSkills.slice(0, 4);
  const primarySkillsStr = highlightSkills.length > 0 
    ? highlightSkills.join(", ") 
    : profileSkills.slice(0, 3).join(", ");

  let tailored = `Results-driven software developer specializing in ${primarySkillsStr}. `;
  
  if (profile.projects && profile.projects.length > 0) {
    tailored += `Demonstrated track record of delivering end-to-end applications, including "${profile.projects[0]}" showcasing structured backend and frontend alignment. `;
  }
  
  tailored += `Seeking to contribute high-fidelity development skills and technical problem-solving to the ${jobTitle} role at ${companyName}.`;

  const notes = `Realigned professional summary for the "${jobTitle}" position at ${companyName}. Highlighted core verified proficiencies (${highlightSkills.join(", ") || "primary stacks"}) to immediately capture recruiter attention while maintaining absolute factual integrity.`;

  return { original, tailored, notes };
}

// ─── 2. optimizeSkills ───────────────────────────────────────────────────────

/**
 * Reorders skills matching job requirements first, followed by general skills.
 *
 * @returns {{ original, optimized, hidden, recommended }}
 */
function optimizeSkills(job, profile) {
  const original = profile.skills || [];
  const matched = (job.matched_skills || []).map(s => s.toLowerCase().trim());
  const missing = (job.missing_skills || []).map(s => s.toLowerCase().trim());

  // Split original into matched and other
  const matchedOriginal = [];
  const otherOriginal = [];

  original.forEach(skill => {
    const sLower = skill.toLowerCase().trim();
    if (matched.some(m => sLower === m || sLower.includes(m) || m.includes(sLower))) {
      matchedOriginal.push(skill);
    } else {
      otherOriginal.push(skill);
    }
  });

  // Reordered skills: Matched first, then remaining general skills
  const optimized = [...matchedOriginal, ...otherOriginal];

  // Hidden skills: skills that are too low relevance (e.g. limit list size to keep layout clean if long)
  const hidden = otherOriginal.slice(8);
  const visibleOptimized = optimized.filter(s => !hidden.includes(s));

  // Recommended skills to learn or add (i.e. missing ones)
  const recommended = job.missing_skills || [];

  return {
    original,
    optimized: visibleOptimized,
    hidden,
    recommended
  };
}

// ─── 3. optimizeProjects ─────────────────────────────────────────────────────

/**
 * Re-ranks projects based on keyword relevance to job requirements.
 *
 * @returns {{ recommendedOrder, reason, relevantTechnologies }}
 */
function optimizeProjects(job, profile) {
  const projects = profile.projects || [];
  const jobTitle = (job.title || "").toLowerCase();
  const jobDesc = (job.description || "").toLowerCase();

  const scored = projects.map(proj => {
    const pText = (typeof proj === "string" ? proj : "").toLowerCase();
    let score = 0;

    // Check backend alignment
    const backendKeywords = ["backend", "node", "api", "database", "sql", "server", "docker", "aws", "express", "postgresql"];
    const isBackendJob = backendKeywords.some(kw => jobTitle.includes(kw) || jobDesc.includes(kw));
    const hasBackendProject = backendKeywords.some(kw => pText.includes(kw));
    if (isBackendJob && hasBackendProject) score += 10;

    // Check frontend alignment
    const frontendKeywords = ["frontend", "react", "ui", "ux", "design", "css", "tailwind", "next.js", "javascript"];
    const isFrontendJob = frontendKeywords.some(kw => jobTitle.includes(kw) || jobDesc.includes(kw));
    const hasFrontendProject = frontendKeywords.some(kw => pText.includes(kw));
    if (isFrontendJob && hasFrontendProject) score += 10;

    // Direct word overlap score
    const jobWords = new Set(jobDesc.split(/\s+/).filter(w => w.length > 4));
    pText.split(/\s+/).forEach(word => {
      if (jobWords.has(word)) score += 1;
    });

    return { project: proj, score };
  });

  // Sort descending
  scored.sort((a, b) => b.score - a.score);

  const recommendedOrder = scored.map(s => s.project);
  const matchedSkills = job.matched_skills || [];

  let reason = "Project priority adjusted to position technical portfolio assets first. ";
  if (jobTitle.includes("backend") || jobTitle.includes("full stack")) {
    reason += "Prioritized full-stack architecture and backend service projects.";
  } else if (jobTitle.includes("frontend") || jobTitle.includes("ui")) {
    reason += "Prioritized responsive interface design and client-side framework projects.";
  } else {
    reason += "Ranked projects matching the technical stack description first.";
  }

  return {
    recommendedOrder,
    reason,
    relevantTechnologies: matchedSkills.slice(0, 5)
  };
}

// ─── 4. generateATSKeywords ──────────────────────────────────────────────────

/**
 * Extracts and maps ATS keywords.
 *
 * @returns {{ matched, missing, recommended, coverage }}
 */
function generateATSKeywords(job, profile) {
  const profileText = `${(profile.skills || []).join(" ")} ${(profile.projects || []).join(" ")} ${profile.experience || ""}`.toLowerCase();
  const jobDesc = (job.description || "").toLowerCase();

  // Dictionary of standard ATS keywords
  const ATS_DICT = [
    "react", "node.js", "express", "javascript", "typescript", "mongodb", "postgresql", "sql",
    "docker", "kubernetes", "aws", "gcp", "azure", "terraform", "ci/cd", "git", "rest api", "apis",
    "microservices", "unit testing", "agile", "scrum", "graphql", "tailwind css", "system design"
  ];

  const matched = [];
  const missing = [];

  ATS_DICT.forEach(kw => {
    if (jobDesc.includes(kw)) {
      if (profileText.includes(kw)) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    }
  });

  const totalKeywords = matched.length + missing.length;
  const coverage = totalKeywords > 0 ? Math.round((matched.length / totalKeywords) * 100) : 50;

  // Recommended keywords: missing keywords to try and mention
  const recommended = missing.slice(0, 5);

  return {
    matched,
    missing,
    recommended,
    coverage
  };
}

// ─── 5. calculateATSImprovement ──────────────────────────────────────────────

/**
 * Calculates current vs potential ATS match scores.
 */
function calculateATSImprovement(atsKeywords) {
  const current = atsKeywords.coverage || 50;
  // Learning/mentioning missing keywords increases score
  const expected = Math.min(95, current + Math.round((atsKeywords.missing.length / (atsKeywords.matched.length + atsKeywords.missing.length || 1)) * 30));
  const improvement = expected - current;

  return {
    current,
    expected,
    improvement
  };
}

// ─── 6. generateResumePreview (Master) ────────────────────────────────────────

/**
 * Master execution loop. Consumes Job Advisor and Career Knowledge structures.
 */
async function generateResumePreview(jobId) {
  const [jobRaw, profile, knowledge] = await Promise.all([
    loadJob(jobId),
    loadProfile(),
    buildCandidateKnowledge()
  ]);

  if (!jobRaw) {
    throw new Error(`Job listing not found: ${jobId}`);
  }

  // Load advisor priority calculations
  const advice = await generateAdvisor(jobId);

  // Re-enrich job structure
  const job = {
    ...jobRaw,
    matched_skills: jobRaw.matched_skills || advice.applyReason?.matchedRequirements?.map(r => r.skill) || [],
    missing_skills: jobRaw.missing_skills || advice.missingSkills?.map(s => s.skill) || [],
  };

  const summary = generateTailoredSummary(job, profile);
  const skills = optimizeSkills(job, profile);
  const projects = optimizeProjects(job, profile);
  const keywords = generateATSKeywords(job, profile);
  const ats = calculateATSImprovement(keywords);

  return {
    summary,
    skills,
    projects,
    keywords,
    ats,
    notes: summary.notes
  };
}

module.exports = {
  generateResumePreview,
  generateTailoredSummary,
  optimizeSkills,
  optimizeProjects,
  generateATSKeywords,
  calculateATSImprovement
};
