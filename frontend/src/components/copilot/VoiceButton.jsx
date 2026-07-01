import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";

export default function VoiceButton({ onTranscription, onStatusChange }) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState(""); // listening, denied, error, unsupported
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
      onStatusChange?.("");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        onTranscription(transcript);
        onStatusChange?.("");
      }
    };

    recognitionRef.current = recognition;
  }, [onTranscription, onStatusChange]);

  const toggleListening = () => {
    if (status === "unsupported") return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const getButtonStyles = () => {
    if (status === "unsupported") return "opacity-45 cursor-not-allowed bg-slate-900/50 text-text-sec border border-border-custom";
    if (status === "denied") return "bg-error-red/10 border border-error-red/35 text-error-red";
    if (isListening) return "bg-primary-blue text-text-main animate-pulse border border-primary-blue shadow-lg shadow-blue-500/25";
    return "bg-slate-900 border border-border-custom hover:border-slate-800 text-text-sec hover:text-text-main hover:bg-slate-800/80";
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-2.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center ${getButtonStyles()}`}
      title={
        status === "unsupported"
          ? "Speech Recognition not supported in this browser"
          : status === "denied"
          ? "Microphone access blocked"
          : isListening
          ? "Stop Listening"
          : "Start Dictation"
      }
    >
      {status === "denied" || status === "error" ? (
        <AlertCircle className="w-5 h-5 animate-pulse" />
      ) : isListening ? (
        <Mic className="w-5 h-5 text-text-main" />
      ) : (
        <MicOff className="w-5 h-5" />
      )}
    </button>
  );
}
