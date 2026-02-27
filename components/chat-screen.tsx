"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import { cn } from "@/lib/utils";
import axios from "axios";
import { AGENT_KEY, API_URL_QUERY } from "@/config/api-routes";
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

    console.log("AGENT_KEY---->", AGENT_KEY);

    try {
      const response = await axios.post(
        API_URL_QUERY.SEND_QUERY,
        {
          output_type: "chat",
          input_type: "chat",
          input_value: trimmed,
          session_id: convoID,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": AGENT_KEY,
          },
        }
      );

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
                className="mx-auto max-w-lg space-y-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
                  Chat with Indus AI Buddy
                </h2>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Ask anything — get answers about Pakistan&apos;s national AI platform, policies, and innovation.
                </p>
                <p className="text-xs text-muted-foreground/90 sm:text-sm">
                  Get to know about Indus AI Week, events, talent, and more. Start by typing a message below.
                </p>
                <a
                  href="https://indusai.gov.pk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  indusai.gov.pk
                </a>
              </motion.div>
            </div>
          ) : (
            <motion.div
              className="mx-auto w-full max-w-3xl"
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
          <div className="mx-auto w-full max-w-3xl sm:max-w-4xl px-3">
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
                  placeholder="Ask anything..."
                  rows={1}
                  disabled={isSending}
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
                        <div className="h-4 w-4 animate-spin bg-[#e82baf] rounded-sm" />
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
                          className="h-9 w-9 min-h-[36px] min-w-[36px] rounded-full bg-primary shadow-md sm:h-9 sm:w-9 [&_svg]:text-[#e82baf]!"
                        >
                          <Send className="h-4 w-4 text-[#e82baf]" />
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="inactive"
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-muted/50 pointer-events-none sm:h-9 sm:w-9"
                      >
                        <Send className="h-4 w-4 text-[#e82baf]" />
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
