import React, { useState, useEffect } from "react";
import { ClipboardList, MapPin, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jobsApi } from "../services/jobsApi";
import JobDrawer from "../components/jobs/JobDrawer";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { ROUTES } from "../constants/routes";

function relativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  const diffDays = Math.floor((new Date() - date) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

const COLUMNS = [
  { id: "applied", title: "Applied", accent: "border-t-blue-500", dot: "bg-blue-500" },
  { id: "interview", title: "Interviewing", accent: "border-t-yellow-500", dot: "bg-yellow-500" },
  { id: "offer", title: "Offers", accent: "border-t-green-500", dot: "bg-green-500" },
  { id: "rejected", title: "Archived", accent: "border-t-red-500", dot: "bg-red-500" },
];

export default function AppliedJobs() {
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getAppliedJobs();
      setAppliedJobs(data);
    } catch (err) {
      console.error("Failed to load applied jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApplications(); }, []);

  const getJobsByColumn = (columnId) => appliedJobs.filter((job) => job.status === columnId);

  const handleStatusChange = async (jobId, newStatus) => {
    setAppliedJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    if (selectedJob?.id === jobId) setSelectedJob((prev) => ({ ...prev, status: newStatus }));
    try {
      await jobsApi.updateJobStatus(jobId, newStatus);
      const data = await jobsApi.getAppliedJobs();
      setAppliedJobs(data);
      if (newStatus === "new" || newStatus === "saved") setDrawerOpen(false);
    } catch (err) {
      console.error("Failed to update status", err);
      loadApplications();
    }
  };

  const isBoardEmpty = !loading && appliedJobs.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
            Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-text-sec mt-1">
            {loading
              ? "Loading your applications..."
              : `${appliedJobs.length} application${appliedJobs.length !== 1 ? "s" : ""} in your pipeline`}
          </p>
        </div>
      </div>

      {isBoardEmpty ? (
        <EmptyState
          icon={ClipboardList}
          title="No Applications Tracked"
          description="You haven't started tracking any applications yet. Browse jobs and mark them as Applied to add them here."
          actionText="Browse Jobs"
          onActionClick={() => navigate(ROUTES.JOBS)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {COLUMNS.map((col) => {
            const columnJobs = getJobsByColumn(col.id);
            return (
              <div
                key={col.id}
                className={`flex flex-col max-h-[75vh] bg-slate-900/30 border border-border-custom rounded-xl p-4 space-y-4 border-t-2 ${col.accent}`}
              >
                {/* Column header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <h3 className="text-xs sm:text-sm font-semibold text-text-main">{col.title}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-border-custom text-[10px] text-text-sec font-medium">
                    {loading ? "—" : columnJobs.length}
                  </span>
                </div>

                {/* Column cards */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">
                  {loading ? (
                    Array.from({ length: 2 }).map((_, idx) => (
                      <div key={idx} className="bg-card-bg border border-border-custom rounded-lg p-3 space-y-3 animate-pulse">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <div className="flex justify-between items-center pt-2">
                          <Skeleton className="h-5 w-12" />
                          <Skeleton className="h-6 w-12" />
                        </div>
                      </div>
                    ))
                  ) : columnJobs.length > 0 ? (
                    columnJobs.map((job) => (
                      <div
                        key={job.id}
                        className="group bg-card-bg border border-border-custom hover:border-slate-700 rounded-xl p-4 space-y-2.5 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-text-main leading-tight line-clamp-2 group-hover:text-primary-blue transition-colors">
                              {job.title}
                            </h4>
                            {job.company && (
                              <p className="text-[11px] text-text-sec mt-0.5 flex items-center gap-1 truncate">
                                <Building2 className="w-3 h-3 flex-shrink-0" />
                                {job.company}
                              </p>
                            )}
                          </div>
                        </div>

                        {job.location && (
                          <div className="flex items-center gap-1.5 text-[10px] text-text-sec">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-border-custom/50 pt-2.5 mt-1">
                          <div className="flex items-center gap-2">
                            <Badge score={job.matchScore} className="scale-90 origin-left" />
                            {job.createdAt && (
                              <span className="text-[9px] text-text-sec/60">{relativeTime(job.createdAt)}</span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedJob(job);
                              setDrawerOpen(true);
                            }}
                            className="py-1 px-2.5 text-[10px] h-6"
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border-custom/40 rounded-lg">
                      <p className="text-[11px] text-text-sec">No items</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
