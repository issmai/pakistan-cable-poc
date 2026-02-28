"use client";

import Image from "next/image";

export default function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-zinc-900 border-b border-zinc-800 z-50 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <Image
                    src="/alara-logo.png"
                    alt="Alara"
                    width={120}
                    height={40}
                    className="invert mix-blend-lighten"
                    priority
                />
            </div>

            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                    JD
                </div>
            </div>
        </header>
    );
}
