import React, { useState, useEffect } from "react";
import { Search, MapPin, Globe, Sparkles, SlidersHorizontal, Inbox } from "lucide-react";
import { jobsApi } from "../services/jobsApi";
import JobCard from "../components/jobs/JobCard";
import JobDrawer from "../components/jobs/JobDrawer";
import { JobCardSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";

export default function Jobs() {
  const [loading, setLoading] = useState(true);
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  
  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState("All");
  const [sortBy, setSortBy] = useState("score-desc"); // score-desc, score-asc, recent

  // Drawer Detail State
  const [selectedJob, setSelectedJob] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchJobsList() {
      try {
        setLoading(true);
        const data = await jobsApi.getJobs();
        if (isMounted) {
          setAllJobs(data);
          setFilteredJobs(data);
        }
      } catch (err) {
        console.error("Failed to load jobs list", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchJobsList();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and sort logic whenever query or filters change
  useEffect(() => {
    let results = [...allJobs];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query)
      );
    }

    // 2. Location Filter
    if (locationFilter !== "All") {
      if (locationFilter === "Remote") {
        results = results.filter((job) => job.location.toLowerCase().includes("remote"));
      } else {
        results = results.filter((job) => job.location.toLowerCase().includes(locationFilter.toLowerCase()));
      }
    }

    // 3. Source Filter
    if (sourceFilter !== "All") {
      results = results.filter((job) => job.source === sourceFilter);
    }

    // 4. Score Filter
    if (scoreFilter !== "All") {
      const minScore = parseInt(scoreFilter);
      results = results.filter((job) => job.matchScore >= minScore);
    }

    // 5. Sorting
    if (sortBy === "score-desc") {
      results.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === "score-asc") {
      results.sort((a, b) => a.matchScore - b.matchScore);
    } // "recent" keeps raw database feed order

    setFilteredJobs(results);
  }, [searchQuery, locationFilter, sourceFilter, scoreFilter, sortBy, allJobs]);

  const handleSaveToggle = (jobId) => {
    setAllJobs(prevJobs =>
      prevJobs.map(job => {
        if (job.id === jobId) {
          return {
            ...job,
            status: job.status === "Saved" ? "None" : "Saved"
          };
        }
        return job;
      })
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setLocationFilter("All");
    setSourceFilter("All");
    setScoreFilter("All");
    setSortBy("score-desc");
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
            Explore Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-text-sec mt-1">
            Browse and filter through AI-scouted job roles matched for you.
          </p>
        </div>
      </div>

      {/* Filter Row container */}
      <div className="bg-card-bg border border-border-custom rounded-xl p-4 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-text-sec">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search job titles, skills, or companies..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-border-custom focus:border-slate-700 rounded-lg text-xs sm:text-sm text-text-main placeholder-text-sec outline-hidden transition-colors"
          />
        </div>

        {/* Filter select Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mobile Icon */}
          <div className="flex items-center gap-2 text-text-sec pr-1 border-r border-border-custom hidden sm:flex text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </div>

          {/* Location */}
          <div className="flex flex-col">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-border-custom hover:border-slate-800 rounded-lg text-xs text-text-sec hover:text-text-main outline-hidden transition-colors cursor-pointer"
            >
              <option value="All">Location: All</option>
              <option value="Remote">Remote</option>
              <option value="Bangalore">Bangalore</option>
              <option value="San Francisco">San Francisco</option>
            </select>
          </div>

          {/* Source */}
          <div className="flex flex-col">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-border-custom hover:border-slate-800 rounded-lg text-xs text-text-sec hover:text-text-main outline-hidden transition-colors cursor-pointer"
            >
              <option value="All">Source: All</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Indeed">Indeed</option>
              <option value="GitHub Jobs">GitHub Jobs</option>
              <option value="Y Combinator">Y Combinator</option>
            </select>
          </div>

          {/* Match Score */}
          <div className="flex flex-col">
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-border-custom hover:border-slate-800 rounded-lg text-xs text-text-sec hover:text-text-main outline-hidden transition-colors cursor-pointer"
            >
              <option value="All">Match: All</option>
              <option value="90">90%+ Match</option>
              <option value="75">75%+ Match</option>
              <option value="60">60%+ Match</option>
            </select>
          </div>

          {/* Sort selection */}
          <div className="flex flex-col sm:ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-border-custom hover:border-slate-800 rounded-lg text-xs text-text-sec hover:text-text-main outline-hidden transition-colors cursor-pointer"
            >
              <option value="score-desc">Sort: Highest Match</option>
              <option value="score-asc">Sort: Lowest Match</option>
              <option value="recent">Sort: Discovered</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchQuery || locationFilter !== "All" || sourceFilter !== "All" || scoreFilter !== "All") && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs px-2.5 h-7">
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewClick={() => handleViewJob(job)}
              onSaveToggle={() => handleSaveToggle(job.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Inbox}
          title="No Match Found"
          description="We couldn't find any job opportunities matching your current filter criteria. Try resetting filters or broaden your query."
          actionText="Reset All Filters"
          onActionClick={handleClearFilters}
        />
      )}

      {/* Drawer */}
      <JobDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        job={selectedJob}
      />
    </div>
  );
}
