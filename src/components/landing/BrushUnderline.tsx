"use client";

import { motion, useReducedMotion } from "framer-motion";

interface BrushUnderlineProps {
  delay?: number;
  className?: string;
  color?: string;
}

export function BrushUnderline({
  delay = 0,
  className,
  color = "var(--color-kunu-terracotta)",
}: BrushUnderlineProps) {
  const reduce = useReducedMotion();
  return (
    <svg
      viewBox="0 0 200 18"
      preserveAspectRatio="none"
      className={
        className ??
        "pointer-events-none absolute -bottom-3 left-0 h-3 w-full"
      }
      aria-hidden="true"
    >
      <motion.path
        d="M3 11 C 40 4, 80 14, 120 8 S 175 10, 197 6"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: reduce ? 0 : 0.9,
          delay: reduce ? 0 : delay,
          ease: "easeOut",
        }}
      />
    </svg>
  );
}
