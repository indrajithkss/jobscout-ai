import React from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { BookOpen, Award } from "lucide-react";

export default function SkillGapCard({ data }) {
  const { candidateSkills = [], requiredSkills = [], missingSkills = [], recommendations = [] } = data;

  return (
    <Card className="mt-3 p-4 bg-slate-900 border border-border-custom space-y-4">
      {/* Skill Gaps counters */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs sm:text-sm font-semibold text-text-main flex items-center gap-2">
          <Award className="w-4 h-4 text-warning-yellow" />
          Skill Gap Analysis
        </h4>
        <Badge variant={missingSkills.length === 0 ? "green" : "red"} className="scale-90 origin-right">
          {missingSkills.length} Skills Missing
        </Badge>
      </div>

      {/* Grid comparing matched vs missing */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-1.5">
          <p className="font-semibold text-success-green uppercase text-[10px] tracking-wide">
            ✓ Matched Skills
          </p>
          <div className="flex flex-wrap gap-1">
            {requiredSkills
              .filter((skill) => candidateSkills.includes(skill))
              .map((skill) => (
                <span 
                  key={skill} 
                  className="px-1.5 py-0.5 rounded bg-success-green/10 border border-success-green/20 text-[10px] text-success-green font-medium"
                >
                  {skill}
                </span>
              ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="font-semibold text-error-red uppercase text-[10px] tracking-wide">
            ✗ Missing Skills
          </p>
          <div className="flex flex-wrap gap-1">
            {missingSkills.length > 0 ? (
              missingSkills.map((skill) => (
                <span 
                  key={skill} 
                  className="px-1.5 py-0.5 rounded bg-error-red/10 border border-error-red/20 text-[10px] text-error-red font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-text-sec">None</span>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations actions */}
      {recommendations.length > 0 && (
        <div className="pt-3 border-t border-border-custom/50 space-y-2.5">
          <p className="text-[10px] sm:text-xs font-semibold text-text-main flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-primary-blue" />
            AI Action Strategy
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-slate-950/60 border border-border-custom/50 text-xs">
                <p className="font-semibold text-text-main text-[11px] sm:text-xs">
                  Learn {rec.skill}
                </p>
                <p className="text-text-sec text-[10px] sm:text-xs mt-0.5 leading-relaxed">
                  {rec.action}
                </p>
                {rec.resource && (
                  <span className="text-[9px] text-primary-blue mt-1.5 inline-block font-semibold">
                    Resource: {rec.resource}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
