"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { landingCopy } from "@/lib/landing-copy";
import { KunuCupGlyph } from "./KunuCupGlyph";
import { cn } from "@/lib/utils";

export function Pricing() {
  const c = landingCopy.pricing;

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-kunu-cream-deep/40 py-24 sm:py-32"
    >
      {/* Decorative cup, large, off to the side */}
      <motion.div
        aria-hidden
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -bottom-10 -right-10 opacity-20"
      >
        <KunuCupGlyph size={300} withStraw withSparkles={false} animate={false} fillLevel={0.5} />
      </motion.div>

      <div className="relative mx-auto max-w-5xl px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-kunu-green/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-kunu-green">
            {c.eyebrow}
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-[1] tracking-tight text-kunu-ink text-balance sm:text-6xl lg:text-7xl">
            Free to start.{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-kunu-terracotta">5%</span>
              <span
                aria-hidden
                className="absolute -inset-2 -z-0 rounded-full bg-kunu-ochre/30 blur-md"
              />
            </span>{" "}
            per tip.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-kunu-ink-soft text-pretty sm:text-xl">
            {c.subhead}
          </p>
        </motion.div>

        {/* Comparison strip */}
        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {c.comparison.map((row, idx) => {
            const us = "us" in row && row.us;
            return (
              <motion.div
                key={row.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={cn(
                  "relative rounded-2xl border-2 p-6 transition-all",
                  us
                    ? "border-kunu-terracotta bg-kunu-terracotta text-kunu-cream shadow-[0_20px_50px_-25px_rgba(200,81,44,0.6)] sm:scale-105"
                    : "border-kunu-ink/10 bg-kunu-cream text-kunu-ink",
                )}
              >
                {us && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-kunu-ochre px-3 py-1 font-display text-xs font-bold uppercase tracking-wider text-kunu-night">
                    Us
                  </div>
                )}
                <div
                  className={cn(
                    "font-display text-lg font-semibold",
                    us ? "text-kunu-cream" : "text-kunu-ink",
                  )}
                >
                  {row.name}
                </div>
                <div
                  className={cn(
                    "mt-2 text-sm leading-relaxed",
                    us ? "text-kunu-cream/85" : "text-kunu-ink-soft",
                  )}
                >
                  {row.fee}
                </div>
                {us && (
                  <ul className="mt-4 space-y-1.5 text-xs">
                    {[
                      "One-off tips",
                      "Recurring memberships",
                      "Custom kunu price",
                      "Naira payouts",
                    ].map((feat) => (
                      <li key={feat} className="flex items-center gap-1.5 text-kunu-cream/90">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-kunu-clay">
          {c.footnote}
        </p>
      </div>
    </section>
  );
}
