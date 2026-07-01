/**
 * Generates search queries based on candidate profile and preferences.
 * Phase 5.6: India-first queries when preferred_country is "India".
 *
 * @param {Object} profile Candidate profile (skills, projects, experience, etc.)
 * @param {Object} preferences Job preferences (target_roles, preferred_locations, remote_allowed, preferred_country)
 * @returns {String[]} Array of generated query strings
 */
function generateQueries(profile, preferences) {
  const targetRoles = preferences?.target_roles || [];
  const preferredLocations = preferences?.preferred_locations || [];
  const remoteAllowed = preferences?.remote_allowed !== undefined ? preferences.remote_allowed : true;
  const preferredCountry = (preferences?.preferred_country || "India").toLowerCase();

  // ─── India-specific location pool ────────────────────────────────────────────
  const INDIA_LOCATIONS = [
    "Bangalore", "Hyderabad", "Pune", "Chennai", "Mumbai",
    "Delhi", "Noida", "Gurgaon", "Remote India", "India"
  ];

  // ─── 1. Derive roles from Profile ──────────────────────────────────────────
  const derivedRoles = [];
  if (profile && profile.skills) {
    const skillsLower = profile.skills.map(s => s.toLowerCase());

    const hasReact     = skillsLower.some(s => s.includes("react"));
    const hasWeb       = skillsLower.some(s => s.includes("html") || s.includes("css") || s.includes("javascript") || s.includes("frontend"));
    const hasBackend   = skillsLower.some(s => s.includes("node") || s.includes("express") || s.includes("django") || s.includes("backend") || s.includes("sql") || s.includes("api"));
    const hasAndroid   = skillsLower.some(s => s.includes("android") || s.includes("kotlin") || s.includes("mobile"));
    const hasPythonJava = skillsLower.some(s => s.includes("python") || s.includes("java"));
    const hasML        = skillsLower.some(s => s.includes("machine learning") || s.includes("ai") || s.includes("pytorch"));
    const hasCloud     = skillsLower.some(s => s.includes("aws") || s.includes("azure") || s.includes("gcp") || s.includes("cloud"));

    if (hasReact || hasWeb) {
      derivedRoles.push("Full Stack Developer", "Frontend Engineer", "React Developer");
    }
    if (hasBackend) {
      derivedRoles.push("Backend Developer", "Node.js Developer");
    }
    if (hasAndroid) {
      derivedRoles.push("Android Developer", "Mobile Developer");
    }
    if (hasPythonJava && !derivedRoles.includes("Software Engineer")) {
      derivedRoles.push("Software Engineer");
    }
    if (hasML) {
      derivedRoles.push("Machine Learning Engineer", "AI Engineer");
    }
    if (hasCloud) {
      derivedRoles.push("Cloud Engineer");
    }
  }

  // Fallback if no derived roles
  if (derivedRoles.length === 0) {
    derivedRoles.push("Software Engineer");
  }

  // ─── Helper: capitalize role words ──────────────────────────────────────────
  const formatRole = (role) =>
    role.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");

  // ─── 2. Deduplicate all roles (Preferences target_roles take priority over profile derived roles) ───
  const allRolesMap = new Map();
  targetRoles.forEach(role => allRolesMap.set(role.toLowerCase(), formatRole(role)));
  derivedRoles.forEach(role => allRolesMap.set(role.toLowerCase(), formatRole(role)));
  const uniqueRoles = Array.from(allRolesMap.values());

  // ─── 3. Build location list ─────────────────────────────────────────────────
  let locationsToPair = [];

  if (preferredCountry === "india") {
    // Phase 5.6: Use India-specific locations
    if (preferredLocations.length > 0) {
      // Use what the user has specified (presumably Indian cities)
      preferredLocations
        .filter(l => l.toLowerCase() !== "remote" && l.toLowerCase() !== "hybrid")
        .forEach(l => locationsToPair.push(l));
    }

    // Always include a mix of top Indian cities + Remote India
    const baseIndiaLocations = ["Bangalore", "Hyderabad", "Pune", "Remote India", "India"];
    baseIndiaLocations.forEach(loc => {
      if (!locationsToPair.some(l => l.toLowerCase() === loc.toLowerCase())) {
        locationsToPair.push(loc);
      }
    });

    // Add "Remote" only if user wants remote jobs
    if (remoteAllowed && !locationsToPair.some(l => l.toLowerCase().includes("remote"))) {
      locationsToPair.push("Remote");
    }
  } else {
    // Non-India mode: use user's specified locations
    preferredLocations
      .filter(l => l.toLowerCase() !== "remote" && l.toLowerCase() !== "hybrid")
      .forEach(l => locationsToPair.push(l));

    if (remoteAllowed) {
      locationsToPair.push("Remote");
    }

    if (locationsToPair.length === 0) {
      locationsToPair.push("Remote");
    }
  }

  // ─── 4. Generate query combinations ─────────────────────────────────────────
  // Strategy: Role + Location (e.g. "Full Stack Developer Bangalore")
  // Limit to keep API calls manageable
  const queries = [];

  // Priority combos first: top roles × key India locations
  const topRoles = uniqueRoles.slice(0, 5);  // Max 5 roles
  const topLocations = locationsToPair.slice(0, 4); // Max 4 locations

  topRoles.forEach(role => {
    topLocations.forEach(loc => {
      queries.push(`${role} ${loc}`);
    });
  });

  // Add bare-role queries (without location) for remote-first query coverage
  if (preferredCountry === "india" || remoteAllowed) {
    topRoles.slice(0, 3).forEach(role => {
      const bareQuery = role; // e.g. "Full Stack Developer"
      if (!queries.includes(bareQuery)) {
        queries.push(bareQuery);
      }
    });
  }

  // Deduplicate final list
  return Array.from(new Set(queries));
}

module.exports = {
  generateQueries
};
