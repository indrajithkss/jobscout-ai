import React from "react";
import JobRecommendationCard from "./JobRecommendationCard";
import SkillGapCard from "./SkillGapCard";
import AgentActionCard from "./AgentActionCard";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import { Sparkles, HelpCircle, Bot } from "lucide-react";

// Simple markdown formatter to translate headings, bolding, and bullet points
function parseMarkdown(text) {
  if (!text) return "";
  
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    // Header 3
    if (line.startsWith("### ")) {
      return (
        <h4 key={idx} className="text-xs sm:text-sm font-bold text-text-main mt-4 mb-1.5 first:mt-0">
          {line.replace("### ", "")}
        </h4>
      );
    }
    // Bullet item
    if (line.startsWith("- ") || line.startsWith("* ")) {
      return (
        <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-text-sec mt-1 leading-relaxed">
          {formatInline(line.substring(2))}
        </li>
      );
    }
    return (
      <p key={idx} className="text-xs sm:text-sm text-text-sec leading-relaxed mt-1.5 first:mt-0">
        {formatInline(line)}
      </p>
    );
  });
}

function formatInline(text) {
  // Support bold text **bold**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-text-main font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function AIMessage({ message, onJobClick, sendMessage }) {
  const renderSpecialDataCard = () => {
    if (!message.data) return null;

    switch (message.type) {
      case "job-recommendation":
        return (
          <JobRecommendationCard 
            jobs={message.data.jobs} 
            onJobClick={onJobClick} 
          />
        );
      
      case "skill-gap":
        return <SkillGapCard data={message.data} />;

      case "job-analysis":
        const analysis = message.data;
        return (
          <Card className="mt-3 p-4 bg-slate-900 border border-border-custom space-y-3.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between border-b border-border-custom/50 pb-2">
              <div>
                <h4 className="font-bold text-text-main text-xs sm:text-sm">{analysis.title}</h4>
                <p className="text-text-sec text-[10px] sm:text-xs mt-0.5">{analysis.company}</p>
              </div>
              <Badge score={analysis.matchScore} className="scale-90 origin-right" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="space-y-0.5">
                <p className="font-semibold text-text-main">Salary Potential</p>
                <p className="text-text-sec">{analysis.salaryPotential}</p>
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-text-main">Career Impact</p>
                <p className="text-text-sec leading-relaxed">{analysis.careerImpact}</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border-custom/50">
              <p className="font-semibold text-text-main text-xs">Copilot Recommendation</p>
              <p className="text-text-sec text-xs leading-relaxed">{analysis.recommendation}</p>
            </div>
          </Card>
        );

      case "interview-prep":
        const { questions } = message.data;
        return (
          <div className="mt-3 space-y-3 w-full">
            {questions.map((q) => (
              <Card key={q.id} className="p-3.5 bg-slate-900 border border-border-custom text-xs sm:text-sm space-y-2">
                <p className="font-semibold text-text-main flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-primary-blue shrink-0 mt-0.5" />
                  <span>{q.question}</span>
                </p>
                <p className="text-text-sec pl-6 leading-relaxed bg-slate-950/45 p-2 rounded-lg border border-border-custom/30 text-[11px] sm:text-xs">
                  {q.answer}
                </p>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const isAgent = message.isAgent;

  return (
    <div className="flex gap-3 w-full items-start justify-start animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Bot Icon */}
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg border shrink-0 shadow-xs ${
        isAgent
          ? "bg-gradient-to-br from-blue-900/60 to-indigo-900/60 border-primary-blue/30 text-primary-blue"
          : "bg-slate-900 border-border-custom text-primary-blue"
      }`}>
        {isAgent ? <Bot className="w-4.5 h-4.5" /> : <Sparkles className="w-4.5 h-4.5" />}
      </div>

      <div className="flex-1 min-w-0 max-w-[90%] sm:max-w-[85%] space-y-1">
        {/* Main message text */}
        <div className={`border px-4 py-3 rounded-2xl rounded-tl-none text-text-main shadow-xs ${
          isAgent
            ? "bg-blue-950/20 border-primary-blue/15"
            : "bg-slate-900/40 border-border-custom/40"
        }`}>
          {parseMarkdown(message.text)}
          {/* Legacy rich cards */}
          {renderSpecialDataCard()}
          {/* Agent action cards */}
          {message.actions && message.actions.length > 0 && (
            <div className="space-y-2 mt-1">
              {message.actions.map((action, idx) => (
                <AgentActionCard key={idx} action={action} sendMessage={sendMessage} />
              ))}
            </div>
          )}
          
          {/* Suggested Next Actions inside the bubble */}
          {message.suggestedActions && message.suggestedActions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border-custom/20">
              <span className="text-[9px] text-text-sec uppercase tracking-wider font-bold w-full block mb-1">
                Suggested Next Actions
              </span>
              {message.suggestedActions.map((action, aIdx) => (
                <button
                  key={aIdx}
                  type="button"
                  onClick={() => sendMessage(action)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-border-custom hover:border-primary-blue/30 text-[10px] text-text-sec hover:text-text-main transition-all cursor-pointer font-medium"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <span className="text-[9px] text-text-sec mt-1 px-1 inline-block">
          {isAgent ? "Scout Agent" : "AI Career Copilot"}
        </span>
      </div>
    </div>
  );
}
