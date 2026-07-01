import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle, Ban } from "lucide-react";

export default function VoiceButton({ onTranscription, onStatusChange }) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState(""); // "", "listening", "denied", "error", "unsupported"
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser compatibility for SpeechRecognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatus("unsupported");
      onStatusChange?.("Speech recognition unavailable");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("listening");
      onStatusChange?.("Listening...");
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      if (event.error === "not-allowed") {
        setStatus("denied");
        onStatusChange?.("Microphone blocked");
      } else {
        setStatus("error");
        onStatusChange?.("Speech recognition error");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Only reset the text if we're not in an error/blocked state
      setStatus(prev => {
        if (prev === "listening") {
          onStatusChange?.("");
          return "";
        }
        return prev;
      });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onTranscription(transcript);
        onStatusChange?.("");
        setStatus("");
      }
    };

    recognitionRef.current = recognition;
  }, [onTranscription, onStatusChange]);

  const toggleListening = () => {
    if (status === "unsupported") {
      onStatusChange?.("Speech recognition unavailable");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      // Clear previous error/denied states on retry
      setStatus("");
      onStatusChange?.("");
      
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setStatus("error");
        onStatusChange?.("Failed to start listening");
      }
    }
  };

  const getButtonStyles = () => {
    switch (status) {
      case "unsupported":
        return "bg-slate-900/50 text-text-sec/40 border border-border-custom/50 cursor-not-allowed opacity-50";
      case "denied":
        return "bg-error-red/10 border border-error-red/40 text-error-red hover:bg-error-red/20 shadow-md shadow-error-red/10";
      case "error":
        return "bg-warning-yellow/10 border border-warning-yellow/40 text-warning-yellow hover:bg-warning-yellow/20";
      case "listening":
        return "bg-primary-blue border border-primary-blue text-text-main shadow-lg shadow-blue-500/30 ring-4 ring-primary-blue/20";
      default:
        return "bg-slate-950 border border-border-custom hover:border-slate-800 text-text-sec hover:text-text-main hover:bg-slate-900/80";
    }
  };

  const getTitleText = () => {
    switch (status) {
      case "unsupported":
        return "Speech recognition unavailable in this browser";
      case "denied":
        return "Microphone access blocked. Click to retry (ensure permissions are allowed)";
      case "error":
        return "Speech recognition error. Click to retry";
      case "listening":
        return "Listening... Click to stop";
      default:
        return "Start Voice Input";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleListening}
        className={`p-3 rounded-lg transition-all duration-300 relative flex items-center justify-center cursor-pointer ${getButtonStyles()}`}
        title={getTitleText()}
      >
        {/* Glowing pulse ring if listening */}
        {status === "listening" && (
          <span className="absolute inset-0 rounded-lg bg-primary-blue/30 animate-ping opacity-75"></span>
        )}

        {status === "unsupported" ? (
          <MicOff className="w-5 h-5" />
        ) : status === "denied" ? (
          <Ban className="w-5 h-5" />
        ) : status === "error" ? (
          <AlertCircle className="w-5 h-5" />
        ) : status === "listening" ? (
          <Mic className="w-5 h-5 animate-pulse" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
