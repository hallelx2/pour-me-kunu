"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { KunuCupGlyph } from "@/components/landing/KunuCupGlyph";
import { trpc } from "@/lib/trpc";
import { cn, formatNaira } from "@/lib/utils";

interface Creator {
  username: string;
  displayName: string;
  kunuPriceKobo: number;
  kunuLabel: string;
  kunuEmoji: string;
  accentColor?: string | null;
}

const PRESET_COUNTS = [1, 3, 5] as const;
const MAX_KUNUS = 99;

export function CreatorTipWidget({ creator }: { creator: Creator }) {
  const [count, setCount] = useState(3);
  const [isCustom, setIsCustom] = useState(false);
  const [message, setMessage] = useState("");
  const [supporterName, setSupporterName] = useState("");
  const [supporterEmail, setSupporterEmail] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const totalKobo = count * creator.kunuPriceKobo;
  const displayValue = useMotionValue(totalKobo);
  const displayText = useTransform(displayValue, (v) => formatNaira(v));

  const initiate = trpc.tips.initiate.useMutation();

  const setKunuCount = (n: number) => {
    const next = Math.max(1, Math.min(MAX_KUNUS, Math.round(n)));
    setCount(next);
    animate(displayValue, next * creator.kunuPriceKobo, {
      duration: 0.45,
      ease: [0.25, 0.46, 0.45, 0.94],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supporterEmail.trim() || !/\S+@\S+\.\S+/.test(supporterEmail)) {
      toast.error("Email is required so we can send a receipt.");
      return;
    }
    try {
      const result = await initiate.mutateAsync({
        username: creator.username,
        kunuCount: count,
        supporterEmail,
        supporterName,
        message,
        isPublic,
      });
      // Hand off to Paystack
      window.location.href = result.authorization_url;
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Couldn't start the payment. Try again in a moment.",
      );
    }
  };

  const fillLevel = Math.min(1, count / 7);
  const first = creator.displayName.split(" ")[0];
  const loading = initiate.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-3xl border-2 border-kunu-ink/10 bg-kunu-cream p-6 shadow-[0_30px_60px_-30px_rgba(31,22,17,0.4)] sm:p-7"
    >
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <div className="font-display text-2xl font-semibold leading-tight text-kunu-ink">
            Buy {first} a {creator.kunuLabel}
          </div>
          <div className="mt-1 text-xs text-kunu-clay">
            {formatNaira(creator.kunuPriceKobo)} per {creator.kunuLabel} ·{" "}
            {first} gets a note from you
          </div>
        </div>
        <div className="shrink-0">
          <KunuCupGlyph fillLevel={fillLevel} size={56} withStraw withSparkles />
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-kunu-clay">
          <span>How many?</span>
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
                  {creator.kunuEmoji}
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          value={supporterName}
          onChange={(e) => setSupporterName(e.target.value)}
          placeholder="Your name (optional)"
          maxLength={60}
          className="rounded-xl border-2 border-kunu-ink/10 bg-kunu-cream-deep/30 px-4 py-3 text-sm placeholder:text-kunu-clay/70 focus:border-kunu-terracotta focus:bg-kunu-cream focus:outline-none"
        />
        <input
          type="email"
          value={supporterEmail}
          onChange={(e) => setSupporterEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="rounded-xl border-2 border-kunu-ink/10 bg-kunu-cream-deep/30 px-4 py-3 text-sm placeholder:text-kunu-clay/70 focus:border-kunu-terracotta focus:bg-kunu-cream focus:outline-none"
        />
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={140}
        placeholder={`Say something nice to ${first}…`}
        className="mt-3 w-full rounded-xl border-2 border-kunu-ink/10 bg-kunu-cream-deep/30 px-4 py-3 text-sm placeholder:text-kunu-clay/70 focus:border-kunu-terracotta focus:bg-kunu-cream focus:outline-none"
      />

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-kunu-clay">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="h-4 w-4 rounded border-2 border-kunu-ink/20 text-kunu-terracotta focus:ring-kunu-terracotta"
        />
        Show my name and message on {first}'s public wall
      </label>

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
          type="submit"
          disabled={loading}
          whileHover={loading ? undefined : { scale: 1.03 }}
          whileTap={loading ? undefined : { scale: 0.97 }}
          className="inline-flex items-center gap-2 rounded-xl bg-kunu-terracotta px-5 py-3.5 font-display text-sm font-semibold text-kunu-cream shadow-[0_8px_20px_-6px_rgba(200,81,44,0.6)] transition-colors hover:bg-kunu-terracotta-deep disabled:opacity-70"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading
            ? "Redirecting…"
            : `Send ${count} ${creator.kunuLabel}${count > 1 ? "s" : ""}`}
        </motion.button>
      </div>
    </form>
  );
}
