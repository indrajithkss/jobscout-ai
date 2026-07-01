// backend/services/careerKnowledgeService.js
// Phase 7.5.3 – Career Knowledge Engine
// The centralized intelligence layer of JobScout AI.
// Consolidates all candidate analysis into one reusable profile.

const { supabase } = require("../config/supabase");
const { getLatestProfile } = require("./profileService");
const { getCareerIntelligence } = require("./careerIntelligenceService");
const fs = require("fs");
const path = require("path");

const PREF_FILE = path.join(__dirname, "../utils/preferences.json");

// ─── Constants & Metadata ───────────────────────────────────────────────────

const SKILL_METADATA = {
  docker: { difficulty: "Medium", learningTime: "12h" },
  kubernetes: { difficulty: "Hard", learningTime: "20h" },
  aws: { difficulty: "Hard", learningTime: "24h" },
  azure: { difficulty: "Medium", learningTime: "20h" },
  gcp: { difficulty: "Medium", learningTime: "20h" },
  typescript: { difficulty: "Medium", learningTime: "15h" },
  graphql: { difficulty: "Medium", learningTime: "10h" },
  redis: { difficulty: "Medium", learningTime: "8h" },
  postgresql: { difficulty: "Medium", learningTime: "12h" },
  mongodb: { difficulty: "Medium", learningTime: "10h" },
  python: { difficulty: "Medium", learningTime: "20h" },
  rust: { difficulty: "Hard", learningTime: "30h" },
  go: { difficulty: "Medium", learningTime: "24h" },
  terraform: { difficulty: "Medium", learningTime: "16h" },
  react: { difficulty: "Medium", learningTime: "15h" },
  "next.js": { difficulty: "Medium", learningTime: "12h" },
  vue: { difficulty: "Medium", learningTime: "12h" },
  angular: { difficulty: "Medium", learningTime: "16h" },
  "node.js": { difficulty: "Medium", learningTime: "12h" },
  express: { difficulty: "Medium", learningTime: "8h" },
  django: { difficulty: "Medium", learningTime: "16h" },
  java: { difficulty: "Medium", learningTime: "24h" },
  "c++": { difficulty: "Hard", learningTime: "30h" },
  swift: { difficulty: "Medium", learningTime: "20h" },
  kotlin: { difficulty: "Medium", learningTime: "16h" },
  "ci/cd": { difficulty: "Medium", learningTime: "10h" },
  system_design: { difficulty: "Hard", learningTime: "24h" }
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function categorizeSkill(skillName) {
  const name = skillName.toLowerCase().trim();
  
  const CLOUD = ["aws", "azure", "gcp", "kubernetes", "docker", "terraform", "devops", "ci/cd", "cloud", "jenkins", "ansible"];
  const DATABASE = ["sql", "postgresql", "mongodb", "redis", "mysql", "oracle", "database", "sqlite", "nosql", "dynamodb"];
  const FRAMEWORKS = ["react", "next.js", "express", "django", "fastapi", "spring boot", "vue", "angular", "bootstrap", "tailwind css", "flask", "laravel"];
  const LANGUAGES = ["javascript", "typescript", "python", "java", "c++", "go", "rust", "swift", "kotlin", "html", "css", "c#", "ruby", "php"];
  const SOFT_SKILLS = ["communication", "leadership", "problem solving", "teamwork", "collaboration", "agile", "scrum", "product strategy"];

  if (CLOUD.some(k => name.includes(k))) return "cloud";
  if (DATABASE.some(k => name.includes(k))) return "databases";
  if (FRAMEWORKS.some(k => name.includes(k))) return "frameworks";
  if (LANGUAGES.some(k => name.includes(k))) return "technologies";
  if (SOFT_SKILLS.some(k => name.includes(k))) return "softSkills";
  
  return "technologies"; // Fallback category
}

// ─── Core Implementation ─────────────────────────────────────────────────────

/**
 * 2. getTopStrengths()
 * Evaluates candidates strengths based on: Resume, Projects, Profile Skills, Match History.
 */
function getTopStrengths(profile, jobs) {
  const strengths = [];
  const profileSkills = profile.skills || [];
  const projects = profile.projects || [];
  
  // 1. Skill breadth
  if (profileSkills.length >= 8) {
    strengths.push({
      type: "skills",
      title: "Extensive Technical Skill Set",
      description: `Proficient in ${profileSkills.length} core technologies including ${profileSkills.slice(0, 4).join(", ")}.`
    });
  } else if (profileSkills.length >= 4) {
    strengths.push({
      type: "skills",
      title: "Core Stack Foundations",
      description: `Solid foundations in ${profileSkills.join(", ")}.`
    });
  }

  // 2. High Match Job History
  const highMatches = jobs.filter(j => (j.ai_score || 0) >= 80);
  if (highMatches.length > 0) {
    const matchedJobsTitles = [...new Set(highMatches.map(j => j.title))].slice(0, 2);
    strengths.push({
      type: "market",
      title: "Strong Market Alignment",
      description: `Highly aligned with roles like ${matchedJobsTitles.join(" & ")}, resulting in ${highMatches.length} high-match profiles.`
    });
  }

  // 3. Project Depth
  if (projects.length > 0) {
    strengths.push({
      type: "projects",
      title: "Practical Execution",
      description: `Showcases hands-on expertise with ${projects.length} distinct project entries (${projects.slice(0, 2).join(", ")}).`
    });
  }

  // 4. Experience Length
  const expLen = (profile.experience || "").length;
  if (expLen > 300) {
    strengths.push({
      type: "experience",
      title: "Rich Professional Narrative",
      description: "Possesses detailed work experience records, signaling strong career longevity and depth."
    });
  }

  // Fallback if empty
  if (strengths.length === 0) {
    strengths.push({
      type: "general",
      title: "Ready to Discover",
      description: "Profile created and ready to align with matching roles in India and globally."
    });
  }

  return strengths;
}

/**
 * 3. getWeakAreas()
 * Returns skills limiting the candidate's match score across current jobs.
 */
function getWeakAreas(profile, jobs) {
  const missingFreq = {};
  
  // Look at all jobs and sum up missing skills
  jobs.forEach(job => {
    (job.missing_skills || []).forEach(s => {
      const key = s.toLowerCase().trim();
      if (!key) return;
      if (!missingFreq[key]) {
        missingFreq[key] = { skill: s, count: 0, totalImpactScore: 0 };
      }
      missingFreq[key].count += 1;
      // High score jobs weight more in impact assessment
      const weight = (job.ai_score || 50) / 100;
      missingFreq[key].totalImpactScore += weight;
    });
  });

  const totalJobs = jobs.length || 1;

  return Object.values(missingFreq)
    .map(entry => {
      const appearanceRate = entry.count / totalJobs;
      let impact = "Low";
      if (appearanceRate >= 0.5) impact = "Critical";
      else if (appearanceRate >= 0.25) impact = "High";
      else if (appearanceRate >= 0.1) impact = "Medium";

      return {
        skill: entry.skill,
        demandCount: entry.count,
        impact,
        impactScore: Math.round((entry.totalImpactScore / totalJobs) * 100)
      };
    })
    .sort((a, b) => b.demandCount - a.demandCount)
    .slice(0, 10);
}

/**
 * 4. getMarketDemand()
 * Analyzes current jobs and returns top categories.
 */
function getMarketDemand(jobs) {
  const frequencies = {
    technologies: {},
    frameworks: {},
    databases: {},
    cloud: {},
    softSkills: {}
  };

  jobs.forEach(job => {
    const allSkills = [
      ...(job.matched_skills || []),
      ...(job.missing_skills || [])
    ];

    allSkills.forEach(skill => {
      const key = skill.toLowerCase().trim();
      if (!key) return;
      const cat = categorizeSkill(skill);
      
      if (!frequencies[cat][key]) {
        frequencies[cat][key] = { name: skill, count: 0 };
      }
      frequencies[cat][key].count += 1;
    });
  });

  const formatList = (freqObj) => {
    return Object.values(freqObj)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map(entry => ({ name: entry.name, count: entry.count }));
  };

  return {
    technologies: formatList(frequencies.technologies),
    frameworks: formatList(frequencies.frameworks),
    databases: formatList(frequencies.databases),
    cloud: formatList(frequencies.cloud),
    softSkills: formatList(frequencies.softSkills)
  };
}

/**
 * 5. generateLearningPlan()
 * Creates a structured weekly roadmap based on candidate's weak areas.
 */
function generateLearningPlan(profile, jobs) {
  const weakAreas = getWeakAreas(profile, jobs);
  const plan = [];
  
  const totalJobs = jobs.length || 1;
  const top4Weak = weakAreas.slice(0, 4);

  top4Weak.forEach((w, idx) => {
    const key = w.skill.toLowerCase().trim();
    const meta = SKILL_METADATA[key] || { difficulty: "Medium", learningTime: "15h" };
    
    // Estimate matching increase based on demand rate
    const rawIncrease = Math.round((w.demandCount / totalJobs) * 20);
    const expectedIncrease = `+${Math.max(3, rawIncrease)}%`;

    plan.push({
      week: `Week ${idx + 1}`,
      skill: w.skill,
      difficulty: meta.difficulty,
      learningTime: meta.learningTime,
      expectedMatchIncrease: expectedIncrease
    });
  });

  return plan;
}

/**
 * 6. generateCareerSummary()
 * Generates consolidated snapshot stats and recommendations.
 */
function generateCareerSummary(profile, jobs, intelligence, strengths, weaknesses, learningPlan) {
  const profileSkills = profile.skills || [];
  const readiness = intelligence.careerReadiness || 0;
  
  let summary = `Your career readiness is rated as ${readiness}%. `;
  if (profileSkills.length > 0) {
    summary += `With strong foundational skills in ${profileSkills.slice(0, 3).join(", ")}, you match well with active roles in the market. `;
  }
  if (weaknesses.length > 0) {
    summary += `Focusing on learning ${weaknesses.slice(0, 2).map(w => w.skill).join(" & ")} represents your highest-impact opportunity.`;
  }

  const recommendations = [];
  if (weaknesses.length > 0) {
    recommendations.push(`Skill Up: Add ${weaknesses[0].skill} to your stack to unlock approximately ${weaknesses[0].demandCount} job matches.`);
  }
  if ((profile.projects || []).length < 2) {
    recommendations.push("Portfolio Growth: Document more personal projects under the projects profile category.");
  }
  const appliedJobsCount = jobs.filter(j => ["applied", "interview", "offer"].includes(j.status)).length;
  if (appliedJobsCount === 0 && jobs.length > 0) {
    recommendations.push("Pipeline Launch: Start applying to your 'Apply Today' priority matches to build application momentum.");
  } else {
    recommendations.push("Stay Consistent: Continue tracking application milestones in the Application Tracker.");
  }

  return {
    summary,
    readiness,
    recommendations,
    strengths: strengths.map(s => s.title),
    weaknesses: weaknesses.slice(0, 4).map(w => w.skill),
    learningPlan
  };
}

/**
 * 1. buildCandidateKnowledge()
 * Collects and normalizes all available career data points.
 */
async function buildCandidateKnowledge() {
  // Load raw data sources
  const [profile, preferences, jobsRes] = await Promise.all([
    loadProfile(),
    loadPreferences(),
    supabase.from("jobs").select("*")
  ]);

  const jobs = jobsRes.data || [];
  
  // Load intelligence stats
  const intelligence = await getCareerIntelligence();

  // Run analytical calculations
  const strengths = getTopStrengths(profile, jobs);
  const weakSkills = getWeakAreas(profile, jobs);
  const marketDemand = getMarketDemand(jobs);
  const roadmap = generateLearningPlan(profile, jobs);
  const careerSummary = generateCareerSummary(profile, jobs, intelligence, strengths, weakSkills, roadmap);

  // Normalize details
  const preferredRoles = preferences.target_roles || [];
  const preferredLocations = preferences.preferred_locations || [];
  const topProjects = (profile.projects || []).slice(0, 5);
  const experienceSummary = profile.experience || "No professional experience summaries recorded.";

  // Compute application rates
  const stats = {
    totalJobsFound: jobs.length,
    savedJobsCount: jobs.filter(j => j.status === "saved").length,
    appliedJobsCount: jobs.filter(j => j.status === "applied").length,
    interviewJobsCount: jobs.filter(j => j.status === "interview").length,
    offersCount: jobs.filter(j => j.status === "offer").length,
  };

  return {
    candidate: {
      name: profile.name || "Candidate",
      email: profile.email || "",
      education: profile.education || "",
      experienceLength: experienceSummary.length
    },
    strengths,
    weakSkills,
    preferredRoles,
    preferredLocations,
    topProjects,
    experienceSummary,
    careerReadiness: intelligence.careerReadiness || 0,
    weeklyGoal: intelligence.weeklyGoal || {},
    roadmap,
    marketDemand,
    applicationStats: stats,
    careerSummary
  };
}

// ─── DB Access Helpers ───────────────────────────────────────────────────────

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

  if (data && data.length > 0) return data[0];

  return { target_roles: [], preferred_locations: [], remote_allowed: true, preferred_country: "India" };
}

module.exports = {
  buildCandidateKnowledge,
  getTopStrengths,
  getWeakAreas,
  getMarketDemand,
  generateLearningPlan,
  generateCareerSummary
};
