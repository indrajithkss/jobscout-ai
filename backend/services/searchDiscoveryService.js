const axios = require("axios");

// ─── Source Classifier ────────────────────────────────────────────────────────

function classifySource(urlOrPublisher, fallback = "Company Careers") {
  if (!urlOrPublisher) return fallback;
  const str = urlOrPublisher.toLowerCase();

  if (str.includes("linkedin.com"))  return "LinkedIn";
  if (str.includes("naukri.com"))    return "Naukri";
  if (str.includes("foundit.in") || str.includes("monster.in")) return "Foundit";
  if (str.includes("glassdoor.com")) return "Glassdoor";
  if (str.includes("indeed.com"))    return "Indeed";
  if (str.includes("instahyre.com")) return "Instahyre";
  if (str.includes("cutshort.io"))   return "Cutshort";
  if (str.includes("remotive.com") || str.includes("remotive")) return "Remotive";
  if (str.includes("arbeitnow.com")) return "Arbeitnow";
  if (str.includes("themuse.com"))   return "The Muse";
  if (str.includes("wellfound.com") || str.includes("angel.co")) return "Wellfound";
  if (str.includes("ycombinator"))   return "Y Combinator";

  return fallback;
}

// Strip HTML tags
function stripHtml(str) {
  return (str || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 800);
}

// ─── Common Skills Extractor ──────────────────────────────────────────────────
const COMMON_SKILLS = [
  "react", "node", "javascript", "typescript", "python", "java", "kotlin", "android",
  "swift", "ios", "aws", "gcp", "azure", "docker", "kubernetes", "sql", "nosql",
  "mongodb", "postgresql", "mysql", "graphql", "tailwind", "next.js", "nest.js",
  "vue", "angular", "django", "flask", "springboot", "c++", "c#", "ruby", "rails",
  "git", "html", "css", "figma", "testing", "ci/cd", "microservices", "redux",
  "firebase", "supabase", "terraform", "linux", "bash", "golang", "rust", "scala"
];

const SKILL_LABELS = {
  "javascript": "JavaScript", "typescript": "TypeScript", "next.js": "Next.js",
  "nest.js": "Nest.js", "ci/cd": "CI/CD", "react": "React", "node": "Node.js",
  "aws": "AWS", "gcp": "GCP", "sql": "SQL", "nosql": "NoSQL", "mongodb": "MongoDB",
  "postgresql": "PostgreSQL", "mysql": "MySQL", "graphql": "GraphQL",
  "html": "HTML", "css": "CSS", "c++": "C++", "c#": "C#"
};

function extractSkillsFromText(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  return COMMON_SKILLS.filter(skill => {
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(lower);
  }).map(s => SKILL_LABELS[s] || (s.charAt(0).toUpperCase() + s.slice(1)));
}

// ─── Location helpers ─────────────────────────────────────────────────────────
const LOCATION_WORDS = new Set([
  "bangalore", "bengaluru", "hyderabad", "pune", "chennai", "mumbai", "delhi",
  "noida", "gurgaon", "gurugram", "kolkata", "india", "remote", "worldwide",
  "global", "international", "remote india", "work from home", "wfh"
]);

function extractRoleKeywords(query) {
  return query
    .split(/\s+/)
    .filter(w => w.length > 1 && !LOCATION_WORDS.has(w.toLowerCase()))
    .join(" ")
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider 1: Remotive (100% free, no API key, remote tech jobs worldwide)
// https://remotive.com/api
// ─────────────────────────────────────────────────────────────────────────────
async function searchRemotive(query) {
  const role = extractRoleKeywords(query);
  if (!role) return [];

  try {
    const res = await axios.get("https://remotive.com/api/remote-jobs", {
      params: { search: role, limit: 15 },
      timeout: 10000,
      headers: { Accept: "application/json" }
    });

    const jobs = res.data?.jobs || [];
    return jobs.map(j => {
      const description = stripHtml(j.description || "");
      const source = "Remotive";
      return {
        title: j.title,
        company: j.company_name || "Unknown",
        location: j.candidate_required_location || "Remote (Worldwide)",
        source,
        source_type: "real",
        provider: "remotive",
        apply_link: j.url,
        company_website: j.company_logo ? null : null,
        company_logo: j.company_logo_url || null,
        description,
        required_skills: extractSkillsFromText(description + " " + j.title + " " + (j.tags || []).join(" ")),
        remote_allowed: true
      };
    });
  } catch (err) {
    console.error(`[Remotive] Error for "${role}":`, err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider 2: Arbeitnow (free, no key, international tech jobs, JSON feed)
// https://arbeitnow.com/api/job-board-api
// ─────────────────────────────────────────────────────────────────────────────
async function searchArbeitnow(query) {
  const role = extractRoleKeywords(query);
  if (!role) return [];

  try {
    const res = await axios.get("https://arbeitnow.com/api/job-board-api", {
      params: { page: 1 },
      timeout: 10000,
      headers: { Accept: "application/json" }
    });

    const allJobs = res.data?.data || [];
    const roleLower = role.toLowerCase();

    // Filter jobs matching the role keyword client-side
    const matchingJobs = allJobs.filter(j => {
      const title = (j.title || "").toLowerCase();
      const tags  = (j.tags || []).join(" ").toLowerCase();
      return roleLower.split(" ").some(word =>
        word.length > 2 && (title.includes(word) || tags.includes(word))
      );
    }).slice(0, 10);

    return matchingJobs.map(j => {
      const description = stripHtml(j.description || "");
      const source = classifySource(j.url, "Arbeitnow");
      return {
        title: j.title,
        company: j.company_name || "Unknown",
        location: j.location || (j.remote ? "Remote (Worldwide)" : "Berlin, Germany"),
        source,
        source_type: "real",
        provider: "arbeitnow",
        apply_link: j.url,
        company_website: null,
        company_logo: null,
        description,
        required_skills: extractSkillsFromText(description + " " + j.title + " " + (j.tags || []).join(" ")),
        remote_allowed: j.remote || false
      };
    });
  } catch (err) {
    console.error(`[Arbeitnow] Error for "${role}":`, err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider 3: The Muse API (free, no API key for basic, US + global)
// https://www.themuse.com/developers/api/v2
// ─────────────────────────────────────────────────────────────────────────────
async function searchTheMuse(query) {
  const role = extractRoleKeywords(query);
  if (!role) return [];

  try {
    const res = await axios.get("https://www.themuse.com/api/public/jobs", {
      params: { category: "Engineering", page: 0, descending: true },
      timeout: 10000,
      headers: { Accept: "application/json" }
    });

    const allJobs = res.data?.results || [];
    const roleLower = role.toLowerCase();

    const matchingJobs = allJobs.filter(j => {
      const name = (j.name || "").toLowerCase();
      return roleLower.split(" ").some(word => word.length > 2 && name.includes(word));
    }).slice(0, 8);

    return matchingJobs.map(j => {
      const description = stripHtml(j.contents || "");
      const locationStr = j.locations?.map(l => l.name).join(", ") || "Remote";
      const source = classifySource(j.refs?.landing_page, "The Muse");
      return {
        title: j.name,
        company: j.company?.name || "Unknown",
        location: locationStr,
        source,
        source_type: "real",
        provider: "themuse",
        apply_link: j.refs?.landing_page || `https://www.themuse.com/jobs`,
        company_website: null,
        company_logo: null,
        description,
        required_skills: extractSkillsFromText(description + " " + j.name),
        remote_allowed: locationStr.toLowerCase().includes("remote") || locationStr.toLowerCase().includes("flexible")
      };
    });
  } catch (err) {
    console.error(`[The Muse] Error for "${role}":`, err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Active search providers — all free, zero API keys required
// ─────────────────────────────────────────────────────────────────────────────
const SEARCH_PROVIDERS = [
  { name: "remotive",  fn: searchRemotive  },
  { name: "arbeitnow", fn: searchArbeitnow },
  { name: "themuse",   fn: searchTheMuse   }
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Discovery Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Discovers real jobs from free, no-key job APIs using generated search queries.
 * Providers: Remotive · Arbeitnow · The Muse (all free, no API keys needed)
 * NOTE: India/location filtering happens AFTER this in jobScoutService.js via filterByCountry().
 *
 * @param {string[]} queries - List of search queries
 * @returns {Promise<{jobs: Object[], realCount: number, generatedCount: number, providerStatuses: Object}>}
 */
async function discoverJobs(queries) {
  if (!queries || queries.length === 0) {
    return { jobs: [], realCount: 0, generatedCount: 0, providerStatuses: {} };
  }

  // De-duplicate and strip location words → role-only queries
  const roleOnlyQueries = [...new Set(
    queries.map(q => extractRoleKeywords(q)).filter(Boolean)
  )].slice(0, 5);

  console.log(`[Discovery] Running ${roleOnlyQueries.length} role queries via free providers:`, roleOnlyQueries);

  const seenKeys = new Set();
  const discovered = [];
  let realCount = 0;
  let generatedCount = 0;

  const providerStatuses = {
    remotive:  "active",
    arbeitnow: "active",
    themuse:   "active"
  };

  // Run all queries × all providers in parallel
  const allSettled = await Promise.allSettled(
    roleOnlyQueries.flatMap(query =>
      SEARCH_PROVIDERS.map(async ({ name, fn }) => {
        try {
          const jobs = await fn(query);
          if (jobs.length > 0) {
            providerStatuses[name] = "success";
          } else if (providerStatuses[name] === "active") {
            providerStatuses[name] = "no results";
          }
          return jobs;
        } catch (err) {
          providerStatuses[name] = err.message || "error";
          return [];
        }
      })
    )
  );

  for (const result of allSettled) {
    if (result.status !== "fulfilled") continue;
    for (const job of result.value) {
      if (!job.apply_link) continue;
      const key = `${(job.title || "").toLowerCase().trim()}::${(job.company || "").toLowerCase().trim()}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        discovered.push(job);
        if (job.source_type === "real") realCount++;
        else generatedCount++;
      }
    }
  }

  console.log(`[Discovery] Real: ${realCount}, Generated: ${generatedCount}, Total: ${discovered.length}`);
  return { jobs: discovered, realCount, generatedCount, providerStatuses };
}

module.exports = {
  discoverJobs,
  classifySource
};
