import React, { useEffect, useRef } from "react";
import UserMessage from "./UserMessage";
import AIMessage from "./AIMessage";
import { Bot } from "lucide-react";

export default function AIChat({ history, loading, onJobClick, sendMessage }) {
  const bottomRef = useRef(null);

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
            sendMessage={sendMessage}
          />
        );
      })}

      {/* Autonomous Typing Indicator */}
      {loading && (
        <div className="flex gap-3 w-full items-start justify-start">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-900/60 to-indigo-900/60 border border-primary-blue/30 text-primary-blue shrink-0 shadow-xs">
            <Bot className="w-4.5 h-4.5 animate-pulse" />
          </div>
          <div className="bg-blue-950/20 border border-primary-blue/15 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-xs flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-primary-blue">Scout is working...</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary-blue/60 rounded-full animate-bounce [animation-delay:0.1s]"></span>
              <span className="w-1.5 h-1.5 bg-primary-blue/60 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-primary-blue/60 rounded-full animate-bounce [animation-delay:0.3s]"></span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
