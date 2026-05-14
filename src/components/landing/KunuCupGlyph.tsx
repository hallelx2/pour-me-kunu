"use client";

import { motion, useReducedMotion } from "framer-motion";

interface KunuCupGlyphProps {
  fillLevel?: number;
  size?: number;
  className?: string;
  withStraw?: boolean;
  withSparkles?: boolean;
  animate?: boolean;
}

export function KunuCupGlyph({
  fillLevel = 0.65,
  size = 48,
  className,
  withStraw = true,
  withSparkles = false,
  animate = true,
}: KunuCupGlyphProps) {
  const reduce = useReducedMotion();
  const clampedFill = Math.max(0, Math.min(1, fillLevel));

  const cupTopY = 14;
  const cupBottomY = 56;
  const cupHeight = cupBottomY - cupTopY;
  const liquidY = cupBottomY - clampedFill * cupHeight;

  const liquidProps = animate && !reduce
    ? {
        animate: { y: liquidY - cupBottomY },
        transition: { type: "spring" as const, stiffness: 120, damping: 18 },
      }
    : {};

  return (
    <svg
      viewBox="0 0 64 72"
      width={size}
      height={size * (72 / 64)}
      className={className}
      aria-hidden="true"
    >
      {withSparkles && (
        <>
          <motion.circle
            cx="12"
            cy="10"
            r="1.5"
            fill="var(--color-kunu-ochre)"
            initial={{ opacity: 0, scale: 0 }}
            animate={
              reduce
                ? { opacity: 1, scale: 1 }
                : { opacity: [0, 1, 0.4, 1], scale: [0, 1, 1, 1.1] }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
          <motion.circle
            cx="56"
            cy="8"
            r="1"
            fill="var(--color-kunu-terracotta)"
            initial={{ opacity: 0 }}
            animate={
              reduce ? { opacity: 1 } : { opacity: [0, 1, 0.3, 1] }
            }
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 1.2,
              delay: 0.5,
            }}
          />
        </>
      )}

      {/* Cup body — slightly tapered glass */}
      <path
        d="M 14 14 L 50 14 L 47 58 Q 47 62 43 62 L 21 62 Q 17 62 17 58 Z"
        fill="var(--color-kunu-cream-deep)"
        stroke="var(--color-kunu-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Liquid (kunu) */}
      <defs>
        <clipPath id={`cup-clip-${size}`}>
          <path d="M 14 14 L 50 14 L 47 58 Q 47 62 43 62 L 21 62 Q 17 62 17 58 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#cup-clip-${size})`}>
        <motion.g
          initial={
            animate && !reduce
              ? { y: 0 }
              : false
          }
          {...liquidProps}
          style={{ y: animate && !reduce ? 0 : liquidY - cupBottomY }}
        >
          <rect
            x="10"
            y={cupBottomY}
            width="48"
            height={cupHeight + 4}
            fill="var(--color-kunu-ochre)"
          />
          {/* Wavy liquid top */}
          <path
            d={`M 10 ${cupBottomY} Q 16 ${cupBottomY - 1.5} 22 ${cupBottomY} T 34 ${cupBottomY} T 46 ${cupBottomY} T 58 ${cupBottomY} L 58 ${cupBottomY + 1} L 10 ${cupBottomY + 1} Z`}
            fill="var(--color-kunu-ochre)"
          />
        </motion.g>
      </g>

      {/* Cup rim highlight */}
      <ellipse
        cx="32"
        cy="14"
        rx="18"
        ry="2.5"
        fill="var(--color-kunu-cream)"
        stroke="var(--color-kunu-ink)"
        strokeWidth="2"
      />

      {/* Straw */}
      {withStraw && (
        <>
          <rect
            x="35"
            y="6"
            width="4"
            height="32"
            rx="1.5"
            fill="var(--color-kunu-green)"
            transform="rotate(12 37 22)"
          />
          <rect
            x="36"
            y="6"
            width="2"
            height="14"
            rx="1"
            fill="var(--color-kunu-green-soft)"
            transform="rotate(12 37 13)"
          />
        </>
      )}
    </svg>
  );
}
