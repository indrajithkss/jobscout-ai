import React, { useEffect, useRef } from "react";
import UserMessage from "./UserMessage";
import AIMessage from "./AIMessage";
import { Sparkles } from "lucide-react";

export default function AIChat({ history, loading, onJobClick }) {
  const bottomRef = useRef(null);

  // Auto-scroll to the newest message block when list updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
      {history.map((msg) => {
        if (msg.sender === "user") {
          return <UserMessage key={msg.id} message={msg} />;
        }
        return (
          <AIMessage 
            key={msg.id} 
            message={msg} 
            onJobClick={onJobClick}
          />
        );
      })}

      {/* Simulated Typing Indicator load bubbles */}
      {loading && (
        <div className="flex gap-3 w-full items-start justify-start">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-border-custom text-primary-blue shrink-0 shadow-xs">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div className="bg-slate-900/40 border border-border-custom/40 px-4 py-2.5 rounded-2xl rounded-tl-none text-text-sec shadow-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-text-sec rounded-full animate-bounce [animation-delay:0.1s]"></span>
            <span className="w-1.5 h-1.5 bg-text-sec rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-text-sec rounded-full animate-bounce [animation-delay:0.3s]"></span>
          </div>
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
