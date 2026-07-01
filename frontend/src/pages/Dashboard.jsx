import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Star,
  Bookmark,
  ClipboardList,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  Brain,
  MapPin,
  Layers,
} from "lucide-react";
import { jobsApi } from "../services/jobsApi";
import { careerApi } from "../services/careerApi";
import StatCard from "../components/dashboard/StatCard";
import axios from "axios";
import JobTable from "../components/jobs/JobTable";
import JobDrawer from "../components/jobs/JobDrawer";
import CareerBriefCard from "../components/dashboard/CareerBriefCard";
import CareerReadinessCard from "../components/dashboard/CareerReadinessCard";
import WeeklyGoalCard from "../components/dashboard/WeeklyGoalCard";
import SkillRoadmapCard from "../components/dashboard/SkillRoadmapCard";
import { StatCardSkeleton, TableSkeleton } from "../components/ui/Skeleton";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { ROUTES } from "../constants/routes";
import { useAI } from "../context/AIContext";

// Format ISO or date string to relative-friendly label
function formatScanTime(dateStr) {
  if (!dateStr) return "Never";
  
  let formattedStr = dateStr;
  if (typeof dateStr === "string") {
    // If the timestamp ends with a number (no timezone suffix like Z or +HH:MM),
    // append 'Z' to treat it as UTC.
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(dateStr)) {
      formattedStr = dateStr.includes("T") ? `${dateStr}Z` : `${dateStr.replace(" ", "T")}Z`;
    }
  }

  const date = new Date(formattedStr);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  const timeStr = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  if (isToday) return `Today at ${timeStr}`;
  return `${date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} ${timeStr}`;
}

// Format a source key to a display name
function getDisplayName(src) {
  const mapping = {
    remotive: "Remotive",
    arbeitnow: "Arbeitnow",
    themuse: "The Muse",
    the_muse: "The Muse",
    linkedin: "LinkedIn",
    glassdoor: "Glassdoor",
    naukri: "Naukri",
    foundit: "Foundit",
    indeed: "Indeed",
    instahyre: "Instahyre",
    cutshort: "Cutshort",
    y_combinator: "Y Combinator",
    company_careers: "Company Careers",
  };
  return mapping[src?.toLowerCase()] || (src ? src.charAt(0).toUpperCase() + src.slice(1) : src);
}

// Inline safe markdown: replace **bold** with <strong>
function InlineMd({ text }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="text-text-main font-semibold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scouting, setScouting] = useState(false);
  const [scoutRunCount, setScoutRunCount] = useState(0);
  const [careerIntelligence, setCareerIntelligence] = useState(null);
  const [careerLoading, setCareerLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const { askAIAboutJob, askAISkillGap, askAIInterviewPrep, sendMessage } = useAI();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, jobsData] = await Promise.all([
        jobsApi.getAnalytics(),
        jobsApi.getJobs(),
      ]);
      setStats(analyticsData.stats);
      setRecentJobs(jobsData.slice(0, 5));
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCareerIntelligence = async () => {
    try {
      setCareerLoading(true);
      const data = await careerApi.getIntelligence();
      setCareerIntelligence(data);
    } catch (err) {
      console.error("Failed to load career intelligence", err);
    } finally {
      setCareerLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/resume/profile`);
      if (res.data?.success && res.data?.profile) {
        setProfile(res.data.profile);
      }
    } catch (err) {
      console.warn("Failed to load profile for dashboard:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadCareerIntelligence();
    loadProfile();
  }, []);

  const handleRunScout = async () => {
    try {
      setScouting(true);
      await jobsApi.runScout();
      await Promise.all([loadDashboardData(), loadCareerIntelligence()]);
      setScoutRunCount((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to run scout scan", err);
    } finally {
      setScouting(false);
    }
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await jobsApi.updateJobStatus(jobId, newStatus);
      await loadDashboardData();
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status on dashboard", err);
    }
  };

  // The highest match job from real data only
  const topJob =
    recentJobs.length > 0
      ? recentJobs.reduce(
          (max, job) => (job.matchScore > (max?.matchScore || 0) ? job : max),
          recentJobs[0]
        )
      : null;

  // Country emoji helper
  const countryEmoji = (country) => {
    const map = { India: "🇮🇳", USA: "🇺🇸", UK: "🇬🇧", Australia: "🇦🇺" };
    return map[country] || "🌍";
  };

  return (
    <div className="space-y-8">
      {/* ── Welcome Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
            Welcome back, {profile?.name || "Indrajith"} 👋
          </h1>
          <p className="text-xs sm:text-sm text-text-sec mt-1">
            Here's your job scout activity and AI match recommendations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunScout}
            disabled={scouting}
            className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer border-border-custom hover:border-slate-700"
          >
            {scouting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scouting...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-yellow-500" />
                Run Scout Scan
              </>
            )}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(ROUTES.COPILOT)}
            className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer shadow-lg shadow-blue-500/10"
          >
            <Sparkles className="w-4 h-4" />
            AI Copilot
          </Button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Jobs Discovered"
              value={stats?.totalFound || 0}
              icon={Briefcase}
              description="total opportunities scouted"
            />
            <StatCard
              title="Applications"
              value={stats?.applied || 0}
              icon={ClipboardList}
              description="submitted applications"
            />
            <StatCard
              title="Interviews"
              value={stats?.interviews || 0}
              icon={Target}
              description="active interview rounds"
            />
            <StatCard
              title="Offers"
              value={stats?.offers || 0}
              icon={Star}
              description="offers received"
            />
          </>
        )}
      </div>

      {/* ── Match Categories ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Layers className="w-5 h-5 text-violet-400" />
          <h2 className="text-sm sm:text-base font-bold text-text-main">Match Categories</h2>
          {!loading && stats?.preferredCountry && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/60 border border-border-custom text-[10px] text-text-sec font-semibold">
              <MapPin className="w-3 h-3" />
              {countryEmoji(stats.preferredCountry)} {stats.preferredCountry}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-card-bg border border-border-custom rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card
              onClick={() => navigate(`${ROUTES.JOBS}?discovery=resume`)}
              className="p-5 bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-border-custom flex items-center justify-between hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer group"
            >
              <div>
                <span className="block text-xs text-text-sec font-bold group-hover:text-primary-blue transition-colors">
                  Resume Matches
                </span>
                <span className="block text-[10px] text-text-sec/60 mt-1 font-medium">
                  Roles you qualify for today
                </span>
              </div>
              <div className="text-2xl font-extrabold text-blue-400">
                {stats?.resumeMatches || 0}
              </div>
            </Card>

            <Card
              onClick={() => navigate(`${ROUTES.JOBS}?discovery=preference`)}
              className="p-5 bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-border-custom flex items-center justify-between hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer group"
            >
              <div>
                <span className="block text-xs text-text-sec font-bold group-hover:text-primary-blue transition-colors">
                  Preference Matches
                </span>
                <span className="block text-[10px] text-text-sec/60 mt-1 font-medium">
                  Aligned with your target role
                </span>
              </div>
              <div className="text-2xl font-extrabold text-violet-400">
                {stats?.preferenceMatches || 0}
              </div>
            </Card>

            <Card
              onClick={() => navigate(`${ROUTES.JOBS}?discovery=both`)}
              className="p-5 bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-border-custom flex items-center justify-between hover:border-success-green/40 hover:shadow-lg hover:shadow-success-green/5 transition-all duration-300 cursor-pointer group"
            >
              <div>
                <span className="block text-xs text-text-sec font-bold group-hover:text-primary-blue transition-colors">
                  Perfect Matches
                </span>
                <span className="block text-[10px] text-text-sec/60 mt-1 font-medium">
                  Qualified & preferred — apply now
                </span>
              </div>
              <div className="text-2xl font-extrabold text-success-green">
                {stats?.bothMatches || 0}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ── AI Career Intelligence ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm sm:text-base font-bold text-text-main">AI Career Intelligence</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-bold uppercase tracking-wider">
            Live
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CareerReadinessCard data={careerIntelligence} loading={careerLoading} />
          <WeeklyGoalCard data={careerIntelligence} loading={careerLoading} />
        </div>
        <SkillRoadmapCard data={careerIntelligence} loading={careerLoading} />
      </div>

      {/* ── Scout Activity ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm sm:text-base font-bold text-text-main">Scout Activity</h2>
        </div>

        {loading ? (
          <div className="h-36 bg-card-bg border border-border-custom rounded-xl animate-pulse" />
        ) : (
          <Card className="p-5 bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-border-custom">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] text-text-sec uppercase font-bold tracking-wider">
                  Last Scan
                </p>
                <p className="text-lg font-extrabold text-text-main mt-1">
                  {stats?.latestScoutRun
                    ? formatScanTime(stats.latestScoutRun.created_at)
                    : stats?.scoutedAt
                    ? formatScanTime(stats.scoutedAt)
                    : "Never"}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border self-start sm:self-auto ${
                  stats?.latestScoutRun?.status === "failed"
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}
              >
                {stats?.latestScoutRun?.status === "failed" ? "Failed" : "Success"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900/50 border border-border-custom/30 rounded-xl text-center">
                <span className="block text-[9px] text-text-sec uppercase font-bold tracking-wider">
                  Jobs Found
                </span>
                <span className="block text-xl font-black text-blue-400 mt-1">
                  {stats?.latestScoutRun ? stats.latestScoutRun.jobs_found : stats?.totalFound || 0}
                </span>
              </div>
              <div className="p-3 bg-slate-900/50 border border-border-custom/30 rounded-xl text-center">
                <span className="block text-[9px] text-text-sec uppercase font-bold tracking-wider">
                  High Matches
                </span>
                <span className="block text-xl font-black text-amber-400 mt-1">
                  {stats?.latestScoutRun ? stats.latestScoutRun.high_matches : stats?.highMatch || 0}
                </span>
              </div>
              <div className="p-3 bg-slate-900/50 border border-border-custom/30 rounded-xl text-center">
                <span className="block text-[9px] text-text-sec uppercase font-bold tracking-wider">
                  Duration
                </span>
                <span className="block text-xl font-black text-emerald-400 mt-1">
                  {stats?.latestScoutRun?.scan_duration || 0}s
                </span>
              </div>
            </div>

            {/* Source breakdown if available */}
            {stats?.latestScoutRun?.source_breakdown &&
              Object.keys(stats.latestScoutRun.source_breakdown).length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-custom/40">
                  <p className="text-[9px] text-text-sec uppercase font-bold tracking-wider mb-2">
                    Sources
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-[11px]">
                    {Object.entries(stats.latestScoutRun.source_breakdown)
                      .filter(([, count]) => count > 0)
                      .map(([source, count]) => (
                        <div key={source} className="flex justify-between items-center text-text-sec">
                          <span className="font-medium text-text-sec/80">{getDisplayName(source)}</span>
                          <span className="font-extrabold text-text-main">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {stats?.latestScoutRun?.error_message && (
              <p className="mt-3 text-xs text-red-400 font-medium">
                Error: {stats.latestScoutRun.error_message}
              </p>
            )}
          </Card>
        )}
      </div>

      {/* ── AI Career Insights — only render when real top job exists ── */}
      {!loading && topJob && (
        <div className="space-y-4 relative">
          <div className="absolute -top-12 -left-12 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl -z-10 pointer-events-none" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-blue animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold text-text-main">AI Career Insights</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-bold uppercase tracking-wider">
              Copilot
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Top Match Today */}
            <Card
              onClick={() => askAIAboutJob(topJob, navigate)}
              className="flex flex-col justify-between p-4.5 bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-border-custom hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-text-sec uppercase font-bold tracking-wider">
                  <span className="group-hover:text-primary-blue transition-colors">
                    Top Match Today
                  </span>
                  <Badge score={topJob.matchScore} className="scale-75 origin-right" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-text-main line-clamp-1 group-hover:text-primary-blue transition-colors">
                  {topJob.title}
                </h3>
                {topJob.company && (
                  <p className="text-[11px] text-text-sec">{topJob.company}</p>
                )}
                <div className="text-[10px] text-success-green flex flex-wrap gap-1.5 pt-1">
                  {topJob.skills?.matched?.slice(0, 3).map((s) => (
                    <span key={s}>✓ {s}</span>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-border-custom/50 flex items-center justify-between text-[10px] mt-2">
                {topJob.recommendation ? (
                  <span className="text-text-sec truncate font-medium max-w-[80%]">
                    <InlineMd text={topJob.recommendation} />
                  </span>
                ) : (
                  <span className="text-primary-blue font-semibold">Ask AI about this role</span>
                )}
                <ArrowRight className="w-3.5 h-3.5 text-primary-blue group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>

            {/* Skill Gap */}
            <Card
              onClick={() => askAISkillGap(topJob, navigate)}
              className="flex flex-col justify-between p-4.5 bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-border-custom hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-text-sec uppercase font-bold tracking-wider">
                  <span className="group-hover:text-primary-blue transition-colors">
                    Skill Gap
                  </span>
                  <AlertTriangle className="w-4 h-4 text-warning-yellow" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-text-main">
                  {topJob.skills?.missing?.length || 0} Missing Requirements
                </h3>
                <p className="text-[11px] text-text-sec leading-relaxed line-clamp-2 mt-0.5">
                  {topJob.skills?.missing?.length > 0
                    ? `${topJob.skills.missing.slice(0, 3).join(", ")} — identified for your top matches.`
                    : "Your skills fully match this role's requirements."}
                </p>
              </div>
              <div className="pt-3 border-t border-border-custom/50 flex items-center justify-between text-[10px] mt-2">
                <span className="text-primary-blue font-semibold group-hover:underline">
                  Build study plan
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-primary-blue group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>

            {/* Application Strategy */}
            <Card
              onClick={() => {
                navigate(ROUTES.COPILOT);
                sendMessage("Review my application status and suggest the best next steps");
              }}
              className="flex flex-col justify-between p-4.5 bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-border-custom hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-text-sec uppercase font-bold tracking-wider">
                  <span className="group-hover:text-primary-blue transition-colors">
                    Application Strategy
                  </span>
                  <Zap className="w-4 h-4 text-primary-blue" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-text-main">
                  Optimize Your Pipeline
                </h3>
                <p className="text-[11px] text-text-sec leading-relaxed line-clamp-2 mt-0.5">
                  Get AI recommendations to maximize your interview callback rate.
                </p>
              </div>
              <div className="pt-3 border-t border-border-custom/50 flex items-center justify-between text-[10px] mt-2">
                <span className="text-primary-blue font-semibold group-hover:underline">
                  Get recommendations
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-primary-blue group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>

            {/* Interview Readiness */}
            <Card
              onClick={() => askAIInterviewPrep(topJob, navigate)}
              className="flex flex-col justify-between p-4.5 bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-border-custom hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] text-text-sec uppercase font-bold tracking-wider">
                  <span className="group-hover:text-primary-blue transition-colors">
                    Interview Prep
                  </span>
                  <Target className="w-4 h-4 text-success-green" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-text-main">
                  {topJob.title}
                </h3>
                <p className="text-[11px] text-text-sec leading-relaxed line-clamp-2 mt-0.5">
                  Generate targeted interview questions and preparation tips for this role.
                </p>
              </div>
              <div className="pt-3 border-t border-border-custom/50 flex items-center justify-between text-[10px] mt-2">
                <span className="text-primary-blue font-semibold group-hover:underline">
                  Prepare now
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-primary-blue group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── AI Daily Career Brief ── */}
      <CareerBriefCard refreshTrigger={scoutRunCount} />

      {/* ── Recent Discoveries ── */}
      <Card className="bg-card-bg border border-border-custom shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border-custom/50 mb-5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-main">Recent Discoveries</h3>
            <p className="text-xs text-text-sec mt-0.5">
              Latest jobs matched and scored against your profile.
            </p>
          </div>
          {recentJobs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.JOBS)}
              className="text-xs flex items-center gap-1 text-text-sec hover:text-text-main"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {loading ? (
          <TableSkeleton />
        ) : recentJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-text-main font-semibold">No jobs scouted yet</p>
            <p className="text-xs text-text-sec mt-1 max-w-xs">
              Run a Scout Scan to discover AI-matched opportunities from across the web.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunScout}
              disabled={scouting}
              className="mt-4 flex items-center gap-2 text-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              {scouting ? "Scouting..." : "Run Scout Scan"}
            </Button>
          </div>
        ) : (
          <JobTable jobs={recentJobs} onViewClick={handleViewJob} />
        )}
      </Card>

      {/* ── Job Detail Drawer ── */}
      <JobDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        job={selectedJob}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}