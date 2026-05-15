"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Banknote,
  Settings,
} from "lucide-react";
import { KunuCupGlyph } from "@/components/landing/KunuCupGlyph";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/memberships", label: "Memberships", icon: Sparkles },
  { href: "/dashboard/supporters", label: "Supporters", icon: Users },
  { href: "/dashboard/payouts", label: "Payouts", icon: Banknote },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-kunu-ink/8 bg-kunu-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 font-display text-base font-semibold tracking-tight text-kunu-ink"
        >
          <KunuCupGlyph size={26} fillLevel={0.65} animate={false} />
          <span className="transition-colors group-hover:text-kunu-terracotta">
            buymekunu
          </span>
        </Link>

        <nav
          aria-label="Dashboard"
          className="-mx-2 flex flex-1 items-center justify-end gap-0.5 overflow-x-auto px-2 sm:gap-1"
        >
          {LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-kunu-ink text-kunu-cream"
                    : "text-kunu-ink-soft hover:bg-kunu-cream-deep hover:text-kunu-ink",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
