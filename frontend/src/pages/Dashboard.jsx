import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Star, Bookmark, ClipboardList, Sparkles, AlertTriangle, ArrowRight, Zap, Target } from "lucide-react";
import { jobsApi } from "../services/jobsApi";
import StatCard from "../components/dashboard/StatCard";
import JobTable from "../components/jobs/JobTable";
import JobDrawer from "../components/jobs/JobDrawer";
import { StatCardSkeleton, TableSkeleton } from "../components/ui/Skeleton";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { ROUTES } from "../constants/routes";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [analyticsData, jobsData] = await Promise.all([
          jobsApi.getAnalytics(),
          jobsApi.getJobs()
        ]);
        if (isMounted) {
          setStats(analyticsData.stats);
          setRecentJobs(jobsData.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
            Welcome back, Indrajith
          </h1>
          <p className="text-xs sm:text-sm text-text-sec mt-1">
            Here is a summary of your job scout activities and AI match recommendations.
          </p>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => navigate(ROUTES.COPILOT)}
          className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Talk to Copilot
        </Button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Jobs Found Today"
              value={stats?.totalFound || 0}
              icon={Briefcase}
              trend="+12%"
              trendType="up"
              description="since yesterday"
            />
            <StatCard
              title="High Match Jobs"
              value={stats?.highMatch || 0}
              icon={Star}
              trend="85%+"
              trendType="neutral"
              description="match percentage"
            />
            <StatCard
              title="Saved Jobs"
              value={stats?.saved || 0}
              icon={Bookmark}
              description="awaiting review"
            />
            <StatCard
              title="Applied Jobs"
              value={stats?.applied || 0}
              icon={ClipboardList}
              trend="+2"
              trendType="up"
              description="applied this week"
            />
          </>
        )}
      </div>

      {/* AI Career Insights Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-primary-blue" />
          <h2 className="text-sm sm:text-base font-bold text-text-main">
            AI Career Insights
          </h2>
          <Badge variant="blue" className="scale-90 origin-left lowercase">agent active</Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 bg-card-bg border border-border-custom rounded-xl p-4 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Top Match Today */}
            <Card className="flex flex-col justify-between p-4 bg-slate-900/60 border border-border-custom hover:border-slate-800 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-text-sec uppercase font-bold tracking-wider">
                  <span>Top Match Today</span>
                  <Badge score={96} className="scale-75 origin-right" />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-text-main line-clamp-1">Senior React Engineer</h3>
                <p className="text-[11px] text-text-sec">Vercel • Remote</p>
                <div className="text-[10px] text-success-green flex gap-1.5 pt-1">
                  <span>✓ React</span>
                  <span>✓ Next.js</span>
                  <span>✓ CSS</span>
                </div>
              </div>
              <div className="pt-3 border-t border-border-custom/50 flex items-center justify-between text-[10px]">
                <span className="text-text-sec">Rec: **Apply Immediately**</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary-blue" />
              </div>
            </Card>

            {/* Skill Gap Summary */}
            <Card className="flex flex-col justify-between p-4 bg-slate-900/60 border border-border-custom hover:border-slate-800 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-text-sec uppercase font-bold tracking-wider">
                  <span>Skill Gap Summary</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-warning-yellow" />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-text-main">3 Missing Requirements</h3>
                <p className="text-[11px] text-text-sec leading-relaxed line-clamp-2">AWS, Docker, and GraphQL missing across target listings.</p>
              </div>
              <div className="pt-3 border-t border-border-custom/50 flex items-center justify-between text-[10px] text-primary-blue hover:underline cursor-pointer" onClick={() => navigate(ROUTES.COPILOT)}>
                <span>Focus study plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            {/* Application Strategy */}
            <Card className="flex flex-col justify-between p-4 bg-slate-900/60 border border-border-custom hover:border-slate-800 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-text-sec uppercase font-bold tracking-wider">
                  <span>Application Strategy</span>
                  <Zap className="w-3.5 h-3.5 text-primary-blue" />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-text-main">Optimize Interview Rate</h3>
                <p className="text-[11px] text-text-sec leading-relaxed line-clamp-2">Priority: review Linear prep questions today. Reach out to Supabase recruiter.</p>
              </div>
              <div className="pt-3 border-t border-border-custom/50 flex items-center justify-between text-[10px] text-primary-blue hover:underline cursor-pointer" onClick={() => navigate(ROUTES.COPILOT)}>
                <span>Review tips</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            {/* Interview Readiness */}
            <Card className="flex flex-col justify-between p-4 bg-slate-900/60 border border-border-custom hover:border-slate-800 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-text-sec uppercase font-bold tracking-wider">
                  <span>Interview Readiness</span>
                  <Target className="w-3.5 h-3.5 text-success-green" />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-text-main">78% Match Strength</h3>
                <p className="text-[11px] text-text-sec leading-relaxed line-clamp-2">Strong on Frontend logic. Revise databases & server deployment architectures.</p>
              </div>
              <div className="pt-3 border-t border-border-custom/50 flex items-center justify-between text-[10px] text-primary-blue hover:underline cursor-pointer" onClick={() => navigate(ROUTES.COPILOT)}>
                <span>Prepare interview Q&A</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Recent Jobs Table Card */}
      <Card className="bg-card-bg border border-border-custom">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border-custom/50 mb-5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-main">
              Recent Discoveries
            </h3>
            <p className="text-xs text-text-sec mt-0.5">
              Latest jobs matched and scored against your candidate profile.
            </p>
          </div>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : (
          <JobTable jobs={recentJobs} onViewClick={handleViewJob} />
        )}
      </Card>

      {/* Slide-over Job Details Drawer */}
      <JobDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        job={selectedJob}
      />
    </div>
  );
}