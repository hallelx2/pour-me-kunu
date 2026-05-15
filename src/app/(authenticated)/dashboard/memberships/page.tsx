"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Archive,
  Edit3,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { cn, formatNaira } from "@/lib/utils";

type Interval = "monthly" | "annually";

const PRESET_PRICES = [100000, 250000, 500000, 1000000, 2500000, 5000000];

export default function MembershipsPage() {
  const tiers = trpc.memberships.listMyTiers.useQuery();
  const utils = trpc.useUtils();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingTier = tiers.data?.find((t) => t.id === editingId);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:px-8 lg:px-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-kunu-clay hover:text-kunu-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
      <header className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-kunu-ink sm:text-5xl">
            Memberships
          </h1>
          <p className="mt-2 max-w-2xl text-base text-kunu-ink-soft">
            Define recurring tiers — monthly or annually — that supporters can
            subscribe to. Each tier creates a Paystack plan behind the scenes.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} size="md">
          <Plus className="h-4 w-4" />
          New tier
        </Button>
      </header>

      {tiers.isPending ? (
        <div className="mt-10 flex items-center gap-2 text-kunu-clay">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading tiers…
        </div>
      ) : tiers.data && tiers.data.length === 0 ? (
        <section className="mt-10 rounded-3xl border-2 border-dashed border-kunu-ink/15 bg-kunu-cream-deep/30 p-12 text-center">
          <h2 className="font-display text-2xl font-semibold text-kunu-ink">
            No tiers yet.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-kunu-ink-soft">
            Pick a price + perks and we'll set up a recurring plan with Paystack.
          </p>
          <div className="mt-6">
            <Button onClick={() => setShowCreate(true)}>Create your first tier</Button>
          </div>
        </section>
      ) : (
        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {tiers.data?.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              onEdit={() => setEditingId(tier.id)}
              onArchive={() => {
                utils.memberships.listMyTiers.invalidate();
              }}
            />
          ))}
        </section>
      )}

      <p className="mt-10 text-center text-xs text-kunu-clay">
        Heads up: Paystack plan price and interval are immutable. Need a
        different price? Archive the old tier and make a new one.
      </p>

      {showCreate && (
        <TierDialog
          mode="create"
          onClose={() => setShowCreate(false)}
          onSaved={() => utils.memberships.listMyTiers.invalidate()}
        />
      )}
      {editingTier && (
        <TierDialog
          mode="edit"
          tier={editingTier}
          onClose={() => setEditingId(null)}
          onSaved={() => utils.memberships.listMyTiers.invalidate()}
        />
      )}
    </main>
  );
}

interface TierData {
  id: string;
  name: string;
  description: string | null;
  priceKobo: number;
  interval: "monthly" | "annually";
  perks: string[] | null;
  paystackPlanCode: string | null;
  isActive: boolean;
}

function TierCard({
  tier,
  onEdit,
  onArchive,
}: {
  tier: TierData;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const archive = trpc.memberships.archiveTier.useMutation({
    onSuccess: () => {
      toast.success(`Archived "${tier.name}"`);
      onArchive();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div
      className={cn(
        "relative rounded-3xl border-2 p-6",
        tier.isActive
          ? "border-kunu-ink/8 bg-kunu-cream"
          : "border-kunu-ink/8 bg-kunu-cream-deep/30 opacity-70",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-display text-xl font-semibold leading-tight text-kunu-ink">
            {tier.name}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-display text-xl font-semibold leading-none text-kunu-terracotta whitespace-nowrap">
            {formatNaira(tier.priceKobo)}
          </div>
          <div className="mt-0.5 text-[10px] text-kunu-clay">
            /{tier.interval}
          </div>
        </div>
      </div>
      {tier.description && (
        <p className="mt-2 text-sm text-kunu-ink-soft text-pretty">
          {tier.description}
        </p>
      )}

      {tier.perks && tier.perks.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm text-kunu-ink-soft">
          {tier.perks.map((p, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-kunu-green" strokeWidth={3} />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs">
          {tier.isActive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-kunu-green/10 px-2 py-0.5 font-semibold text-kunu-green">
              <span className="h-1.5 w-1.5 rounded-full bg-kunu-green" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-kunu-clay/15 px-2 py-0.5 font-semibold uppercase tracking-wider text-kunu-clay">
              Archived
            </span>
          )}
          {!tier.paystackPlanCode && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
              <AlertTriangle className="h-3 w-3" />
              No plan code
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          {tier.isActive && (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1 rounded-full border border-kunu-ink/10 bg-kunu-cream px-3 py-1.5 text-xs font-semibold text-kunu-ink hover:border-kunu-terracotta hover:text-kunu-terracotta"
              >
                <Edit3 className="h-3 w-3" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => archive.mutate({ tierId: tier.id })}
                disabled={archive.isPending}
                className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-transparent px-3 py-1.5 text-xs font-semibold text-red-600 hover:border-red-500 hover:bg-red-50 disabled:opacity-60"
              >
                <Archive className="h-3 w-3" />
                Archive
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TierDialog({
  mode,
  tier,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  tier?: TierData;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(tier?.name ?? "");
  const [description, setDescription] = useState(tier?.description ?? "");
  const [priceKobo, setPriceKobo] = useState(tier?.priceKobo ?? 100000);
  const [customPrice, setCustomPrice] = useState("");
  const [interval, setInterval] = useState<Interval>(tier?.interval ?? "monthly");
  const [perks, setPerks] = useState<string[]>(tier?.perks ?? [""]);

  const create = trpc.memberships.createTier.useMutation({
    onSuccess: () => {
      toast.success(`Tier "${name}" created.`);
      onSaved();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });
  const update = trpc.memberships.updateTier.useMutation({
    onSuccess: () => {
      toast.success("Tier updated.");
      onSaved();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const submitting = create.isPending || update.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPerks = perks.map((p) => p.trim()).filter(Boolean);

    if (mode === "edit" && tier) {
      update.mutate({
        tierId: tier.id,
        name,
        description,
        perks: cleanedPerks,
      });
      return;
    }

    const priceFromCustom = customPrice
      ? Math.round(Number(customPrice) * 100)
      : null;
    const finalPrice =
      priceFromCustom && priceFromCustom >= 50000 && priceFromCustom <= 5000000
        ? priceFromCustom
        : priceKobo;

    create.mutate({
      name: name.trim(),
      description: description.trim(),
      priceKobo: finalPrice,
      interval,
      perks: cleanedPerks,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      <div
        className="absolute inset-0 bg-kunu-night/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border-2 border-kunu-ink/10 bg-kunu-cream p-7 shadow-[0_30px_60px_-30px_rgba(31,22,17,0.5)]"
      >
        <h2 className="font-display text-2xl font-semibold text-kunu-ink">
          {mode === "create" ? "New tier" : `Edit "${tier?.name}"`}
        </h2>
        <p className="mt-1 text-sm text-kunu-ink-soft">
          {mode === "create"
            ? "Set the price + interval once — Paystack plans can't change those later."
            : "Price + interval are locked. Update name, description, and perks."}
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <Label htmlFor="tier-name">Name</Label>
            <Input
              id="tier-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bronze Supporter"
              required
              maxLength={60}
            />
          </div>
          <div>
            <Label htmlFor="tier-desc">Short description</Label>
            <textarea
              id="tier-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="What do supporters get for joining at this level?"
              className="w-full rounded-xl border-2 border-kunu-ink/15 bg-kunu-cream px-4 py-3 font-sans text-base text-kunu-ink placeholder:text-kunu-clay/60 focus:border-kunu-terracotta focus:outline-none"
            />
          </div>

          {mode === "create" && (
            <>
              <div>
                <Label>Price</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_PRICES.map((price) => (
                    <button
                      key={price}
                      type="button"
                      onClick={() => {
                        setPriceKobo(price);
                        setCustomPrice("");
                      }}
                      className={cn(
                        "rounded-xl border-2 py-2.5 text-center font-display text-sm font-semibold transition-all",
                        priceKobo === price && !customPrice
                          ? "border-kunu-terracotta bg-kunu-terracotta text-kunu-cream"
                          : "border-kunu-ink/10 bg-kunu-cream text-kunu-ink hover:border-kunu-terracotta/40",
                      )}
                    >
                      {formatNaira(price)}
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <Input
                    type="number"
                    min={500}
                    max={50000}
                    step={50}
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="Custom (₦500 – ₦50,000)"
                  />
                </div>
              </div>
              <div>
                <Label>Interval</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["monthly", "annually"] as const).map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setInterval(i)}
                      className={cn(
                        "rounded-xl border-2 py-2.5 text-center font-display text-sm font-semibold capitalize transition-all",
                        interval === i
                          ? "border-kunu-terracotta bg-kunu-terracotta text-kunu-cream"
                          : "border-kunu-ink/10 bg-kunu-cream text-kunu-ink hover:border-kunu-terracotta/40",
                      )}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <Label>Perks (up to 10)</Label>
            <ul className="space-y-2">
              {perks.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <Input
                    value={p}
                    onChange={(e) => {
                      const next = [...perks];
                      next[i] = e.target.value;
                      setPerks(next);
                    }}
                    placeholder={`Perk ${i + 1}`}
                    maxLength={120}
                  />
                  {perks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPerks(perks.filter((_, j) => j !== i))}
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-kunu-ink/10 text-kunu-clay hover:border-red-500 hover:text-red-500"
                      aria-label="Remove perk"
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {perks.length < 10 && (
              <button
                type="button"
                onClick={() => setPerks([...perks, ""])}
                className="mt-2 text-sm font-medium text-kunu-terracotta hover:underline"
              >
                + Add another perk
              </button>
            )}
          </div>
        </div>

        <div className="mt-7 flex items-center justify-end gap-3 border-t border-kunu-ink/10 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-kunu-ink-soft hover:text-kunu-ink"
          >
            Cancel
          </button>
          <Button type="submit" loading={submitting} disabled={submitting}>
            {mode === "create" ? "Create tier" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
