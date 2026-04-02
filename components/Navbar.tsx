"use client";

import Image from "next/image";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border bg-[color-mix(in_srgb,var(--color-surface-raised)_92%,transparent)] px-[var(--space-30)] backdrop-blur-xl">
      <div className="flex h-full items-center">
        <div className="flex h-10 items-center">
          <Image
            src="/wAI-industries.png"
            alt="Alara"
            width={200}
            height={60}
            className="block h-8 w-auto object-contain"
            priority
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-xs font-bold text-white shadow-md"
          style={{ background: "var(--gradient-avatar)" }}
        >
          JD
        </div>
      </div>
    </header>
  );
}
