/**
 * Arbeitnow Provider
 * Free API — no API key required
 * Endpoint: https://arbeitnow.com/api/job-board-api
 * Coverage: Global tech jobs (Europe-centric, remote-friendly)
 */

const ARBEITNOW_BASE = "https://arbeitnow.com/api/job-board-api";

export async function fetchArbeitnowJobs(searchQuery) {
  const res = await fetch(`${ARBEITNOW_BASE}?page=1`);
  if (!res.ok) throw new Error(`Arbeitnow API error: ${res.status}`);
  const data = await res.json();
  const queryLower = searchQuery.toLowerCase();

  return (data.data || [])
    .filter(j => {
      const title = (j.title || "").toLowerCase();
      const tags = (j.tags || []).join(" ").toLowerCase();
      return queryLower.split(" ").some(word => word.length > 2 && (title.includes(word) || tags.includes(word)));
    })
    .slice(0, 10)
    .map(j => ({
      id: j.slug,
      title: j.title,
      company: j.company_name,
      location: j.location || (j.remote ? "Remote (Worldwide)" : "Berlin, Germany"),
      source: "Arbeitnow",
      applyUrl: j.url,
      logo: null,
      description: j.description?.replace(/<[^>]+>/g, " ").slice(0, 600) || "",
      tags: j.tags || [],
      remote: j.remote,
      postedAt: j.created_at
    }));
}
