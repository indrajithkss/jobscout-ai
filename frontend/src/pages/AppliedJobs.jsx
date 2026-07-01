import React, { useState, useEffect } from "react";
import { ClipboardList, Plus, Building, MapPin, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jobsApi } from "../services/jobsApi";
import JobDrawer from "../components/jobs/JobDrawer";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/Skeleton";
import { ROUTES } from "../constants/routes";

export default function AppliedJobs() {
  const [loading, setLoading] = useState(true);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // Kanban pipeline columns
  const COLUMNS = [
    { id: "Applied", title: "Applied", color: "border-t-2 border-t-blue-500", dotColor: "bg-blue-500" },
    { id: "Interview", title: "Interviewing", color: "border-t-2 border-t-yellow-500", dotColor: "bg-yellow-500" },
    { id: "Offer", title: "Offers", color: "border-t-2 border-t-green-500", dotColor: "bg-green-500" },
    { id: "Rejected", title: "Archived/Rejected", color: "border-t-2 border-t-red-500", dotColor: "bg-red-500" },
  ];

  useEffect(() => {
    let isMounted = true;
    async function loadApplications() {
      try {
        setLoading(true);
        const data = await jobsApi.getAppliedJobs();
        if (isMounted) {
          setAppliedJobs(data);
        }
      } catch (err) {
        console.error("Failed to load applied jobs", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadApplications();
    return () => {
      isMounted = false;
    };
  }, []);

  const getJobsByColumn = (columnId) => {
    return appliedJobs.filter(job => job.status === columnId);
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  // Check if overall board is empty
  const isBoardEmpty = !loading && appliedJobs.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
            Application Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-text-sec mt-1">
            Track and manage your submitted applications through the recruitment phases.
          </p>
        </div>
      </div>

      {isBoardEmpty ? (
        <EmptyState
          icon={ClipboardList}
          title="No Applications Tracked"
          description="You haven't added any applications to your pipeline yet. Start applying to jobs in your directory."
          actionText="Search Jobs"
          onActionClick={() => navigate(ROUTES.JOBS)}
        />
      ) : (
        /* Kanban Grid columns */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {COLUMNS.map(col => {
            const columnJobs = getJobsByColumn(col.id);

            return (
              <div 
                key={col.id}
                className={`flex flex-col max-h-[75vh] bg-slate-900/30 border border-border-custom rounded-xl p-4 space-y-4 ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`}></span>
                    <h3 className="text-xs sm:text-sm font-semibold text-text-main">
                      {col.title}
                    </h3>
                  </div>
                  {/* Item counter */}
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-border-custom text-[10px] text-text-sec font-medium">
                    {loading ? "-" : columnJobs.length}
                  </span>
                </div>

                {/* Column Body Cards scroll list */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 scrollbar-thin">
                  {loading ? (
                    // Column skeletons
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
                    columnJobs.map(job => (
                      <div 
                        key={job.id}
                        className="group bg-card-bg border border-border-custom hover:border-slate-700 rounded-xl p-4 space-y-3 transition-all duration-200 shadow-xs"
                      >
                        {/* Title & match rating */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs sm:text-sm font-semibold text-text-main leading-tight line-clamp-1 group-hover:text-primary-blue transition-colors">
                              {job.title}
                            </h4>
                            <p className="text-[10px] text-text-sec mt-0.5 font-medium flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {job.company}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex items-center gap-1.5 text-[10px] text-text-sec">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{job.location}</span>
                        </div>

                        {/* Footer details */}
                        <div className="flex items-center justify-between border-t border-border-custom/50 pt-3 mt-1.5">
                          <Badge score={job.matchScore} className="scale-90 origin-left" />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewJob(job)}
                            className="py-1 px-2.5 text-[10px] h-6"
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Column is empty
                    <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-border-custom/40 rounded-lg">
                      <p className="text-[10px] text-text-sec">No items</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
