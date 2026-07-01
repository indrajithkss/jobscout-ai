import React from "react";

export default function UserMessage({ message }) {
  return (
    <div className="flex flex-col items-end w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Right aligned user chat bubble */}
      <div className="max-w-[85%] sm:max-w-[75%] bg-primary-blue text-text-main px-4 py-2.5 rounded-2xl rounded-tr-none shadow-md shadow-blue-900/10 text-xs sm:text-sm">
        <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
      </div>
      <span className="text-[9px] text-text-sec mt-1 px-1">
        You
      </span>
    </div>
  );
}
