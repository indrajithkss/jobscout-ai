import React from "react";

export default function PromptChips({ onChipClick }) {
  const prompts = [
    "Find React jobs in Bangalore",
    "Show remote MERN jobs",
    "Prepare me for interviews",
    "What skills do I need to learn?",
    "Find fresher opportunities"
  ];

  return (
    <div className="flex flex-wrap gap-2 py-2">
      {prompts.map((prompt, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChipClick(prompt)}
          className="px-3 py-1.5 rounded-full bg-slate-900 border border-border-custom hover:border-slate-700 text-[10px] sm:text-xs text-text-sec hover:text-text-main cursor-pointer transition-all duration-150"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
