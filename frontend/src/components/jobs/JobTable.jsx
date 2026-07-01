import React from "react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { ExternalLink } from "lucide-react";

export default function JobTable({ jobs, onViewClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Applied":
        return "blue";
      case "Interview":
        return "yellow";
      case "Offer":
        return "green";
      case "Rejected":
        return "red";
      case "Saved":
        return "slate";
      default:
        return "slate";
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border-custom text-text-sec text-[10px] font-bold uppercase tracking-wider">
            <th className="py-3 px-4">Job Title</th>
            <th className="py-3 px-4">Company</th>
            <th className="py-3 px-4">Location</th>
            <th className="py-3 px-4">Match Score</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-custom/30 text-xs sm:text-sm text-text-main">
          {jobs.map((job) => (
            <tr 
              key={job.id} 
              className="hover:bg-slate-900/30 transition-all duration-150"
            >
              {/* Job Title */}
              <td className="py-3.5 px-4 font-semibold text-text-main max-w-xs truncate">
                {job.title}
              </td>
              {/* Company */}
              <td className="py-3.5 px-4 text-text-sec">
                {job.company}
              </td>
              {/* Location */}
              <td className="py-3.5 px-4 text-text-sec max-w-[120px] truncate">
                {job.location}
              </td>
              {/* Match Score */}
              <td className="py-3.5 px-4">
                <Badge score={job.matchScore} />
              </td>
              {/* Status */}
              <td className="py-3.5 px-4">
                <Badge variant={getStatusColor(job.status)}>
                  {job.status || "None"}
                </Badge>
              </td>
              {/* Action Buttons */}
              <td className="py-3.5 px-4">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => onViewClick(job)} 
                    className="py-1 px-3 text-xs"
                  >
                    View
                  </Button>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-900 border border-border-custom hover:border-slate-800 text-text-sec hover:text-text-main transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
