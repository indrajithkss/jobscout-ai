/**
 * Remotive Provider
 * Free API — no API key required
 * Endpoint: https://remotive.com/api/remote-jobs
 * Coverage: Remote tech jobs worldwide
 */

const REMOTIVE_BASE = "https://remotive.com/api/remote-jobs";

export async function fetchRemotiveJobs(searchQuery, limit = 15) {
  const res = await fetch(`${REMOTIVE_BASE}?search=${encodeURIComponent(searchQuery)}&limit=${limit}`);
  if (!res.ok) throw new Error(`Remotive API error: ${res.status}`);
  const data = await res.json();
  return (data.jobs || []).map(j => ({
    id: j.id,
    title: j.title,
    company: j.company_name,
    location: j.candidate_required_location || "Remote (Worldwide)",
    source: "Remotive",
    applyUrl: j.url,
    logo: j.company_logo_url || null,
    description: j.description?.replace(/<[^>]+>/g, " ").slice(0, 600) || "",
    tags: j.tags || [],
    postedAt: j.publication_date
  }));
}
