/**
 * The Muse Provider
 * Free API — no API key required for basic use
 * Endpoint: https://www.themuse.com/api/public/jobs
 * Coverage: Company-curated tech & business job listings worldwide
 */

const THE_MUSE_BASE = "https://www.themuse.com/api/public/jobs";

export async function fetchTheMuseJobs(searchQuery, category = "Engineering") {
  const res = await fetch(`${THE_MUSE_BASE}?category=${encodeURIComponent(category)}&page=0&descending=true`);
  if (!res.ok) throw new Error(`The Muse API error: ${res.status}`);
  const data = await res.json();
  const queryLower = searchQuery.toLowerCase();

  return (data.results || [])
    .filter(j => {
      const name = (j.name || "").toLowerCase();
      return queryLower.split(" ").some(word => word.length > 2 && name.includes(word));
    })
    .slice(0, 8)
    .map(j => ({
      id: j.id,
      title: j.name,
      company: j.company?.name || "Unknown",
      location: j.locations?.map(l => l.name).join(", ") || "Remote",
      source: "The Muse",
      applyUrl: j.refs?.landing_page || "https://www.themuse.com/jobs",
      logo: null,
      description: j.contents?.replace(/<[^>]+>/g, " ").slice(0, 600) || "",
      tags: j.tags?.map(t => t.name) || [],
      postedAt: j.publication_date
    }));
}
