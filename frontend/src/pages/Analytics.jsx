import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Compass, CheckCircle2, PhoneCall, Award } from "lucide-react";
import { jobsApi } from "../services/jobsApi";
import StatCard from "../components/dashboard/StatCard";
import Card from "../components/ui/Card";
import { StatCardSkeleton } from "../components/ui/Skeleton";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadAnalytics() {
      try {
        setLoading(true);
        const data = await jobsApi.getAnalytics();
        if (isMounted) {
          setAnalytics(data);
        }
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">Analytics & Insights</h1>
          <p className="text-xs sm:text-sm text-text-sec mt-1">Analyzing your pipeline conversion rates and monthly scouting activity.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const { stats, pipeline, monthlyApplications } = analytics;

  // Conversion funnel data values
  const funnelSteps = [
    { label: "Jobs Found", value: stats.totalFound, color: "bg-blue-600" },
    { label: "Jobs Saved", value: stats.saved, color: "bg-slate-700" },
    { label: "Applied", value: stats.applied, color: "bg-indigo-600" },
    { label: "Interviews", value: pipeline.interview, color: "bg-yellow-500" },
    { label: "Offers", value: pipeline.offer, color: "bg-green-500" }
  ];

  const maxFunnelValue = Math.max(...funnelSteps.map(s => s.value));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
          Analytics & Insights
        </h1>
        <p className="text-xs sm:text-sm text-text-sec mt-1">
          Analyzing your pipeline conversion rates and monthly scouting activity.
        </p>
      </div>

      {/* Analytics stats cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Conversion Rate"
          value={`${stats.interviewRate}%`}
          icon={TrendingUp}
          trend="High"
          trendType="up"
          description="application to interview conversion rate"
        />
        <StatCard
          title="Interview Rate"
          value={`${stats.interviewRate}%`}
          icon={PhoneCall}
          description="percentage of interview request calls"
        />
        <StatCard
          title="Offer Success"
          value={`${stats.offerRate}%`}
          icon={CheckCircle2}
          trend="+3%"
          trendType="up"
          description="interview to offer conversion rate"
        />
        <StatCard
          title="Active Opportunities"
          value={stats.totalFound}
          icon={Compass}
          description="total opportunities scouted"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Conversion Funnel Bar Chart */}
        <Card className="lg:col-span-1 space-y-6 bg-card-bg border border-border-custom">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-main">
              Funnel Conversion
            </h3>
            <p className="text-xs text-text-sec mt-0.5">
              Efficiency across scouting stages.
            </p>
          </div>

          <div className="space-y-4">
            {funnelSteps.map((step) => {
              const percentage = maxFunnelValue > 0 ? (step.value / maxFunnelValue) * 100 : 0;
              return (
                <div key={step.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-sec font-medium">{step.label}</span>
                    <span className="text-text-main font-semibold">{step.value}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 border border-border-custom/50 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${step.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Monthly Activity SVG Line Chart */}
        <Card className="lg:col-span-2 space-y-6 bg-card-bg border border-border-custom">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-text-main">
              Scouting History
            </h3>
            <p className="text-xs text-text-sec mt-0.5">
              Monthly analysis of found opportunities and applications.
            </p>
          </div>

          {/* Premium custom line chart */}
          <div className="w-full h-64 relative flex flex-col justify-between">
            {/* Grid background lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-2">
              <div className="border-b border-border-custom/30 w-full h-0"></div>
              <div className="border-b border-border-custom/30 w-full h-0"></div>
              <div className="border-b border-border-custom/30 w-full h-0"></div>
              <div className="border-b border-border-custom/30 w-full h-0"></div>
            </div>

            {/* SVG Lines */}
            <svg className="w-full h-full absolute inset-0 z-10" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0"/>
                </linearGradient>
              </defs>

              {/* Monthly found jobs area path */}
              <path
                d="M 10 180 Q 100 130 190 120 T 370 80 T 490 50 L 490 200 L 10 200 Z"
                fill="url(#blueGlow)"
              />

              {/* Monthly found jobs line */}
              <path
                d="M 10 180 Q 100 130 190 120 T 370 80 T 490 50"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Monthly applications line */}
              <path
                d="M 10 195 Q 100 180 190 170 T 370 140 T 490 130"
                fill="none"
                stroke="#22C55E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="4 2"
              />
            </svg>

            {/* Empty space filler for relative height layout */}
            <div className="flex-1"></div>

            {/* X-Axis labels */}
            <div className="flex justify-between items-center px-2 pt-2 border-t border-border-custom text-[10px] text-text-sec font-semibold">
              {monthlyApplications.map(d => (
                <span key={d.month}>{d.month}</span>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 justify-center text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-primary-blue inline-block"></span>
              <span className="text-text-sec font-medium">Opportunities Found</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 border-t border-dashed border-success-green inline-block"></span>
              <span className="text-text-sec font-medium">Applications Sent</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
