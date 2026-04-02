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
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-border bg-[color-mix(in_srgb,var(--color-surface-raised)_95%,transparent)] text-[var(--color-text)] shadow-xl backdrop-blur-xl">
      <div className="p-[var(--space-24)]">
        <Image
          src="/alara-logo.png"
          alt="Alara"
          width={140}
          height={45}
          className="invert mix-blend-lighten"
          priority
        />
      </div>

      <nav className="mt-4 flex-1 space-y-2 px-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-[var(--radius-md)] px-4 py-3 transition-all duration-200 ${
                isActive
                  ? "border border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)] bg-[var(--overlay-primary-10)] text-[var(--color-primary)] shadow-[var(--shadow-primary-hover)]"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-border)] hover:text-[var(--color-text-strong)]"
              }`}
            >
              <item.icon
                className={`h-5 w-5 transition-colors ${
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-strong)]"
                }`}
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 px-2 py-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: "var(--gradient-avatar)" }}
          >
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-[length:var(--text-base)] font-medium text-[var(--color-text-strong)]">
              John Doe
            </span>
            <span className="text-[length:var(--text-sm)] text-[var(--color-text-muted)]">
              Free Plan
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
