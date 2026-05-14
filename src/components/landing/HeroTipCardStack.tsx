"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { HeroTipCard } from "./HeroTipCard";
import { HERO_CREATORS } from "@/lib/hero-creators";
import { cn } from "@/lib/utils";

const ROTATE_MS = 5500;
const INTERACT_PAUSE_MS = 9000;

export function HeroTipCardStack() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const interactTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-rotate
  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(() => {
      setDirection(1);
      setActive((i) => (i + 1) % HERO_CREATORS.length);
    }, ROTATE_MS);
    return () => clearTimeout(t);
  }, [active, paused, reduce]);

  const handleInteract = useCallback(() => {
    setPaused(true);
    if (interactTimeout.current) clearTimeout(interactTimeout.current);
    interactTimeout.current = setTimeout(() => setPaused(false), INTERACT_PAUSE_MS);
  }, []);

  const goTo = (idx: number) => {
    if (idx === active) return;
    setDirection(idx > active ? 1 : -1);
    setActive(idx);
    handleInteract();
  };

  const creator = HERO_CREATORS[active];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative w-full max-w-md"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative"
        style={{ perspective: 1400 }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={creator.handle}
            custom={direction}
            initial={reduce ? { opacity: 0 } : { rotateY: -90, opacity: 0, scale: 0.95 }}
            animate={reduce ? { opacity: 1 } : { rotateY: 0, opacity: 1, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { rotateY: 90, opacity: 0, scale: 0.95 }}
            transition={{ duration: reduce ? 0.2 : 0.65, ease: [0.4, 0.1, 0.3, 1] }}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
            whileHover={reduce ? undefined : { y: -4 }}
          >
            <HeroTipCard creator={creator} onInteract={handleInteract} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination dots */}
      <div className="mt-7 flex items-center justify-center gap-2">
        {HERO_CREATORS.map((c, i) => (
          <button
            key={c.handle}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show ${c.displayName}'s tip card`}
            aria-current={i === active}
            className={cn(
              "h-2 rounded-full transition-all",
              i === active
                ? "w-8 bg-kunu-terracotta"
                : "w-2 bg-kunu-ink/15 hover:bg-kunu-ink/30",
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}
