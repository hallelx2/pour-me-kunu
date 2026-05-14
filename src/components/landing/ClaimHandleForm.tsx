"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ClaimHandleFormProps {
  variant?: "light" | "inverted";
  size?: "md" | "lg";
  className?: string;
}

const RESERVED = new Set([
  "admin",
  "api",
  "dashboard",
  "signin",
  "signup",
  "checkout",
  "paystack",
  "kunu",
  "buymekunu",
  "support",
  "terms",
  "privacy",
  "help",
  "settings",
  "onboarding",
]);

function isValidUsername(raw: string): { ok: boolean; reason?: string } {
  const u = raw.trim().toLowerCase();
  if (u.length < 3) return { ok: false, reason: "Must be at least 3 characters." };
  if (u.length > 30) return { ok: false, reason: "Max 30 characters." };
  if (!/^[a-z0-9_.]+$/.test(u))
    return {
      ok: false,
      reason: "Only letters, numbers, dots, and underscores.",
    };
  if (RESERVED.has(u)) return { ok: false, reason: "That handle is reserved." };
  return { ok: true };
}

export function ClaimHandleForm({
  variant = "light",
  size = "md",
  className,
}: ClaimHandleFormProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const v = isValidUsername(value);
    if (!v.ok) {
      toast.error(v.reason ?? "Invalid handle.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast.success(`@${value.toLowerCase()} is available!`, {
      description: "Sign up to claim it — onboarding ships soon.",
    });
  };

  const isInverted = variant === "inverted";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "group flex w-full max-w-xl items-stretch overflow-hidden rounded-full border-2 transition-all",
        size === "lg" ? "h-16 text-lg" : "h-14 text-base",
        isInverted
          ? "border-kunu-cream/40 bg-kunu-cream/10 backdrop-blur focus-within:border-kunu-cream"
          : "border-kunu-ink/15 bg-kunu-cream-deep/40 focus-within:border-kunu-terracotta focus-within:bg-kunu-cream",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center pl-5 pr-1 font-sans font-medium select-none",
          isInverted ? "text-kunu-cream/70" : "text-kunu-clay",
        )}
      >
        buymekunu.com/@
      </div>
      <input
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\s/g, ""))}
        placeholder="yourname"
        aria-label="Choose your handle"
        className={cn(
          "min-w-0 flex-1 bg-transparent font-sans font-semibold outline-none placeholder:font-normal",
          isInverted
            ? "text-kunu-cream placeholder:text-kunu-cream/40"
            : "text-kunu-ink placeholder:text-kunu-clay/60",
        )}
      />
      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={loading}
        className={cn(
          "m-1 flex shrink-0 items-center gap-2 rounded-full px-5 font-sans font-semibold transition-all disabled:opacity-60",
          size === "lg" ? "text-base" : "text-sm",
          isInverted
            ? "bg-kunu-ochre text-kunu-night hover:bg-kunu-ochre-soft"
            : "bg-kunu-terracotta text-kunu-cream hover:bg-kunu-terracotta-deep",
        )}
      >
        {loading ? "Checking…" : "Claim my page"}
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </form>
  );
}
