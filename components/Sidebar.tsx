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
        <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-border/80 bg-[rgb(19_29_46/88%)] text-foreground shadow-xl backdrop-blur-xl">
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
                                className={`h-5 w-5 transition-colors ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                                    }`}
                            />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-border/80 p-4">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-tr from-blue-400 to-indigo-500 text-xs font-bold text-primary-foreground">
                        JD
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">John Doe</span>
                        <span className="text-xs text-muted-foreground">Free Plan</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
