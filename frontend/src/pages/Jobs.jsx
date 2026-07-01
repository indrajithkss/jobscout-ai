import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, MapPin, Globe, Sparkles, SlidersHorizontal, Inbox, X } from "lucide-react";
import { jobsApi } from "../services/jobsApi";
import JobCard from "../components/jobs/JobCard";
import JobDrawer from "../components/jobs/JobDrawer";
import { JobCardSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

export default function Jobs() {
  const [loading, setLoading] = useState(true);
  const [allJobs, setAllJobs] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [locationFilter, setLocationFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState("All");
  const [discoveryFilter, setDiscoveryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("score-desc");

  const [selectedJob, setSelectedJob] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sync discovery filter from URL param
  useEffect(() => {
    const discoveryVal = searchParams.get("discovery");
    if (discoveryVal && ["resume", "preference", "both"].includes(discoveryVal)) {
      setDiscoveryFilter(discoveryVal);
    } else {
      setDiscoveryFilter("All");
    }
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);
  }, [searchParams]);

  const handleDiscoveryChange = (value) => {
    setDiscoveryFilter(value);
    const newParams = new URLSearchParams(searchParams);
    if (value === "All") newParams.delete("discovery");
    else newParams.set("discovery", value);
    setSearchParams(newParams);
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchJobsList() {
      try {
        setLoading(true);
        const data = await jobsApi.getJobs();
        if (isMounted) setAllJobs(data);
      } catch (err) {
        console.error("Failed to load jobs list", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchJobsList();
    return () => { isMounted = false; };
  }, []);

  // Derive unique filter options from real data
  const locationOptions = useMemo(() => {
    const locs = new Set();
    allJobs.forEach((job) => {
      if (!job.location) return;
      const loc = job.location.trim();
      if (loc.toLowerCase().includes("remote")) locs.add("Remote");
      else {
        // Extract city name (before comma if present)
        const city = loc.split(",")[0].trim();
        if (city) locs.add(city);
      }
    });
    return ["All", ...Array.from(locs).sort()];
  }, [allJobs]);

  const sourceOptions = useMemo(() => {
    const sources = new Set();
    allJobs.forEach((job) => { if (job.source) sources.add(job.source); });
    return ["All", ...Array.from(sources).sort()];
  }, [allJobs]);

  // Apply filters + sort
  const filteredJobs = useMemo(() => {
    let results = [...allJobs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (job) =>
          job.title?.toLowerCase().includes(q) ||
          job.company?.toLowerCase().includes(q) ||
          job.description?.toLowerCase().includes(q)
      );
    }

    if (locationFilter !== "All") {
      if (locationFilter === "Remote") {
        results = results.filter((job) => job.location?.toLowerCase().includes("remote"));
      } else {
        results = results.filter((job) =>
          job.location?.toLowerCase().includes(locationFilter.toLowerCase())
        );
      }
    }

    if (sourceFilter !== "All") {
      results = results.filter((job) => job.source === sourceFilter);
    }

    if (scoreFilter !== "All") {
      const min = parseInt(scoreFilter);
      results = results.filter((job) => job.matchScore >= min);
    }

    if (discoveryFilter !== "All") {
      results = results.filter((job) => job.discovery_type === discoveryFilter);
    }

    if (sortBy === "score-desc") results.sort((a, b) => b.matchScore - a.matchScore);
    else if (sortBy === "score-asc") results.sort((a, b) => a.matchScore - b.matchScore);

    return results;
  }, [searchQuery, locationFilter, sourceFilter, scoreFilter, discoveryFilter, sortBy, allJobs]);

  const handleStatusChange = async (jobId, newStatus) => {
    const job = allJobs.find((j) => j.id === jobId);
    if (!job) return;
    setAllJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    if (selectedJob?.id === jobId) setSelectedJob((prev) => ({ ...prev, status: newStatus }));
    try {
      await jobsApi.updateJobStatus(jobId, newStatus);
    } catch {
      setAllJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: job.status } : j)));
      if (selectedJob?.id === jobId) setSelectedJob((prev) => ({ ...prev, status: job.status }));
    }
  };

  const hasActiveFilters =
    searchQuery ||
    locationFilter !== "All" ||
    sourceFilter !== "All" ||
    scoreFilter !== "All" ||
    discoveryFilter !== "All";

  const handleClearFilters = () => {
    setSearchQuery("");
    setLocationFilter("All");
    setSourceFilter("All");
    setScoreFilter("All");
    setDiscoveryFilter("All");
    setSortBy("score-desc");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("discovery");
    newParams.delete("q");
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
            Explore Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-text-sec mt-1">
            {loading
              ? "Loading your matched jobs..."
              : `${filteredJobs.length} of ${allJobs.length} jobs matching your criteria`}
          </p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-card-bg border border-border-custom rounded-xl p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-text-sec pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, companies, or skills..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-border-custom focus:border-slate-700 rounded-lg text-xs sm:text-sm text-text-main placeholder-text-sec outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-3 flex items-center text-text-sec hover:text-text-main"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter selects */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-text-sec pr-2 border-r border-border-custom text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </div>

          {/* Location */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-border-custom hover:border-slate-800 rounded-lg text-xs text-text-sec hover:text-text-main outline-none transition-colors cursor-pointer"
          >
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc === "All" ? "Location: All" : loc}
              </option>
            ))}
          </select>

          {/* Source */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-border-custom hover:border-slate-800 rounded-lg text-xs text-text-sec hover:text-text-main outline-none transition-colors cursor-pointer"
          >
            {sourceOptions.map((src) => (
              <option key={src} value={src}>
                {src === "All" ? "Source: All" : src}
              </option>
            ))}
          </select>

          {/* Match score */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-border-custom hover:border-slate-800 rounded-lg text-xs text-text-sec hover:text-text-main outline-none transition-colors cursor-pointer"
          >
            <option value="All">Match: All</option>
            <option value="90">90%+ Match</option>
            <option value="75">75%+ Match</option>
            <option value="60">60%+ Match</option>
          </select>

          {/* Discovery type */}
          <select
            value={discoveryFilter}
            onChange={(e) => handleDiscoveryChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-border-custom hover:border-slate-800 rounded-lg text-xs text-text-sec hover:text-text-main outline-none transition-colors cursor-pointer"
          >
            <option value="All">Discovery: All</option>
            <option value="resume">Qualified (Resume)</option>
            <option value="preference">Desired (Preference)</option>
            <option value="both">Perfect Match (Both)</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-border-custom hover:border-slate-800 rounded-lg text-xs text-text-sec hover:text-text-main outline-none transition-colors cursor-pointer sm:ml-auto"
          >
            <option value="score-desc">Highest Match</option>
            <option value="score-asc">Lowest Match</option>
            <option value="recent">Recently Found</option>
          </select>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs px-2.5 h-7">
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewClick={() => {
                setSelectedJob(job);
                setDrawerOpen(true);
              }}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No Jobs Found"
          description={
            hasActiveFilters
              ? "No jobs match your current filters. Try adjusting or clearing them."
              : "No jobs have been scouted yet. Run a Scout Scan from the Dashboard to discover opportunities."
          }
          actionText={hasActiveFilters ? "Clear Filters" : undefined}
          onActionClick={hasActiveFilters ? handleClearFilters : undefined}
        />
      )}

      {/* Detail drawer */}
      <JobDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        job={selectedJob}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
