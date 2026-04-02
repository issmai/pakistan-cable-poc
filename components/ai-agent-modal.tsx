"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Cable } from "lucide-react";
import { useView } from "@/components/view-context";
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
          className="fixed right-6 bottom-24 z-100 flex h-[680px] w-[460px] max-h-[calc(100vh-7rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card shadow-[0_18px_55px_rgba(0,0,0,0.55)]"
        >
          <div className="relative shrink-0">
            <div
              className="h-0.5 w-full"
              style={{
                background: `linear-gradient(90deg, var(--color-primary), var(--color-chart-2), var(--color-primary-hover))`,
              }}
            />
            <div className="flex items-center justify-between bg-[var(--color-bg)]/90 px-4 py-3 backdrop-blur-sm sm:px-5">
              <div className="flex items-center gap-3">
                <div
                  className="relative flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-border"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 20%, transparent), color-mix(in srgb, var(--color-chart-2) 20%, transparent))",
                  }}
                >
                  <Cable className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[length:var(--text-base)] font-semibold text-[var(--color-text-strong)]">
                    Assistant
                  </span>
                  <span className="flex items-center gap-1 text-[length:var(--text-2xs)] text-[var(--color-success)]">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
                    Online
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAgentOpen(false)}
                className="cursor-pointer rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-muted)] transition-all duration-200 hover:bg-[var(--color-surface-border)] hover:text-[var(--color-text-strong)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="chat-scrollable flex-1 overflow-y-auto overflow-x-hidden bg-card px-4 py-4 sm:px-5 sm:py-5">
            {messages.length === 0 && !loading ? (
              <div className="flex h-full flex-col items-center justify-center gap-[var(--space-24)] px-2 text-center sm:px-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 20%, transparent), color-mix(in srgb, var(--color-chart-2) 20%, transparent))",
                  }}
                >
                  <Sparkles className="h-8 w-8 text-primary/80" />
                </div>
                <div>
                  <p className="text-[length:var(--text-lead)] font-semibold text-[var(--color-text-strong)]">
                    Assistant
                  </p>
                  <p className="mt-2 max-w-[320px] text-[length:var(--text-base)] leading-relaxed text-[var(--color-text-muted)]">
                    Ask about procurement trends, pricing analysis, inventory forecasts, and more.
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                  {["Copper price trend", "Order timing", "Inventory forecast"].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setInput(s);
                        inputRef.current?.focus();
                      }}
                      className="cursor-pointer rounded-full border border-border px-3.5 py-1.5 text-[length:var(--text-sm)] text-[var(--color-text-muted)] transition-all duration-200 hover:border-primary/40 hover:bg-[var(--overlay-primary-05)] hover:text-[var(--color-primary)]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {msg.role === "user" ? (
                      <div
                        className="max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2 text-[length:var(--text-sm)] leading-relaxed text-primary-foreground shadow-[var(--shadow-primary-hover)]"
                        style={{
                          background: `linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))`,
                        }}
                      >
                        {msg.content}
                      </div>
                    ) : (
                      <div className="flex w-full gap-4">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-[var(--color-bg)]">
                          <Cable className="h-3 w-3 text-primary" />
                        </div>
                        <div className="chat-prose min-w-0 flex-1 text-card-foreground">
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
                    className="flex gap-4"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-[var(--color-bg)]">
                      <Cable className="h-3 w-3 animate-pulse text-primary" />
                    </div>
                    <div className="px-1 py-2 text-[length:var(--text-sm)]">
                      <ShimmeringText
                        text={LOADING_MESSAGES[loadingMessageIndex]}
                        duration={1.5}
                        repeat
                        startOnView={false}
                        className="text-[length:var(--text-sm)] text-muted-foreground"
                      />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-border bg-[var(--color-bg)] px-3 py-3 sm:px-4 sm:py-4">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 rounded-[var(--radius-xl)] border border-border bg-card px-2.5 py-2 transition-colors duration-200 focus-within:border-[color-mix(in_srgb,var(--color-primary)_45%,transparent)] focus-within:shadow-[var(--shadow-focus)] sm:px-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                disabled={isSending}
                className={cn(
                  "flex-1 bg-transparent text-[length:var(--text-base)] text-[var(--color-text-strong)] outline-none placeholder:text-[var(--color-placeholder)]",
                  isSending && "pointer-events-none opacity-50"
                )}
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className={cn(
                  "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] transition-all duration-200",
                  input.trim() && !isSending
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-primary-hover)] hover:bg-[var(--color-primary-hover)]"
                    : "cursor-not-allowed text-[var(--color-text-muted)]/50"
                )}
              >
                {isSending ? (
                  <div
                    className="h-3.5 w-3.5 animate-spin rounded-sm border-2 border-[var(--color-spinner-border)] border-t-[var(--color-text-strong)]"
                  />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
