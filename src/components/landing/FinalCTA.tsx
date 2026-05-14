"use client";

import { motion } from "framer-motion";
import { ClaimHandleForm } from "./ClaimHandleForm";
import { KunuCupGlyph } from "./KunuCupGlyph";
import { landingCopy } from "@/lib/landing-copy";

export function FinalCTA() {
  const c = landingCopy.finalCta;

  return (
    <section className="relative overflow-hidden bg-kunu-terracotta text-kunu-cream">
      {/* Decorative blobs + pattern */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-kunu-ochre/30 blur-3xl" />
        <div className="absolute -right-32 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-kunu-terracotta-deep/40 blur-3xl" />
        <div className="absolute inset-0 bg-adinkra-pattern opacity-[0.07]" />
        <div className="absolute inset-0 bg-grain opacity-30" />
      </div>

      {/* Floating cup */}
      <motion.div
        aria-hidden
        animate={{ y: [-8, 8, -8], rotate: [-2, 2, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute right-12 top-12 hidden lg:block"
      >
        <KunuCupGlyph size={140} withSparkles fillLevel={0.7} animate={false} />
      </motion.div>
      <motion.div
        aria-hidden
        animate={{ y: [8, -8, 8], rotate: [3, -3, 3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-16 left-16 hidden lg:block"
      >
        <KunuCupGlyph size={100} fillLevel={0.4} animate={false} />
      </motion.div>

      <div className="relative mx-auto max-w-4xl px-6 py-24 text-center sm:px-8 sm:py-32 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-kunu-cream/30 bg-kunu-cream/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-kunu-ochre-soft backdrop-blur">
            {c.eyebrow}
          </div>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {c.headline}
          </h2>
          <p className="mt-5 text-lg text-kunu-cream/80 sm:text-xl">
            {c.footnote}
          </p>
          <div className="mt-10 flex justify-center">
            <ClaimHandleForm variant="inverted" size="lg" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
