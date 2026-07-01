import React, { useState, useEffect } from "react";
import { Bookmark, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jobsApi } from "../services/jobsApi";
import JobCard from "../components/jobs/JobCard";
import JobDrawer from "../components/jobs/JobDrawer";
import { JobCardSkeleton } from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { ROUTES } from "../constants/routes";

export default function SavedJobs() {
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function loadBookmarks() {
      try {
        setLoading(true);
        const data = await jobsApi.getSavedJobs();
        if (isMounted) {
          setSavedJobs(data);
        }
      } catch (err) {
        console.error("Failed to load saved jobs", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadBookmarks();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveToggle = (jobId) => {
    // Remove the job from the saved list immediately to provide reactive UI response
    setSavedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
          Saved Opportunities
        </h1>
        <p className="text-xs sm:text-sm text-text-sec mt-1">
          Keep track of positions you are interested in reviewing or applying for.
        </p>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
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
          icon={Bookmark}
          title="No Saved Jobs"
          description="You haven't bookmarked any opportunities yet. Explore the jobs index to find matches and save them here."
          actionText="Find Jobs to Save"
          onActionClick={() => navigate(ROUTES.JOBS)}
        />
      )}

      {/* Drawer Details */}
      <JobDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        job={selectedJob}
      />
    </div>
  );
}
