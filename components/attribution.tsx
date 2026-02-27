"use client";

import Image from "next/image";
import { useTheme } from "@/components/theme-provider";

export function Attribution() {
  const { theme } = useTheme();
  const waiLogoSrc = theme === "dark" ? "/logo-white.png" : "/logo-black.png";

  return (
    <div
      className="fixed bottom-4 right-4 z-20 flex items-center gap-1.5 text-[10px] text-foreground sm:bottom-6 sm:right-6 sm:gap-2 sm:text-xs"
    >
      <div className="relative h-5 w-12 shrink-0">
        <Image
          src={waiLogoSrc}
          alt="wAI"
          fill
          className="object-contain object-right"
          sizes="48px"
        />
      </div>
    </div>
  );
}
