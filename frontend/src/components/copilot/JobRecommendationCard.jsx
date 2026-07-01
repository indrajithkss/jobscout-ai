import React from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { ArrowUpRight } from "lucide-react";

export default function JobRecommendationCard({ jobs, onJobClick }) {
  return (
    <div className="grid grid-cols-1 gap-3 mt-3 w-full">
      {jobs.map((job) => (
        <Card 
          key={job.id} 
          hover 
          onClick={() => onJobClick?.(job)}
          className="flex items-center justify-between p-3.5 bg-slate-900 border border-border-custom hover:border-slate-800 group transition-all duration-200"
        >
          <div className="flex gap-3 min-w-0">
            {/* Logo placeholder */}
            <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-800 border border-slate-700 font-bold text-xs shrink-0 text-text-main uppercase">
              {job.title.split(/\s+/).map(w => w.charAt(0)).join("").substring(0, 2)}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm text-text-main truncate group-hover:text-primary-blue transition-colors">
                {job.title}
              </h4>
              <p className="text-[10px] text-text-sec flex items-center gap-1.5 mt-0.5">
                <span>{job.location}</span>
              </p>
            </div>
          </div>
          {/* Match rating badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Badge score={job.matchScore} className="scale-90" />
            <ArrowUpRight className="w-4 h-4 text-text-sec group-hover:text-text-main transition-colors" />
          </div>
        </Card>
      ))}
    </div>
  );
}
