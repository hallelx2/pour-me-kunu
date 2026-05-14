"use client";

import { motion } from "framer-motion";
import { landingCopy } from "@/lib/landing-copy";
import { Hand, Share2, Banknote } from "lucide-react";

const ICONS = [Hand, Share2, Banknote];

export function HowItWorks() {
  const c = landingCopy.howItWorks;

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-kunu-cream-deep/40 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-kunu-ochre/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-kunu-terracotta-deep">
            {c.eyebrow}
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-kunu-ink text-balance sm:text-5xl lg:text-6xl">
            {c.headline}
          </h2>
        </motion.div>

        {/* Steps grid with connecting line */}
        <div className="relative mt-16">
          {/* Connecting dashed line (desktop only) */}
          <svg
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-12 hidden h-2 w-full lg:block"
            viewBox="0 0 1200 8"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 100 4 L 1100 4"
              stroke="var(--color-kunu-terracotta)"
              strokeWidth="2"
              strokeDasharray="6 8"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.5 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />
          </svg>

          <div className="relative grid gap-8 lg:grid-cols-3 lg:gap-10">
            {c.steps.map((step, idx) => {
              const Icon = ICONS[idx];
              return (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.6,
                    delay: idx * 0.18,
                    ease: "easeOut",
                  }}
                  className="relative"
                >
                  {/* Step card */}
                  <div className="relative rounded-3xl border-2 border-kunu-ink/8 bg-kunu-cream p-7 shadow-[0_20px_50px_-30px_rgba(31,22,17,0.3)] transition-transform hover:-translate-y-1">
                    {/* Number glyph */}
                    <div className="flex items-center justify-between">
                      <div className="relative">
                        <span
                          aria-hidden
                          className="absolute -inset-2 -z-10 rounded-full bg-kunu-terracotta/10 blur-md"
                        />
                        <span className="font-display text-7xl font-bold leading-none text-kunu-terracotta">
                          {step.n}
                        </span>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kunu-green/10 text-kunu-green">
                        <Icon className="h-6 w-6" strokeWidth={1.75} />
                      </div>
                    </div>

                    {/* Title + body */}
                    <h3 className="mt-6 font-display text-2xl font-semibold leading-tight text-kunu-ink">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-kunu-ink-soft text-pretty">
                      {step.body}
                    </p>
                  </div>

                  {/* Pulsing dot connector (desktop) */}
                  {idx < c.steps.length - 1 && (
                    <div
                      aria-hidden
                      className="absolute -right-5 top-12 hidden h-3 w-3 lg:block"
                    >
                      <span className="absolute inset-0 animate-ping rounded-full bg-kunu-terracotta opacity-50" />
                      <span className="relative block h-full w-full rounded-full bg-kunu-terracotta" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
