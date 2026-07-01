/**
 * India Location Filter — STRICT MODE (Phase 5.6 revised)
 *
 * Strategy: DENY by default.
 * Only accept jobs that EXPLICITLY match India or are truly worldwide-remote.
 *
 * Accept if:
 *   1. Location contains an Indian city or "india"
 *   2. Location is "Remote" / "Worldwide" / "Work from anywhere" / "Global"
 *      AND does NOT restrict to a specific non-India country
 *
 * Reject everything else by default.
 */

// ─── India City Allow-List ────────────────────────────────────────────────────
const INDIA_KEYWORDS = [
  "india",
  "bangalore", "bengaluru",
  "hyderabad",
  "pune",
  "chennai",
  "mumbai",
  "delhi", "new delhi",
  "noida",
  "gurgaon", "gurugram",
  "kolkata",
  "ahmedabad",
  "kochi", "cochin",
  "thiruvananthapuram",
  "jaipur",
  "chandigarh",
  "indore",
  "bhopal",
  "nagpur",
  "coimbatore",
  "surat",
  "vizag", "visakhapatnam",
  "mysore", "mysuru",
  "remote india",
  "india remote",
  "work from india",
  "pan india",
  "in, india",
  "work from home india",
];

// ─── Truly Worldwide / Open Remote Signals ───────────────────────────────────
// Only these phrases mean the job is genuinely open to candidates anywhere
const WORLDWIDE_REMOTE_EXACT = [
  "remote",
  "worldwide",
  "work from anywhere",
  "anywhere",
  "global",
  "wfa",
  "international",
  "remote (worldwide)",
  "remote worldwide",
  "remote - worldwide",
  "remote / worldwide",
];

// ─── Country / Region Restrict Patterns → Always Reject ─────────────────────
// If location CONTAINS any of these, it's country-restricted (not truly worldwide)
const COUNTRY_RESTRICT_PATTERNS = [
  // Explicit restriction labels
  "us only",
  "usa only",
  "uk only",
  "canada only",
  "eu only",
  "remote global",      // Phase 5.6: "Remote Global" means not India-specific
  "remote - global",
  "global remote",
  "global only",
  // Regions that exclude India
  "americas",
  "north america",
  "south america",
  "latin america",
  "latam",
  "europe",
  "european union",
  "emea",               // Europe, Middle East, Africa — excludes India
  "oceania",
  // Countries
  "united states",
  "usa",
  " us",
  "canada",
  "united kingdom",
  " uk",               // e.g. "London, UK" — catch standalone " uk"
  "germany",
  "france",
  "australia",
  "singapore",
  "brazil",
  "mexico",
  "netherlands",
  "sweden",
  "denmark",
  "norway",
  "finland",
  "switzerland",
  "austria",
  "spain",
  "italy",
  "portugal",
  "poland",
  "czech republic",
  "romania",
  "ukraine",
  "israel",
  "japan",
  "south korea",
  "china",
  "hong kong",
  "taiwan",
  "russia",
  "new zealand",
  "argentina",
  "colombia",
  "chile",
  "nigeria",
  "kenya",
  "south africa",
  "egypt",
  "pakistan",
  "sri lanka",
  "bangladesh",
  // Specific non-India cities (common job posting locations)
  "new york", "san francisco", "los angeles", "chicago", "seattle",
  "boston", "austin", "denver", "atlanta", "miami", "dallas",
  "london", "berlin", "munich", "paris", "amsterdam", "madrid",
  "barcelona", "stockholm", "copenhagen", "oslo", "helsinki",
  "zurich", "vienna", "warsaw", "toronto", "vancouver",
  "sydney", "melbourne", "singapore city",
  "tokyo", "seoul", "shanghai", "beijing", "hong kong city",
  "dubai", "abu dhabi",
  "cupertino", "menlo park", "mountain view", "palo alto",
  "redwood city", "santa clara", "san jose",
];

/**
 * Determine if a job location is India-eligible.
 * STRICT: deny by default.
 *
 * @param {string} location - Job location string from API
 * @param {boolean} isRemote - Whether the job is flagged remote by the provider
 * @param {string} preferredCountry - Candidate preferred country
 * @returns {{ accept: boolean, reason: string }}
 */
function checkIndiaEligibility(location, isRemote, preferredCountry = "India") {
  if (!preferredCountry || preferredCountry.toLowerCase() !== "india") {
    return { accept: true, reason: "non-india filter: pass-through" };
  }

  const raw = (location || "").trim();
  const loc = raw.toLowerCase();

  // ── 1. Empty location → assume worldwide-remote → accept ──────────────────
  if (!loc || loc.length < 2) {
    return { accept: true, reason: "Empty location — assumed worldwide remote" };
  }

  // ── 2. Explicit India keyword → accept immediately ─────────────────────────
  for (const kw of INDIA_KEYWORDS) {
    if (loc.includes(kw)) {
      return { accept: true, reason: `India keyword match: "${kw}"` };
    }
  }

  // ── 3. Check for country-restriction patterns → reject ────────────────────
  for (const pattern of COUNTRY_RESTRICT_PATTERNS) {
    if (loc.includes(pattern)) {
      return { accept: false, reason: `Country restriction: "${pattern}" in "${raw}"` };
    }
  }

  // ── 4. Worldwide remote exact phrases (no country restriction found) ────────
  // These are only safe if we've already ruled out country restrictions above
  for (const phrase of WORLDWIDE_REMOTE_EXACT) {
    if (loc === phrase || loc.startsWith(phrase + " ") || loc.startsWith(phrase + ",") || loc.startsWith(phrase + "/") || loc.startsWith(phrase + "-")) {
      return { accept: true, reason: `Worldwide remote match: "${phrase}"` };
    }
  }

  // ── 5. "Asia" or "APAC" without country restriction → accept (India is in Asia) ─
  if (loc.includes("asia") || loc.includes("apac") || loc.includes("south asia")) {
    return { accept: true, reason: `Asia/APAC region: "${raw}"` };
  }

  // ── 6. Default: REJECT ─────────────────────────────────────────────────────
  return { accept: false, reason: `Default deny: unrecognized location "${raw}"` };
}

/**
 * Filter a list of discovered jobs to only include India-eligible jobs.
 *
 * @param {Object[]} jobs - Discovered jobs array
 * @param {string} preferredCountry - e.g. "India"
 * @returns {{ filtered: Object[], totalRejected: number, indiaJobsFound: number, globalJobsFiltered: number }}
 */
function filterByCountry(jobs, preferredCountry = "India") {
  if (!preferredCountry || preferredCountry.toLowerCase() !== "india") {
    return { filtered: jobs, totalRejected: 0, indiaJobsFound: jobs.length, globalJobsFiltered: 0 };
  }

  let rejected = 0;
  const filtered = jobs.filter(job => {
    const { accept, reason } = checkIndiaEligibility(
      job.location,
      job.remote_allowed,
      preferredCountry
    );
    if (!accept) {
      console.log(`[India Filter] ✗ "${job.title}" @ "${job.location}" — ${reason}`);
      rejected++;
    } else {
      console.log(`[India Filter] ✓ "${job.title}" @ "${job.location}" — ${reason}`);
    }
    return accept;
  });

  console.log(`\n[India Filter] Summary: ${filtered.length} accepted, ${rejected} rejected out of ${jobs.length} total\n`);
  return {
    filtered,
    totalRejected: rejected,
    indiaJobsFound: filtered.length,
    globalJobsFiltered: rejected,
  };
}

module.exports = {
  filterByCountry,
  checkIndiaEligibility,
  INDIA_KEYWORDS,
  COUNTRY_RESTRICT_PATTERNS,
};
