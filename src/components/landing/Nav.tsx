"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { KunuCupGlyph } from "./KunuCupGlyph";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Examples", href: "/#demo-creators" },
  { label: "FAQ", href: "/#faq" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signedIn = !!session?.user;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-kunu-cream/80 backdrop-blur-md shadow-[0_1px_0_0_rgba(31,22,17,0.06)]"
          : "bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 sm:px-8 lg:px-12"
      >
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-kunu-ink"
        >
          <KunuCupGlyph size={28} fillLevel={0.65} animate={false} />
          <span className="transition-colors group-hover:text-kunu-terracotta">
            buymekunu
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-kunu-ink-soft transition-colors hover:bg-kunu-cream-deep hover:text-kunu-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right CTAs (desktop) */}
        <div className="hidden items-center gap-2 md:flex">
          {isPending ? (
            <div className="h-9 w-32 animate-pulse rounded-full bg-kunu-cream-deep/50" />
          ) : signedIn ? (
            <>
              {session.user.username && (
                <Link
                  href={`/@${session.user.username}`}
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-kunu-ink-soft transition-colors hover:text-kunu-ink"
                >
                  My page
                </Link>
              )}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full bg-kunu-ink px-4 py-2 text-sm font-semibold text-kunu-cream transition-all hover:bg-kunu-terracotta-deep"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-kunu-ink-soft transition-colors hover:text-kunu-ink"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-kunu-ink px-4 py-2 text-sm font-semibold text-kunu-cream transition-all hover:bg-kunu-terracotta-deep"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-kunu-ink/10 bg-kunu-cream/80 text-kunu-ink md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-kunu-ink/8 bg-kunu-cream md:hidden"
          >
            <div className="space-y-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2.5 font-medium text-kunu-ink transition-colors hover:bg-kunu-cream-deep"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2 pt-3">
                {signedIn ? (
                  <>
                    {session.user.username && (
                      <Link
                        href={`/@${session.user.username}`}
                        className="rounded-full border border-kunu-ink/10 bg-kunu-cream-deep/50 px-4 py-2.5 text-center text-sm font-semibold text-kunu-ink"
                      >
                        My page
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      className="rounded-full bg-kunu-ink px-4 py-2.5 text-center text-sm font-semibold text-kunu-cream"
                    >
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="rounded-full border border-kunu-ink/10 bg-kunu-cream-deep/50 px-4 py-2.5 text-center text-sm font-semibold text-kunu-ink"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-full bg-kunu-ink px-4 py-2.5 text-center text-sm font-semibold text-kunu-cream"
                    >
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
