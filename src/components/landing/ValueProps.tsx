"use client";

import { motion } from "framer-motion";
import { landingCopy } from "@/lib/landing-copy";
import { cn } from "@/lib/utils";

export function ValueProps() {
  const c = landingCopy.valueProps;

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-kunu-green/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-kunu-green">
            {c.eyebrow}
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-kunu-ink text-balance sm:text-5xl lg:text-6xl">
            {c.headline}
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
          {/* Large card (spans 2 cols, 2 rows on desktop) */}
          <BentoCard
            item={c.items[0]}
            className="lg:col-span-2 lg:row-span-2"
            large
            visual={<LargeNairaVisual />}
          />
          {/* 3 stacked small cards */}
          <BentoCard
            item={c.items[1]}
            className="lg:col-start-3"
            visual={<NoSubscriptionVisual />}
          />
          <BentoCard
            item={c.items[2]}
            className="lg:col-start-3"
            visual={<PriceSliderVisual />}
          />
          {/* Fourth card spans full width below large card on desktop */}
          <BentoCard
            item={c.items[3]}
            className="sm:col-span-2 lg:col-span-3"
            visual={<MessagesVisual />}
          />
        </div>
      </div>
    </section>
  );
}

interface BentoItemData {
  title: string;
  body: string;
  accent: "terracotta" | "cream";
}

interface BentoCardProps {
  item: BentoItemData;
  className?: string;
  large?: boolean;
  visual?: React.ReactNode;
}

function BentoCard({ item, className, large, visual }: BentoCardProps) {
  const isTerracotta = item.accent === "terracotta";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -3 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border-2 p-7 transition-shadow",
        isTerracotta
          ? "border-kunu-terracotta-deep/30 bg-kunu-terracotta text-kunu-cream"
          : "border-kunu-ink/8 bg-kunu-cream text-kunu-ink",
        large ? "min-h-[26rem]" : "min-h-[14rem]",
        "hover:shadow-[0_20px_60px_-30px_rgba(31,22,17,0.4)]",
        className,
      )}
    >
      {visual && (
        <div
          className={cn(
            "pointer-events-none flex items-center",
            large ? "h-48 justify-start" : "h-24 justify-end",
          )}
        >
          {visual}
        </div>
      )}

      <div className={cn("mt-auto", large && "max-w-md")}>
        <h3
          className={cn(
            "font-display font-semibold leading-tight text-balance",
            large ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl",
          )}
        >
          {item.title}
        </h3>
        <p
          className={cn(
            "mt-3 leading-relaxed text-pretty",
            isTerracotta ? "text-kunu-cream/85" : "text-kunu-ink-soft",
            large ? "text-lg" : "text-base",
          )}
        >
          {item.body}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Visual elements ────────────────────────────────────────────── */

function LargeNairaVisual() {
  return (
    <div className="relative h-full w-full">
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-2 top-2"
      >
        <span className="font-display text-[10rem] font-bold leading-none text-kunu-cream/90">
          ₦
        </span>
      </motion.div>
      <motion.div
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-2 left-32"
      >
        <span className="font-display text-6xl text-kunu-ochre-soft">🥤</span>
      </motion.div>
      <div className="absolute right-4 top-8 flex flex-col gap-1.5 text-right font-display text-sm font-semibold text-kunu-cream/70">
        <div className="rounded-full bg-kunu-cream/15 px-3 py-1 backdrop-blur">
          ₦500
        </div>
        <div className="rounded-full bg-kunu-cream/15 px-3 py-1 backdrop-blur">
          ₦1,500
        </div>
        <div className="rounded-full bg-kunu-cream/15 px-3 py-1 backdrop-blur">
          ₦5,000
        </div>
      </div>
    </div>
  );
}

function NoSubscriptionVisual() {
  return (
    <div className="flex items-center gap-2">
      <span className="relative font-display text-2xl font-bold text-kunu-clay line-through decoration-kunu-terracotta decoration-2">
        $5/mo
      </span>
      <span className="font-display text-3xl">→</span>
      <span className="font-display text-3xl font-bold text-kunu-green">
        ₦0/mo
      </span>
    </div>
  );
}

function PriceSliderVisual() {
  return (
    <div className="w-full">
      <div className="relative h-2 w-full rounded-full bg-kunu-ink/10">
        <motion.div
          initial={{ width: "20%" }}
          whileInView={{ width: "65%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute left-0 top-0 h-full rounded-full bg-kunu-terracotta"
        />
        <motion.div
          initial={{ left: "20%" }}
          whileInView={{ left: "65%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute -top-2 h-6 w-6 -translate-x-1/2 rounded-full border-4 border-kunu-cream bg-kunu-terracotta shadow-md"
        />
      </div>
      <div className="mt-2 flex justify-between text-xs font-medium text-kunu-clay">
        <span>₦100</span>
        <span>₦10k</span>
      </div>
    </div>
  );
}

function MessagesVisual() {
  return (
    <div className="flex w-full items-center justify-end gap-3">
      <div className="rounded-2xl rounded-br-sm border border-kunu-ochre/30 bg-kunu-ochre/15 px-3 py-2 font-sans text-xs text-kunu-ink/80">
        Your egusi recipe saved my Sunday 🙏
      </div>
      <div className="rounded-2xl rounded-bl-sm border border-kunu-terracotta/30 bg-kunu-terracotta/10 px-3 py-2 font-sans text-xs text-kunu-ink/80">
        Bought your print. Framed it.
      </div>
      <div className="hidden rounded-2xl rounded-bl-sm border border-kunu-green/30 bg-kunu-green/10 px-3 py-2 font-sans text-xs text-kunu-ink/80 sm:block">
        On repeat all week ❤️
      </div>
    </div>
  );
}
