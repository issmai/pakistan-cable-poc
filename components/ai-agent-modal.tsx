"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useView } from "@/components/view-context";
import { SplashScreen } from "@/components/splash-screen";
import { ChatScreen } from "@/components/chat-screen";

export function AiAgentModal() {
    const { isAgentOpen, setIsAgentOpen } = useView();
    const [showSplash, setShowSplash] = useState(true);

    // Reset to splash screen when modal is closed
    useEffect(() => {
        if (!isAgentOpen) {
            const t = setTimeout(() => setShowSplash(true), 300);
            return () => clearTimeout(t);
        }
    }, [isAgentOpen]);

    return (
        <AnimatePresence>
            {isAgentOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="relative w-full max-w-5xl h-[90vh] sm:h-[85vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header controls for modal */}
                        <div className="absolute top-4 right-4 z-110">
                            <button
                                onClick={() => setIsAgentOpen(false)}
                                className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 w-full h-full relative overflow-hidden bg-background">
                            <AnimatePresence mode="wait">
                                {showSplash ? (
                                    <motion.div
                                        key="splash"
                                        initial={{ opacity: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.35, ease: "easeInOut" }}
                                        className="absolute inset-0 w-full h-full"
                                    >
                                        <SplashScreen onContinue={() => setShowSplash(false)} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="chat"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="absolute inset-0 w-full h-full"
                                    >
                                        <ChatScreen />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
