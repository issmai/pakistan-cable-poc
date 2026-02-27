"use client";

export default function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-zinc-900 border-b border-zinc-800 z-50 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold bg-linear-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Chatbot UI
                </h1>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                    JD
                </div>
            </div>
        </header>
    );
}
