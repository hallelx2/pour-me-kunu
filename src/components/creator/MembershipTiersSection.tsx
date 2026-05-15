"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn, formatNaira } from "@/lib/utils";

interface Tier {
  id: string;
  name: string;
  description: string | null;
  priceKobo: number;
  interval: "monthly" | "annually";
  perks: string[] | null;
  paystackPlanCode: string | null;
}

interface Props {
  tiers: Tier[];
  creatorDisplayName: string;
}

export function MembershipTiersSection({ tiers, creatorDisplayName }: Props) {
  const [selected, setSelected] = useState<Tier | null>(null);

  if (tiers.length === 0) return null;

  const firstName = creatorDisplayName.split(" ")[0];

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-semibold text-kunu-ink">
          Memberships
        </h2>
        <span className="text-xs text-kunu-clay">Recurring support</span>
      </div>
      <p className="mt-2 text-sm text-kunu-ink-soft">
        Become a regular and get a little something every month.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {tiers.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            firstName={firstName}
            onChoose={() => setSelected(tier)}
          />
        ))}
      </div>

      {selected && (
        <SubscribeDialog
          tier={selected}
          firstName={firstName}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}

function TierCard({
  tier,
  firstName,
  onChoose,
}: {
  tier: Tier;
  firstName: string;
  onChoose: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex h-full flex-col rounded-3xl border-2 border-kunu-ink/8 bg-kunu-cream p-6 transition-shadow hover:shadow-[0_20px_50px_-30px_rgba(31,22,17,0.3)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-lg font-semibold text-kunu-ink">
            {tier.name}
          </div>
          {tier.description && (
            <p className="mt-1 text-sm text-kunu-ink-soft">{tier.description}</p>
          )}
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-semibold text-kunu-terracotta">
            {formatNaira(tier.priceKobo)}
          </div>
          <div className="text-xs text-kunu-clay">/{tier.interval}</div>
        </div>
      </div>

      {tier.perks && tier.perks.length > 0 && (
        <ul className="mt-4 flex-1 space-y-1.5 text-sm text-kunu-ink-soft">
          {tier.perks.map((p, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-kunu-green"
                strokeWidth={3}
              />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onChoose}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-kunu-terracotta px-4 py-2.5 font-display text-sm font-semibold text-kunu-cream shadow-[0_6px_16px_-6px_rgba(200,81,44,0.6)] hover:bg-kunu-terracotta-deep"
      >
        Support {firstName}
      </button>
    </motion.div>
  );
}

function SubscribeDialog({
  tier,
  firstName,
  onClose,
}: {
  tier: Tier;
  firstName: string;
  onClose: () => void;
}) {
  const [supporterEmail, setSupporterEmail] = useState("");
  const [supporterName, setSupporterName] = useState("");

  const subscribe = trpc.memberships.subscribe.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(supporterEmail)) {
      toast.error("Email is required for receipts and account access.");
      return;
    }
    try {
      const result = await subscribe.mutateAsync({
        tierId: tier.id,
        supporterEmail,
        supporterName,
      });
      window.location.href = result.authorization_url;
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Couldn't start the subscription. Try again in a moment.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      <div
        className="absolute inset-0 bg-kunu-night/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-3xl border-2 border-kunu-ink/10 bg-kunu-cream p-7 shadow-[0_30px_60px_-30px_rgba(31,22,17,0.5)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-kunu-ink/10 text-kunu-ink-soft hover:border-kunu-terracotta hover:text-kunu-terracotta"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="font-display text-2xl font-semibold text-kunu-ink">
          Subscribe to {tier.name}
        </h2>
        <p className="mt-1 text-sm text-kunu-ink-soft">
          {formatNaira(tier.priceKobo)} / {tier.interval} — recurring until you
          cancel. Supporting {firstName}.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="supporterEmail">Email</Label>
            <Input
              id="supporterEmail"
              type="email"
              value={supporterEmail}
              onChange={(e) => setSupporterEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="supporterName">Your name (optional)</Label>
            <Input
              id="supporterName"
              value={supporterName}
              onChange={(e) => setSupporterName(e.target.value)}
              placeholder="So {firstName} knows who's supporting them"
              maxLength={60}
            />
          </div>
        </div>

        <div className="mt-7">
          <Button
            type="submit"
            size="lg"
            loading={subscribe.isPending}
            disabled={subscribe.isPending}
            className="w-full"
          >
            {subscribe.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting…
              </>
            ) : (
              `Pay ${formatNaira(tier.priceKobo)} & subscribe`
            )}
          </Button>
          <p className="mt-3 text-center text-xs text-kunu-clay">
            Paystack handles the payment. Cancel any time.
          </p>
        </div>
      </form>
    </div>
  );
}
