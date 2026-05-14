"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";
import { demoCreators, dicebearUrl, type DemoCreator } from "@/lib/demo-creators";
import { formatNaira, cn } from "@/lib/utils";

const accentBg: Record<DemoCreator["accent"], string> = {
  terracotta: "from-kunu-terracotta/40 to-kunu-ochre/30",
  ochre: "from-kunu-ochre/50 to-kunu-cream-deep",
  green: "from-kunu-green/40 to-kunu-green-soft/30",
  clay: "from-kunu-clay/35 to-kunu-cream-deep",
};

const accentRing: Record<DemoCreator["accent"], string> = {
  terracotta: "ring-kunu-terracotta/40",
  ochre: "ring-kunu-ochre/50",
  green: "ring-kunu-green/40",
  clay: "ring-kunu-clay/40",
};

export function DemoCreators() {
  return (
    <section id="demo-creators" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-kunu-terracotta/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-kunu-terracotta-deep">
            Pages we love
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-kunu-ink text-balance sm:text-5xl lg:text-6xl">
            Yours could look this good in two minutes.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-kunu-ink-soft sm:text-lg">
            A few example pages we designed to show what's possible. Click through, try sending a demo kunu, then build yours.
          </p>
        </motion.div>
      </div>

      <div className="relative mt-12">
        {/* Marquee with fades on the sides */}
        <Marquee className="[--duration:60s]" pauseOnHover>
          {demoCreators.map((creator) => (
            <CreatorCard key={creator.handle} creator={creator} />
          ))}
        </Marquee>
        {/* Side fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-kunu-cream to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-kunu-cream to-transparent" />
      </div>

      <div className="mx-auto mt-10 max-w-3xl px-6 text-center text-sm text-kunu-clay sm:px-8">
        ✨ These are demo pages. Yours unlocks once you claim your handle.
      </div>
    </section>
  );
}

function CreatorCard({ creator }: { creator: DemoCreator }) {
  return (
    <a
      href={`/@${creator.handle}`}
      className="group/card block w-80 shrink-0 overflow-hidden rounded-3xl border-2 border-kunu-ink/8 bg-kunu-cream shadow-[0_20px_50px_-30px_rgba(31,22,17,0.3)] transition-transform hover:-translate-y-2 hover:shadow-[0_30px_60px_-30px_rgba(31,22,17,0.4)]"
      onClick={(e) => e.preventDefault()}
    >
      {/* Cover banner with gradient */}
      <div
        className={cn(
          "relative h-24 bg-gradient-to-br",
          accentBg[creator.accent],
        )}
      >
        <div className="absolute inset-0 bg-adinkra-pattern opacity-40" />
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-kunu-cream/80 px-2 py-1 text-[10px] font-semibold text-kunu-ink/80 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-kunu-terracotta" />
          {creator.city}
        </div>
      </div>

      {/* Avatar (overlapping cover) */}
      <div className="relative px-5">
        <div
          className={cn(
            "absolute -top-8 h-16 w-16 overflow-hidden rounded-full ring-4 ring-kunu-cream",
            accentRing[creator.accent],
            "ring-offset-0",
          )}
        >
          <Image
            src={dicebearUrl(creator.avatarSeed)}
            alt={creator.displayName}
            fill
            sizes="64px"
            unoptimized
          />
        </div>
      </div>

      <div className="px-5 pb-5 pt-10">
        <div className="font-display text-lg font-semibold leading-tight text-kunu-ink">
          {creator.displayName}
        </div>
        <div className="text-xs font-medium text-kunu-terracotta">
          @{creator.handle}
        </div>
        <p className="mt-2 text-sm leading-snug text-kunu-ink-soft text-pretty">
          {creator.tagline}
        </p>

        {/* Last message bubble */}
        <div className="mt-3 rounded-2xl rounded-bl-sm border border-kunu-ink/8 bg-kunu-cream-deep/60 px-3 py-2 text-xs leading-snug text-kunu-ink-soft">
          {creator.recentMessage}
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center gap-3 text-xs">
          <div className="inline-flex items-center gap-1 font-medium text-kunu-ink-soft">
            <Heart className="h-3 w-3 fill-kunu-terracotta text-kunu-terracotta" />
            {creator.supporters} supporters
          </div>
          <span className="text-kunu-clay/40">·</span>
          <div className="font-medium text-kunu-ink-soft">
            {creator.totalKunus.toLocaleString()} 🥤
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-kunu-terracotta px-3.5 py-2.5 font-display text-sm font-semibold text-kunu-cream transition-colors group-hover/card:bg-kunu-terracotta-deep">
          <span>Buy a kunu</span>
          <span className="font-sans text-xs opacity-80">
            {formatNaira(creator.kunuPriceKobo)}
          </span>
        </div>
      </div>
    </a>
  );
}
