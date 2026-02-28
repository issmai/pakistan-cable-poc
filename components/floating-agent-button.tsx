"use client";

import { useView } from "@/components/view-context";
import { Bot, X, Sparkles } from "lucide-react";

export function FloatingAgentButton() {
    const { isAgentOpen, setIsAgentOpen } = useView();

    return (
        <button
            onClick={() => setIsAgentOpen(!isAgentOpen)}
            title={isAgentOpen ? "Close AI Agent" : "Open AI Agent"}
            className="fixed bottom-6 right-6 z-[110] flex items-center justify-center p-4 rounded-full bg-linear-to-tr from-blue-500 to-emerald-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer"
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
                <Sparkles className="w-3 h-3 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-yellow-300" />
            )}
        </button>
    );
}
