"use client";

import Image from "next/image";

export default function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-border/70 bg-[rgb(15_23_38/82%)] px-6 backdrop-blur-xl">
            <div className="flex h-full items-center">
                <div className="flex h-10 items-center bg-[rgb(15_23_38/82%)]">
                    <Image
                        src="/alara-logo.png"
                        alt="Alara"
                        width={120}
                        height={40}
                        className="block h-8 w-auto object-contain"
                        priority
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-linear-to-tr from-blue-400 to-indigo-500 text-xs font-bold text-[--primary-foreground] shadow-lg shadow-blue-950/30">
                    JD
                </div>
            </div>
        </header>
    );
}
