"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Hyperspeed from "@/components/Hyperspeed";
import { Attribution } from "./attribution";

const HYPERTUNNEL_BASE = {
    distortion: "turbulentDistortion",
    length: 400,
    roadWidth: 10,
    islandWidth: 2,
    lanesPerRoad: 3,
    fov: 90,
    fovSpeedUp: 150,
    speedUp: 2,
    carLightsFade: 0.4,
    totalSideLightSticks: 20,
    lightPairsPerRoadWay: 40,
    shoulderLinesWidthPercentage: 0.05,
    brokenLinesWidthPercentage: 0.1,
    brokenLinesLengthPercentage: 0.5,
    lightStickWidth: [0.12, 0.5] as [number, number],
    lightStickHeight: [1.3, 1.7] as [number, number],
    movingAwaySpeed: [60, 80] as [number, number],
    movingCloserSpeed: [-120, -160] as [number, number],
    carLightsLength: [12, 80] as [number, number],
    carLightsRadius: [0.05, 0.14] as [number, number],
    carWidthPercentage: [0.3, 0.5] as [number, number],
    carShiftX: [-0.8, 0.8] as [number, number],
    carFloorSeparation: [0, 5] as [number, number],
    roadOpacity: 0,
};

/** Spectrum: #150029 (accent), #e82baf (pink) – road black in dark */
const SPECTRUM = {
    accent: 0x150029,    // #150029 – used in place of orange
    pink: 0xe82baf,     // #e82baf – magenta
} as const;

const HYPERTUNNEL_COLORS_DARK = {
    roadColor: 0,
    islandColor: SPECTRUM.accent,
    background: 0,
    shoulderLines: SPECTRUM.pink,
    brokenLines: SPECTRUM.accent,
    leftCars: [SPECTRUM.pink, SPECTRUM.accent, (SPECTRUM.pink + SPECTRUM.accent) >> 1],
    rightCars: [SPECTRUM.accent, SPECTRUM.pink, (SPECTRUM.accent + SPECTRUM.pink) >> 1],
    sticks: SPECTRUM.pink,
};

const HYPERTUNNEL_COLORS_LIGHT = {
    roadColor: 16777215,
    islandColor: 16119285,
    background: 16777215,
    shoulderLines: SPECTRUM.pink,
    brokenLines: SPECTRUM.accent,
    leftCars: [SPECTRUM.pink, SPECTRUM.accent, (SPECTRUM.pink + SPECTRUM.accent) >> 1],
    rightCars: [SPECTRUM.accent, SPECTRUM.pink, (SPECTRUM.accent + SPECTRUM.pink) >> 1],
    sticks: SPECTRUM.pink,
};

const container = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.18,
            delayChildren: 0.25,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
};

const logoItem = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
};

export function SplashScreen({
    onContinue,
    className,
}: {
    onContinue: () => void;
    className?: string;
}) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const effectOptions = {
        ...HYPERTUNNEL_BASE,
        colors: isDark ? HYPERTUNNEL_COLORS_DARK : HYPERTUNNEL_COLORS_LIGHT,
    };

    return (
        <motion.div
            className={cn(
                "relative flex h-full w-full max-w-full flex-col items-center justify-center overflow-hidden",
                className
            )}
            initial="hidden"
            animate="visible"
            variants={container}
        >
            {/* Hyperspeed tunnel background - full opacity, no overlay */}
            <div className="absolute inset-0 z-0">
                <Hyperspeed effectOptions={effectOptions} key={theme} />
            </div>

            {/* Theme toggle */}
            <motion.div
                className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6"
                variants={item}
            >
                <ThemeToggle />
            </motion.div>

            {/* Main content - card for readability in both light and dark */}
            <div className="relative z-10 flex flex-col items-center rounded-3xl  px-6 py-10 mb-45   sm:px-10 sm:py-12">
                {/* Logo with subtle container */}
                <motion.div
                    className="relative flex shrink-0 items-center justify-center"
                    variants={logoItem}
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <div className="relative h-24 w-32 sm:h-28 sm:w-36">
                        <div className="absolute -inset-4 rounded-3xl bg-linear-to-b from-muted/30 to-transparent blur-2xl" />
                        <Image
                            src="/Indus.png"
                            alt="Indus"
                            fill
                            className="relative object-contain drop-shadow-sm"
                            priority
                            sizes="(max-width: 640px) 128px, 144px"
                        />
                    </div>
                </motion.div>

                {/* Elegant divider */}
                <motion.div
                    className="my-8 h-px w-16 bg-linear-to-r from-transparent via-border to-transparent sm:my-10 sm:w-24"
                    variants={item}
                />

                {/* Title */}
                <motion.h1
                    className="text-center font-semibold tracking-tight text-foreground"
                    variants={item}
                >
                    <span className="block text-[2.25rem] leading-tight sm:text-5xl lg:text-[3.25rem]">
                        Indus AI Buddy
                    </span>
                </motion.h1>
                <motion.p
                    className="mt-3 max-w-xs text-center text-sm font-normal tracking-wide text-muted-foreground sm:mt-4 sm:text-base"
                    variants={item}
                >
                    Your intelligent assistant, reimagined
                </motion.p>

                {/* CTA - works in both themes */}
                <motion.div className="mt-12 sm:mt-14" variants={item}>
                    <motion.button
                        onClick={onContinue}
                        className="group flex items-center gap-2.5 rounded-full border border-foreground/20 bg-foreground px-8 py-3.5 text-sm font-medium text-background shadow-lg transition-all duration-300 hover:gap-3.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-10 sm:py-4 sm:text-base dark:border-white/20 dark:bg-white dark:text-black dark:shadow-white/10 dark:hover:shadow-white/20"
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        Get started
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </motion.button>
                </motion.div>
            </div>
            <Attribution />
        </motion.div>
    );
}
