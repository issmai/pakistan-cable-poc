"use client";

import { useView } from "@/components/view-context";
import { Bot, X, Sparkles } from "lucide-react";

export function FloatingAgentButton() {
  const { isAgentOpen, setIsAgentOpen } = useView();

  return (
    <button
      onClick={() => setIsAgentOpen(!isAgentOpen)}
      title={isAgentOpen ? "Close AI Agent" : "Open AI Agent"}
      className="group fixed bottom-6 right-6 z-110 flex cursor-pointer items-center justify-center rounded-full border border-border bg-linear-to-tr from-primary to-[var(--color-primary-hover)] p-4 text-primary-foreground shadow-[var(--shadow-primary-hover)] transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-primary-hover)]"
    >
      <div className="relative h-6 w-6">
        <Bot
          className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
            isAgentOpen ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
          }`}
        />
        <X
          className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
            isAgentOpen ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
          }`}
        />
      </div>
      {!isAgentOpen && (
        <Sparkles className="absolute top-3 right-3 h-3 w-3 text-[var(--color-warning)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
    </button>
  );
}
