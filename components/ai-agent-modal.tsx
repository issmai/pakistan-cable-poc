"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Cable } from "lucide-react";
import Image from "next/image";
import { useView } from "@/components/view-context";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

const LOADING_MESSAGES = [
    "Thinking...",
    "Gathering information...",
    "Analyzing your question...",
    "Preparing response...",
    "Processing data...",
    "Searching knowledge base...",
];

export function AiAgentModal() {
    const { isAgentOpen, setIsAgentOpen } = useView();
    const { theme } = useTheme();
    const [convoID] = useState<string>(() => crypto.randomUUID());
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const normalizeAssistantMessage = (text: string): string => {
        let normalized = text.replace(/\\n/g, "\n");
        if (normalized.startsWith('"') && normalized.endsWith('"')) {
            normalized = normalized.slice(1, -1);
        }

        const lines = normalized.split("\n");
        const result: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (trimmed === "") {
                const prevIsTable = result.length > 0 && result[result.length - 1].trim().startsWith("|");
                let nextTableLine = false;
                for (let j = i + 1; j < lines.length; j++) {
                    const nextTrimmed = lines[j].trim();
                    if (nextTrimmed === "") continue;
                    nextTableLine = nextTrimmed.startsWith("|") || nextTrimmed.startsWith("|-");
                    break;
                }
                if (prevIsTable && nextTableLine) {
                    continue;
                }
            }
            result.push(line);
        }
        return result.join("\n");
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    useEffect(() => {
        if (!loading) {
            setLoadingMessageIndex(0);
            return;
        }
        const interval = setInterval(() => {
            setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        if (isAgentOpen) {
            setTimeout(() => inputRef.current?.focus(), 350);
        }
    }, [isAgentOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || isSending) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: trimmed,
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsSending(true);
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input_value: trimmed,
                    session_id: convoID,
                }),
            });

            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const response = { data: await res.json() };

            const rawReplyText =
                response.data?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message ||
                "Sorry, I am unable to process your request.";

            const replyText = normalizeAssistantMessage(rawReplyText);

            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: replyText,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "Sorry, I am unable to process your request.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
            setIsSending(false);
        }
    };

    return (
        <AnimatePresence>
            {isAgentOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 350 }}
                    className="fixed bottom-24 right-6 z-[100] flex flex-col w-[400px] h-[520px] rounded-2xl border border-zinc-700/40 bg-zinc-900 shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    {/* ── Header with gradient accent line ── */}
                    <div className="relative shrink-0">
                        {/* Top accent gradient bar */}
                        <div className="h-[2px] w-full bg-linear-to-r from-blue-500 via-emerald-400 to-teal-500" />
                        <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/80 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                {/* Avatar icon */}
                                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-blue-500/20 to-emerald-500/20 border border-zinc-700/50">
                                    <Cable className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[13px] font-semibold text-zinc-100">Pakistan Cable Chatbot</span>
                                    <span className="text-[10px] text-emerald-400/80 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Online
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAgentOpen(false)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/60 transition-all duration-200 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* ── Messages area ── */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4 chat-scrollable bg-zinc-900/95">
                        {messages.length === 0 && !loading ? (
                            /* Empty state */
                            <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500/15 to-emerald-500/15 border border-zinc-700/40 flex items-center justify-center">
                                    <Sparkles className="w-7 h-7 text-emerald-400/70" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-zinc-200">
                                        Pakistan Cable Chatbot
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-[260px]">
                                        Ask about procurement trends, pricing analysis, inventory forecasts, and more.
                                    </p>
                                </div>
                                {/* Suggestion chips */}
                                <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                                    {["Copper price trend", "Order timing", "Inventory forecast"].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => {
                                                setInput(s);
                                                inputRef.current?.focus();
                                            }}
                                            className="px-3 py-1.5 text-[11px] rounded-full border border-zinc-700/50 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-200 cursor-pointer"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25, delay: i * 0.03 }}
                                        className={cn(
                                            "flex",
                                            msg.role === "user" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {msg.role === "user" ? (
                                            <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-linear-to-r from-blue-600 to-emerald-600 text-white px-3.5 py-2.5 text-[13px] leading-relaxed shadow-lg shadow-emerald-900/10">
                                                {msg.content}
                                            </div>
                                        ) : (
                                            <div className="flex gap-2.5 w-full">
                                                {/* Bot avatar */}
                                                <div className="shrink-0 w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700/50 flex items-center justify-center mt-0.5">
                                                    <Cable className="w-3 h-3 text-emerald-400" />
                                                </div>
                                                <div className="flex-1 min-w-0 chat-prose text-zinc-300">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            table: ({ children }) => (
                                                                <div className="chat-table-wrap">
                                                                    <table>{children}</table>
                                                                </div>
                                                            ),
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {loading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-2.5"
                                    >
                                        <div className="shrink-0 w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700/50 flex items-center justify-center mt-0.5">
                                            <Cable className="w-3 h-3 text-emerald-400 animate-pulse" />
                                        </div>
                                        <div className="px-1 py-2 text-[13px]">
                                            <ShimmeringText
                                                text={LOADING_MESSAGES[loadingMessageIndex]}
                                                duration={1.5}
                                                repeat
                                                startOnView={false}
                                                className="text-[13px] text-zinc-400"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* ── Input bar ── */}
                    <div className="shrink-0 px-3 py-3 bg-zinc-900 border-t border-zinc-800/60">
                        <form
                            onSubmit={handleSubmit}
                            className="flex items-center gap-2 bg-zinc-800/60 rounded-xl border border-zinc-700/40 px-3 py-1.5 focus-within:border-emerald-500/30 transition-colors duration-200"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask anything..."
                                disabled={isSending}
                                className={cn(
                                    "flex-1 text-[13px] bg-transparent outline-none placeholder:text-zinc-500 text-zinc-200",
                                    isSending && "opacity-50 pointer-events-none"
                                )}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isSending}
                                className={cn(
                                    "shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer",
                                    input.trim() && !isSending
                                        ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
                                        : "text-zinc-600 cursor-not-allowed"
                                )}
                            >
                                {isSending ? (
                                    <div className="h-3.5 w-3.5 animate-spin rounded-sm bg-white/70" />
                                ) : (
                                    <Send className="w-3.5 h-3.5" />
                                )}
                            </button>
                        </form>
                    </div>

                    {/* ── Powered by ── */}
                    <div className="flex justify-center items-center gap-1.5 py-1.5 bg-zinc-900/80 border-t border-zinc-800/30">
                        <span className="text-[9px] text-zinc-600">Powered by</span>
                        <div className="relative h-3 w-7 shrink-0">
                            <Image
                                src={theme === "dark" ? "/logo-white.png" : "/logo-black.png"}
                                alt="wAI"
                                fill
                                className="object-contain opacity-40"
                                sizes="28px"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
