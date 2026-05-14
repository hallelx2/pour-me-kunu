"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import Image from "next/image";
import { KunuCupGlyph } from "./KunuCupGlyph";
import { HERO_ACCENT_FRAMES, type HeroCreator } from "@/lib/hero-creators";
import { cn, formatNaira } from "@/lib/utils";

const PRESET_COUNTS = [1, 3, 5] as const;
const MAX_KUNUS = 99;

const ACCENT_LABEL: Record<HeroCreator["accent"], string> = {
  terracotta: "Terracotta",
  ochre: "Ochre",
  green: "Green",
};

interface HeroTipCardProps {
  creator: HeroCreator;
  onInteract?: () => void;
}

export function HeroTipCard({ creator, onInteract }: HeroTipCardProps) {
  const [count, setCount] = useState<number>(3);
  const [isCustom, setIsCustom] = useState(false);

  const totalKobo = count * creator.kunuPriceKobo;
  const displayValue = useMotionValue(totalKobo);
  const displayText = useTransform(displayValue, (v) => formatNaira(v));

  // When creator switches, reset to 3 kunus
  useEffect(() => {
    setCount(3);
    setIsCustom(false);
    animate(displayValue, 3 * creator.kunuPriceKobo, { duration: 0.4 });
  }, [creator.kunuPriceKobo, displayValue]);

  const setKunuCount = (n: number) => {
    onInteract?.();
    const next = Math.max(1, Math.min(MAX_KUNUS, Math.round(n)));
    setCount(next);
    animate(displayValue, next * creator.kunuPriceKobo, {
      duration: 0.45,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
  };

  const handleSend = () => {
    onInteract?.();
    confetti({
      particleCount: 80,
      spread: 70,
      startVelocity: 35,
      origin: { y: 0.6 },
      colors: ["#C8512C", "#E5A347", "#2D5F3F", "#FBF5EC"],
      scalar: 0.9,
    });
    toast.success(`${count} kunu${count > 1 ? "s" : ""} on the way 🥤`, {
      description: `${creator.displayName.split(" ")[0]} would love this. Claim your handle above to receive real kunus.`,
    });
  };

  const fillLevel = Math.min(1, count / 7);
  const frame = HERO_ACCENT_FRAMES[creator.accent];

  return (
    <div className="relative">
      {/* Layered decorative back frames — themed per creator */}
      <div
        aria-hidden
        className={cn(
          "absolute -inset-3 -z-10 rounded-[2rem] -rotate-2",
          frame.back,
        )}
      />
      <div
        aria-hidden
        className={cn(
          "absolute -inset-1 -z-10 rounded-[1.75rem] rotate-1",
          frame.mid,
        )}
      />

      <div className="relative rounded-[1.5rem] border-2 border-kunu-ink/10 bg-kunu-cream p-6 shadow-[0_30px_60px_-30px_rgba(31,22,17,0.4)]">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-kunu-cream",
              frame.ring,
            )}
          >
            <Image
              src={`https://api.dicebear.com/9.x/lorelei/svg?seed=${creator.avatarSeed}&backgroundType=gradientLinear&backgroundColor=fbf5ec,f4d7a3`}
              alt={`${creator.displayName} avatar`}
              fill
              sizes="48px"
              unoptimized
            />
          </div>
          <div className="min-w-0">
            <div className="font-display text-base font-semibold text-kunu-ink">
              {creator.displayName}
            </div>
            <div className="truncate text-xs text-kunu-clay">
              {creator.role} · {creator.city} · @{creator.handle}
            </div>
          </div>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-kunu-green/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-kunu-green">
            <span className="h-1.5 w-1.5 rounded-full bg-kunu-green" />
            Demo
          </span>
        </div>

        <div className="mt-5 flex items-end gap-4">
          <div className="flex-1">
            <div className="font-display text-2xl font-semibold leading-tight text-kunu-ink">
              Buy {creator.displayName.split(" ")[0]} some kunus
            </div>
            <div className="mt-1 text-xs text-kunu-clay">
              {formatNaira(creator.kunuPriceKobo)} per kunu ·{" "}
              {ACCENT_LABEL[creator.accent]} vibes
            </div>
          </div>
          <div className="shrink-0">
            <KunuCupGlyph fillLevel={fillLevel} size={56} withStraw withSparkles />
          </div>
        </div>

        {/* Kunu count selector */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-kunu-clay">
            <span>How many kunus?</span>
            <span className="font-sans text-kunu-ink">{count}</span>
          </div>
          <div className="mt-2 flex gap-2">
            {PRESET_COUNTS.map((n) => {
              const active = count === n && !isCustom;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setIsCustom(false);
                    setKunuCount(n);
                  }}
                  className={cn(
                    "relative flex-1 rounded-xl border-2 py-3 text-center font-display text-lg font-semibold transition-all",
                    active
                      ? "border-kunu-terracotta bg-kunu-terracotta text-kunu-cream shadow-sm"
                      : "border-kunu-ink/10 bg-kunu-cream-deep/40 text-kunu-ink hover:border-kunu-terracotta/40 hover:bg-kunu-cream-deep",
                  )}
                >
                  {n}
                  <span
                    className={cn(
                      "ml-0.5 text-xs font-normal",
                      active ? "text-kunu-cream/80" : "text-kunu-clay",
                    )}
                  >
                    🥤
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setIsCustom(true);
                setKunuCount(7);
              }}
              className={cn(
                "flex-1 rounded-xl border-2 py-3 text-center font-display text-sm font-semibold transition-all",
                isCustom
                  ? "border-kunu-terracotta bg-kunu-terracotta text-kunu-cream shadow-sm"
                  : "border-kunu-ink/10 bg-kunu-cream-deep/40 text-kunu-ink hover:border-kunu-terracotta/40",
              )}
            >
              Custom
            </button>
          </div>

          {isCustom && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.2 }}
              className="mt-3"
            >
              <input
                type="number"
                min={1}
                max={MAX_KUNUS}
                value={count}
                onChange={(e) => setKunuCount(Number(e.target.value) || 1)}
                aria-label="Custom kunu count"
                className="w-full rounded-xl border-2 border-kunu-ink/15 bg-kunu-cream px-4 py-2.5 font-display text-lg font-semibold focus:border-kunu-terracotta focus:outline-none"
              />
            </motion.div>
          )}
        </div>

        {/* Message preview (read-only — placeholder reflects creator) */}
        <div className="mt-4">
          <input
            type="text"
            onFocus={onInteract}
            defaultValue=""
            maxLength={140}
            placeholder={creator.recentMessage}
            className="w-full rounded-xl border-2 border-kunu-ink/10 bg-kunu-cream-deep/30 px-4 py-3 text-sm placeholder:text-kunu-clay/70 focus:border-kunu-terracotta focus:bg-kunu-cream focus:outline-none"
          />
        </div>

        {/* Total + send */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-kunu-clay">
              Total
            </div>
            <motion.div className="font-display text-3xl font-semibold text-kunu-ink tabular-nums">
              {displayText}
            </motion.div>
          </div>
          <motion.button
            type="button"
            onClick={handleSend}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group/btn relative overflow-hidden rounded-xl bg-kunu-terracotta px-5 py-3.5 font-display text-sm font-semibold text-kunu-cream shadow-[0_8px_20px_-6px_rgba(200,81,44,0.6)] transition-colors hover:bg-kunu-terracotta-deep"
          >
            <span className="relative z-10">
              Send {count} kunu{count > 1 ? "s" : ""}
            </span>
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-kunu-cream/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full"
            />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
