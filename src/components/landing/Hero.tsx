"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BrushUnderline } from "./BrushUnderline";
import { ClaimHandleForm } from "./ClaimHandleForm";
import { HeroTipWidget } from "./HeroTipWidget";
import { landingCopy } from "@/lib/landing-copy";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function Hero() {
  const c = landingCopy.hero;

  return (
    <section className="relative isolate overflow-hidden">
      {/* Background atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        {/* Top-right warm orb */}
        <div className="absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-kunu-ochre/40 via-kunu-terracotta/30 to-transparent blur-3xl" />
        {/* Bottom-left soft green */}
        <div className="absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-kunu-green/15 to-transparent blur-3xl" />
        {/* Adinkra dot pattern */}
        <div className="absolute inset-0 bg-adinkra-pattern opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        {/* Grain */}
        <div className="absolute inset-0 bg-grain opacity-40" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:py-32 lg:px-12">
        {/* Left column — copy + CTA */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
          }}
        >
          {/* Eyebrow */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-kunu-terracotta/30 bg-kunu-cream/60 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-kunu-terracotta backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {c.eyebrow}
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mt-5 font-display text-5xl font-semibold leading-[0.95] tracking-tight text-kunu-ink text-balance sm:text-6xl lg:text-7xl xl:text-[5.5rem]"
          >
            {c.headlinePre}{" "}
            <span className="relative inline-block text-kunu-terracotta">
              {c.headlineHighlight}
              <BrushUnderline delay={0.9} />
            </span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mt-6 max-w-xl text-lg text-kunu-ink-soft text-pretty sm:text-xl"
          >
            {c.subhead}
          </motion.p>

          {/* Claim form */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mt-8"
          >
            <ClaimHandleForm size="lg" />
          </motion.div>

          {/* Footnote */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mt-3 pl-1 text-sm text-kunu-clay"
          >
            {c.footnote}
          </motion.p>

          {/* Trust strip */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-kunu-clay"
          >
            <span className="uppercase tracking-wider">Powered by</span>
            <span className="font-display text-base font-semibold text-kunu-ink/70">
              Paystack
            </span>
            <span className="font-display text-base font-semibold text-kunu-ink/70">
              Neon
            </span>
            <span className="font-display text-base font-semibold text-kunu-ink/70">
              Next.js
            </span>
          </motion.div>
        </motion.div>

        {/* Right column — interactive widget */}
        <div className="flex justify-center lg:justify-end">
          <HeroTipWidget />
        </div>
      </div>

      {/* Bottom transition curve */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-kunu-cream-deep/30"
      />
    </section>
  );
}
