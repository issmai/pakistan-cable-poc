"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Bot } from "lucide-react";

const menuItems = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        name: "AI Agent",
        href: "/ai-agent",
        icon: Bot,
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-zinc-900 text-white shadow-xl flex flex-col border-r border-zinc-800">
            <div className="p-6">
                <Image
                    src="/alara-logo.png"
                    alt="Alara"
                    width={140}
                    height={45}
                    className="invert mix-blend-lighten"
                    priority
                />
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                }`}
                        >
                            <item.icon
                                className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
                                    }`}
                            />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-zinc-800">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold">
                        JD
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-200">John Doe</span>
                        <span className="text-xs text-zinc-500">Free Plan</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
