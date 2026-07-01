// backend/services/dailySummaryService.js
// Phase 7.0 – AI Daily Career Brief
// Modular summary engine — reusable for email, WhatsApp, push, and weekly reports.

const { supabase } = require("../config/supabase");
const { getLatestProfile } = require("./profileService");
const { enrichJobs } = require("./jobScoutService");

/**
 * Builds an AI recommendation string from skill gaps across top jobs.
 * Pure logic — no Gemini API call — fast and free.
 *
 * @param {Array} topJobs  Enriched job objects with skills.missing array
 * @param {number} totalJobs  Total job count for context
 * @returns {string}
 */
function buildRecommendation(topJobs, totalJobs) {
  if (!topJobs || topJobs.length === 0) {
    return "Run a scout scan to get your personalized AI career recommendation.";
  }

  // Tally missing skill frequencies across top jobs
  const missingFreq = {};
  topJobs.forEach((job) => {
    (job.skills?.missing || []).forEach((skill) => {
      const key = skill.toLowerCase();
      missingFreq[key] = (missingFreq[key] || { label: skill, count: 0 });
      missingFreq[key].count += 1;
    });
  });

  const sorted = Object.values(missingFreq).sort((a, b) => b.count - a.count);

  if (sorted.length === 0) {
    return `Excellent profile alignment today! You match ${totalJobs} job${totalJobs !== 1 ? "s" : ""} with your current skill set. Focus on applying to your top matches immediately.`;
  }

  const topMissing = sorted.slice(0, 3).map((s) => s.label);
  const topSkillStr = topMissing.join(", ");
  const freq = sorted[0]?.count || 1;

  const lines = [
    `Focus on **${topSkillStr}** — appearing in ${freq} of your top matches today.`,
  ];

  if (sorted[0]?.count >= 3) {
    lines.push(
      `Consider a short online certification or project to close this gap and unlock more high-match opportunities.`
    );
  } else if (sorted.length >= 2) {
    lines.push(
      `Adding these to your resume will immediately increase your match score across multiple roles.`
    );
  } else {
    lines.push(
      `A single targeted project demonstrating ${topMissing[0]} could significantly improve your candidacy.`
    );
  }

  return lines.join(" ");
}

/**
 * Aggregates top requested skills across a set of enriched jobs.
 * Returns top N skills sorted by how many jobs request them.
 *
 * @param {Array} jobs  Raw DB job rows (must have matched_skills + missing_skills columns)
 * @param {number} limit  Number of top skills to return (default 8)
 * @returns {Array<{ skill: string, count: number }>}
 */
function aggregateTopSkills(jobs, limit = 8) {
  const freq = {};

  jobs.forEach((job) => {
    const allSkills = [
      ...(job.matched_skills || []),
      ...(job.missing_skills || []),
    ];
    allSkills.forEach((skill) => {
      const key = skill.toLowerCase().trim();
      if (!key) return;
      if (!freq[key]) freq[key] = { skill, count: 0 };
      freq[key].count += 1;
    });
  });

  return Object.values(freq)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ skill, count }) => ({ skill, count }));
}

/**
 * Generates the full daily career brief summary.
 * Designed for reuse across:
 *   - Dashboard card (Phase 7.0)
 *   - Email digests (Phase 8.0)
 *   - WhatsApp notifications (future)
 *   - Mobile push (future)
 *   - Weekly reports (future)
 *
 * @returns {Promise<Object>} Summary object
 */
async function generateDailySummary() {
  // 1. Fetch all current "new" jobs (today's scout batch)
  //    Scout always purges old "new" jobs before inserting fresh ones,
  //    so status="new" reliably represents the latest scout run.
  const { data: rawJobs, error: jobsError } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "new")
    .order("ai_score", { ascending: false });

  if (jobsError) {
    throw new Error(`[DailySummary] Failed to fetch jobs: ${jobsError.message}`);
  }

  const jobs = rawJobs || [];

  // 2. Load candidate profile for enrichment
  let profileSkills = [];
  try {
    const profile = await getLatestProfile();
    profileSkills = profile?.skills || [];
  } catch (err) {
    console.warn("[DailySummary] Could not load profile skills:", err.message);
  }

  // 3. Enrich jobs (adds skills.matched, skills.missing, recommendation text per job)
  const enriched = enrichJobs(jobs, profileSkills);

  // 4. Compute pipeline counts
  const jobsFound = enriched.length;
  const highMatches = enriched.filter((j) => (j.matchScore || 0) >= 80).length;
  const resumeMatches = jobs.filter((j) => j.discovery_type === "resume").length;
  const preferenceMatches = jobs.filter(
    (j) => j.discovery_type === "preference"
  ).length;
  const bothMatches = jobs.filter((j) => j.discovery_type === "both").length;

  // 5. Top 5 jobs (already sorted descending by ai_score from the DB query)
  const topJobs = enriched.slice(0, 5).map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    matchScore: job.matchScore,
    source: job.source,
    applyUrl: job.applyUrl,
    company_logo: job.company_logo || null,
    skills: {
      matched: job.skills?.matched || [],
      missing: job.skills?.missing || [],
    },
  }));

  // 6. Top requested skills across all today's jobs
  const topSkills = aggregateTopSkills(jobs);

  // 7. AI recommendation based on missing skills pattern
  const recommendation = buildRecommendation(enriched.slice(0, 8), jobsFound);

  const summary = {
    jobsFound,
    highMatches,
    resumeMatches,
    preferenceMatches,
    bothMatches,
    topJobs,
    topSkills,
    recommendation,
    generatedAt: new Date().toISOString(),
  };

  console.log(
    `[DailySummary] Summary generated: ${jobsFound} jobs, ${highMatches} high matches, ${topSkills.length} top skills.`
  );

  return summary;
}

module.exports = {
  generateDailySummary,
  buildRecommendation,
  aggregateTopSkills,
};
