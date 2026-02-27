"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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

        // Fix markdown tables: remove blank lines between table rows
        // A table row is any line starting with |
        // Markdown tables break if there are blank lines between rows
        const lines = normalized.split("\n");
        const result: string[] = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Skip blank lines that sit between two table rows
            if (trimmed === "") {
                const prevIsTable = result.length > 0 && result[result.length - 1].trim().startsWith("|");
                // Look ahead for next non-empty line
                let nextTableLine = false;
                for (let j = i + 1; j < lines.length; j++) {
                    const nextTrimmed = lines[j].trim();
                    if (nextTrimmed === "") continue;
                    nextTableLine = nextTrimmed.startsWith("|") || nextTrimmed.startsWith("|-");
                    break;
                }
                if (prevIsTable && nextTableLine) {
                    continue; // skip this blank line
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
                    className="fixed bottom-24 right-6 z-[100] flex flex-col w-[400px] h-[520px] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
                >
                    {/* ── Header ── */}
                    <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="relative h-6 w-8">
                                <Image
                                    src="/Indus.png"
                                    alt="Indus"
                                    fill
                                    className="object-contain brightness-0 invert"
                                    sizes="32px"
                                />
                            </div>
                            <span className="text-sm font-semibold tracking-wide">Indus AI Buddy</span>
                        </div>
                        <button
                            onClick={() => setIsAgentOpen(false)}
                            className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* ── Messages area ── */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-3 chat-scrollable">
                        {messages.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <p className="text-sm font-medium text-foreground">
                                    Chat with Indus AI Buddy
                                </p>
                                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                    Ask anything — get answers about Pakistan&apos;s national AI platform, policies, and innovation.
                                </p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex",
                                            msg.role === "user" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {msg.role === "user" ? (
                                            <div className="max-w-[85%] rounded-xl rounded-br-sm bg-blue-600 text-white px-3 py-2 text-[13px] leading-relaxed">
                                                {msg.content}
                                            </div>
                                        ) : (
                                            <div className="w-full chat-prose">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[85%] px-3 py-2 text-[13px]">
                                            <ShimmeringText
                                                text={LOADING_MESSAGES[loadingMessageIndex]}
                                                duration={1.5}
                                                repeat
                                                startOnView={false}
                                                className="text-[13px]"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* ── Input bar ── */}
                    <form
                        onSubmit={handleSubmit}
                        className="shrink-0 flex items-center gap-2 px-3 py-2.5 border-t border-border bg-background"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            disabled={isSending}
                            className={cn(
                                "flex-1 text-[13px] bg-muted/40 rounded-lg px-3 py-2 outline-none border border-border/50 placeholder:text-muted-foreground/50 text-foreground",
                                "focus:border-blue-500/50 transition-colors",
                                isSending && "opacity-50 pointer-events-none"
                            )}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isSending}
                            className={cn(
                                "shrink-0 flex items-center justify-center px-4 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer",
                                input.trim() && !isSending
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                            )}
                        >
                            {isSending ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-sm bg-white/70" />
                            ) : (
                                "Send"
                            )}
                        </button>
                    </form>

                    {/* ── Powered by ── */}
                    <div className="flex justify-center items-center gap-1 py-1 bg-background border-t border-border/30">
                        <div className="relative h-3.5 w-8 shrink-0">
                            <Image
                                src={theme === "dark" ? "/logo-white.png" : "/logo-black.png"}
                                alt="wAI"
                                fill
                                className="object-contain"
                                sizes="32px"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
