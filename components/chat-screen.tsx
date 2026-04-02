"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertTriangle, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import { cn } from "@/lib/utils";
import { Streamdown } from "streamdown";
import { mermaid } from "@streamdown/mermaid";
import { math } from "@streamdown/math";
import { cjk } from "@streamdown/cjk";

// Import KaTeX styles for math rendering
import 'katex/dist/katex.min.css';

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type VendorInfo = {
  id: string;
  createdAtISO: string;
  vendorName: string;
  vendorWebsiteUrl: string;
  materialId: string;
};

/* ── Hardcoded vendor prices (same as dashboard) ── */
const VENDOR_PRICES: Record<string, { price: number; moq: string; leadTime: string; terms: string }[]> = {
  copper: [
    { price: 9280, moq: "50 MT", leadTime: "14 days", terms: "LC 60 days" },
    { price: 9350, moq: "25 MT", leadTime: "7 days", terms: "TT Advance" },
    { price: 9190, moq: "100 MT", leadTime: "21 days", terms: "LC 90 days" },
    { price: 9440, moq: "10 MT", leadTime: "5 days", terms: "TT 30 days" },
    { price: 9310, moq: "75 MT", leadTime: "18 days", terms: "LC 45 days" },
  ],
  aluminium: [
    { price: 2240, moq: "100 MT", leadTime: "10 days", terms: "LC 30 days" },
    { price: 2310, moq: "50 MT", leadTime: "7 days", terms: "TT Advance" },
    { price: 2195, moq: "200 MT", leadTime: "28 days", terms: "LC 90 days" },
    { price: 2275, moq: "25 MT", leadTime: "5 days", terms: "TT 15 days" },
    { price: 2260, moq: "75 MT", leadTime: "14 days", terms: "LC 60 days" },
  ],
  nickel: [
    { price: 15600, moq: "20 MT", leadTime: "21 days", terms: "LC 60 days" },
    { price: 15950, moq: "10 MT", leadTime: "10 days", terms: "TT Advance" },
    { price: 15400, moq: "50 MT", leadTime: "30 days", terms: "LC 90 days" },
    { price: 16100, moq: "5 MT", leadTime: "7 days", terms: "TT 30 days" },
    { price: 15750, moq: "30 MT", leadTime: "14 days", terms: "LC 45 days" },
  ],
  zinc: [
    { price: 2700, moq: "100 MT", leadTime: "14 days", terms: "LC 60 days" },
    { price: 2770, moq: "50 MT", leadTime: "7 days", terms: "TT Advance" },
    { price: 2660, moq: "200 MT", leadTime: "25 days", terms: "LC 90 days" },
    { price: 2790, moq: "25 MT", leadTime: "5 days", terms: "TT 15 days" },
    { price: 2720, moq: "75 MT", leadTime: "14 days", terms: "LC 45 days" },
  ],
};

function getVendors(): VendorInfo[] {
  try {
    const raw = localStorage.getItem("vendorInfo.v2");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x: Partial<VendorInfo>) =>
        typeof x?.vendorName === "string" &&
        typeof x?.vendorWebsiteUrl === "string" &&
        typeof x?.materialId === "string"
    ) as VendorInfo[];
  } catch {
    return [];
  }
}

function buildVendorContext(vendors: VendorInfo[]): string {
  if (vendors.length === 0) return "";
  const lines: string[] = [];
  vendors.forEach((v, i) => {
    const prices = VENDOR_PRICES[v.materialId];
    const pd = prices?.[i % (prices?.length || 1)];
    lines.push(
      `- **${v.vendorName || "Unnamed vendor"}** | Material: ${v.materialId} | Website: ${v.vendorWebsiteUrl} | Price: $${pd?.price?.toLocaleString() ?? "N/A"}/MT | MOQ: ${pd?.moq ?? "N/A"} | Lead Time: ${pd?.leadTime ?? "N/A"} | Terms: ${pd?.terms ?? "N/A"}`
    );
  });
  return lines.join("\n");
}

function hasVendorUrl(vendors: VendorInfo[]): boolean {
  return vendors.some((v) => v.vendorWebsiteUrl && v.vendorWebsiteUrl.trim().length > 0);
}

const LOADING_MESSAGES = [
  "Thinking...",
  "Gathering information...",
  "Analyzing your question...",
  "Preparing response...",
  "Processing data...",
  "Searching knowledge base...",
];

export function ChatScreen({ className }: { className?: string }) {
  const { theme } = useTheme();
  const [convoID] = useState<string>(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [vendorList, setVendorList] = useState<VendorInfo[]>([]);

  const refreshVendors = useCallback(() => {
    setVendorList(getVendors());
  }, []);

  useEffect(() => {
    refreshVendors();
  }, [refreshVendors]);

  const hasUrl = hasVendorUrl(vendorList);

  const normalizeAssistantMessage = (text: string): string => {
    // If the backend returns escaped newlines (\"\\n\"), convert them to real line breaks
    let normalized = text.replace(/\\n/g, "\n");

    // Strip wrapping quotes if the whole message is a single quoted string
    if (normalized.startsWith('"') && normalized.endsWith('"')) {
      normalized = normalized.slice(1, -1);
    }

    return normalized;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Cycle through loading messages when loading
  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000); // Change message every second

    return () => clearInterval(interval);
  }, [loading]);

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
      const freshVendors = getVendors();
      const vendorContext = buildVendorContext(freshVendors);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_value: trimmed,
          session_id: convoID,
          vendor_context: vendorContext || undefined,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();

      const rawReplyText =
        data?.message ||
        data?.outputs?.[0]?.outputs?.[0]?.messages?.[0]?.message ||
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
    <motion.div
      className={cn(
        "relative flex h-full w-full max-w-full flex-col overflow-hidden bg-background",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Indus logo - top left */}
      <div className="absolute left-3 top-3 z-10 pl-[env(safe-area-inset-left)] pt-[env(safe-area-inset-top)] sm:left-4 sm:top-4">
        <div className="relative h-8 w-10 sm:h-9 sm:w-12">
          <Image
            src="/Indus.png"
            alt="Indus"
            fill
            className="object-contain object-left"
            priority
            sizes="(max-width: 640px) 40px, 48px"
          />
        </div>
      </div>

      {/* Theme toggle - top right */}
      <div className="absolute right-3 top-3 z-10 pr-[env(safe-area-inset-right)] pt-[env(safe-area-inset-top)] sm:right-4 sm:top-4">
        <ThemeToggle />
      </div>

      {/* Scrollable content + input bar always at bottom */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="chat-scrollable flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] pt-[max(3.5rem,calc(2.5rem+env(safe-area-inset-top)))] sm:px-4 sm:py-6">
          {messages.length === 0 && !loading ? (
            /* Centered info when no messages – chat with Indus AI Buddy, Indus AI Week */
            <div className="flex min-h-full flex-col items-center justify-center py-12 text-center">
              <motion.div
                className="mx-auto max-w-md space-y-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                  Chat with Assistant
                </h2>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Ask about procurement trends, pricing analysis, inventory forecasts, and more.
                </p>

                {/* Vendor status banner */}
                {hasUrl ? (
                  <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">
                      {vendorList.length} vendor{vendorList.length > 1 ? "s" : ""} loaded
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 text-sm">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-yellow-500" />
                    <span className="text-muted-foreground">
                      No vendor link found. Add a vendor with a website URL in the{" "}
                      <span className="font-medium text-foreground">Vendor Info</span> tab to get started.
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <motion.div
              className="mx-auto w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="flex flex-col gap-3 sm:gap-4">
                {messages.map((msg, i) => (
                  <motion.li
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[90%] rounded-2xl px-3 py-2.5 text-sm **:text-inherit sm:max-w-[85%] sm:px-4",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <div className="chat-markdown">
                          <Streamdown
                            shikiTheme={["github-dark", "github-light"]}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            {...({ plugins: { mermaid, math, cjk } } as any)}
                          >
                            {msg.content}
                          </Streamdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.li>
                ))}
              </ul>
              {loading && (
                <motion.div
                  className="flex justify-start pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="max-w-[90%] px-3 py-3 text-sm sm:max-w-[85%] sm:px-4">
                    <ShimmeringText
                      text={LOADING_MESSAGES[loadingMessageIndex]}
                      duration={1.5}
                      repeat
                      startOnView={false}
                      className="text-sm"
                    />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </div>

        {/* Input bar – always fixed at bottom, no top border */}
        <div className="shrink-0 bg-background/95 pt-3  backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-4 sm:pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto w-full px-3">
            <div className="relative flex flex-col w-full gap-2">
              <div className="relative w-full">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as unknown as React.FormEvent);
                    }
                  }}
                  placeholder={hasUrl ? "Ask anything..." : "Add a vendor link to start chatting..."}
                  rows={1}
                  disabled={isSending || !hasUrl}
                  className={cn(
                    "w-full resize-none transition-all duration-300 text-[16px]",
                    "py-2.5 px-3 pr-12 min-h-[44px] max-h-[160px] rounded-xl",
                    "sm:py-3 sm:px-4 sm:pr-14 sm:min-h-[48px] sm:max-h-[200px]",
                    "placeholder:text-muted-foreground/50",
                    "text-foreground/90 shadow-md border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                    "bg-background/80 dark:bg-muted/20",
                    isSending && "opacity-50 pointer-events-none"
                  )}
                />
                <div className="absolute right-1.5 bottom-1.5 z-10 sm:right-2 sm:bottom-2">
                  <AnimatePresence mode="wait">
                    {isSending ? (
                      <motion.div
                        key="sending"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center sm:h-9 sm:w-9"
                        aria-label="Sending"
                      >
                        <div className="h-4 w-4 animate-spin rounded-sm bg-primary" />
                      </motion.div>
                    ) : input.trim() ? (
                      <motion.div
                        key="send"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.preventDefault();
                            handleSubmit(e as unknown as React.FormEvent);
                          }}
                          disabled={isSending}
                          aria-label="Send message"
                          className="h-9 w-9 min-h-[36px] min-w-[36px] rounded-full bg-primary text-primary-foreground shadow-md sm:h-9 sm:w-9"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="inactive"
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        className="pointer-events-none flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-muted/60 sm:h-9 sm:w-9"
                      >
                        <Send className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div
                className="flex justify-center items-center gap-1.5 text-[10px] text-muted-foreground sm:text-xs py-1"
              >
                <div className="relative h-4 w-10 shrink-0 sm:h-5 sm:w-12">
                  <Image
                    src={theme === "dark" ? "/logo-white.png" : "/logo-black.png"}
                    alt="wAI"
                    fill
                    className="object-contain"
                    sizes="48px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
