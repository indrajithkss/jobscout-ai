import React, { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
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

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getSavedJobs();
      setSavedJobs(data);
    } catch (err) {
      console.error("Failed to load saved jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBookmarks(); }, []);

  const handleStatusChange = async (jobId, newStatus) => {
    const job = savedJobs.find((j) => j.id === jobId);
    if (!job) return;

    if (newStatus !== "saved") {
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
      if (selectedJob?.id === jobId) setSelectedJob((prev) => ({ ...prev, status: newStatus }));
    } else {
      setSavedJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
      if (selectedJob?.id === jobId) setSelectedJob((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      await jobsApi.updateJobStatus(jobId, newStatus);
      if (newStatus !== "saved") setDrawerOpen(false);
    } catch (err) {
      console.error("Failed to update status on server", err);
      loadBookmarks();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
          Saved Jobs
        </h1>
        <p className="text-xs sm:text-sm text-text-sec mt-1">
          {loading
            ? "Loading your saved jobs..."
            : `${savedJobs.length} saved opportunit${savedJobs.length !== 1 ? "ies" : "y"}`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
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
          icon={Bookmark}
          title="No Saved Jobs"
          description="You haven't bookmarked any opportunities yet. Browse jobs and save the ones you're interested in."
          actionText="Browse Jobs"
          onActionClick={() => navigate(ROUTES.JOBS)}
        />
      )}

      <JobDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        job={selectedJob}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
