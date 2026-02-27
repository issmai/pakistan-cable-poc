"use client";

import { useView } from "@/components/view-context";
import { Bot, Sparkles } from "lucide-react";

export function FloatingAgentButton() {
    const { isAgentOpen, setIsAgentOpen } = useView();

    // Don't show the button if the modal is already open
    if (isAgentOpen) return null;

    return (
        <button
            onClick={() => setIsAgentOpen(true)}
            title="Open AI Agent"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center p-4 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group cursor-pointer"
        >
            <Bot className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            <Sparkles className="w-3 h-3 absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-yellow-300" />
        </button>
    );
}
