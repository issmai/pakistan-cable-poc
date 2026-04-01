"use client";

import { useView } from "@/components/view-context";
import { Bot, X, Sparkles } from "lucide-react";

export function FloatingAgentButton() {
    const { isAgentOpen, setIsAgentOpen } = useView();

    return (
        <button
            onClick={() => setIsAgentOpen(!isAgentOpen)}
            title={isAgentOpen ? "Close AI Agent" : "Open AI Agent"}
            className="fixed bottom-6 right-6 z-110 group flex cursor-pointer items-center justify-center rounded-full border border-border/80 bg-linear-to-tr from-primary to-[#8f9fff] p-4 text-primary-foreground shadow-xl shadow-blue-950/35 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
        >
            <div className="relative w-6 h-6">
                {/* Bot icon — visible when chat is closed */}
                <Bot
                    className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${isAgentOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                        }`}
                />
                {/* X icon — visible when chat is open */}
                <X
                    className={`w-6 h-6 absolute inset-0 transition-all duration-300 ${isAgentOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
                        }`}
                />
            </div>
            {!isAgentOpen && (
                <Sparkles className="absolute top-3 right-3 h-3 w-3 text-[--warning] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            )}
        </button>
    );
}
