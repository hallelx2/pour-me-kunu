import Link from "next/link";
import { and, eq, sql } from "drizzle-orm";
import { ArrowLeft, Check, X } from "lucide-react";
import { db } from "@/server/db";
import { tips } from "@/server/db/schema/tips";
import { walletBalances, creatorProfiles } from "@/server/db/schema/creators";
import { users } from "@/server/db/schema/users";
import { verifyTransaction } from "@/server/paystack/client";
import { KunuCupGlyph } from "@/components/landing/KunuCupGlyph";
import { formatNaira } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{
    reference?: string;
    ref?: string;
    trxref?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function CheckoutCallbackPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const reference = sp.reference ?? sp.ref ?? sp.trxref;

  if (!reference) {
    return <ErrorState reason="No payment reference in the URL." />;
  }

  const tip = await db.query.tips.findFirst({
    where: eq(tips.paystackReference, reference),
  });

  if (!tip) {
    return <ErrorState reason="We couldn't find that payment." />;
  }

  // Race-safe: if the webhook already marked this paid, skip the verify call
  let resolved = tip;

  if (tip.status === "pending") {
    let verifyData;
    try {
      verifyData = await verifyTransaction(reference);
    } catch (err) {
      return (
        <ErrorState
          reason={
            err instanceof Error
              ? `Couldn't verify with Paystack: ${err.message}`
              : "Couldn't verify with Paystack."
          }
        />
      );
    }

    if (verifyData.status !== "success") {
      // Best effort — mark failed if still pending
      await db
        .update(tips)
        .set({ status: "failed", updatedAt: new Date() })
        .where(and(eq(tips.id, tip.id), eq(tips.status, "pending")));
      return (
        <ErrorState reason="Paystack reported the payment didn't go through." />
      );
    }

    // Compare-and-set: only one of {callback, webhook} wins the "paid" flip
    const [updated] = await db
      .update(tips)
      .set({
        status: "paid",
        paidAt: verifyData.paid_at
          ? new Date(verifyData.paid_at)
          : new Date(),
        paystackChannel: verifyData.channel,
        updatedAt: new Date(),
      })
      .where(and(eq(tips.id, tip.id), eq(tips.status, "pending")))
      .returning();

    if (updated) {
      resolved = updated;
      // Bump the creator's wallet — insert-or-update
      await db
        .insert(walletBalances)
        .values({
          creatorUserId: updated.creatorUserId,
          availableKobo: updated.netKobo,
          lifetimeKobo: updated.amountKobo,
        })
        .onConflictDoUpdate({
          target: walletBalances.creatorUserId,
          set: {
            availableKobo: sql`${walletBalances.availableKobo} + ${updated.netKobo}`,
            lifetimeKobo: sql`${walletBalances.lifetimeKobo} + ${updated.amountKobo}`,
            updatedAt: new Date(),
          },
        });
    }
  }

  // Look up creator info for the thank-you copy
  const creator = await db.query.users.findFirst({
    where: eq(users.id, resolved.creatorUserId),
    columns: { username: true, name: true },
  });
  const profile = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, resolved.creatorUserId),
  });

  const handle = creator?.username ?? "creator";
  const displayName = profile?.displayName ?? creator?.name ?? "the creator";

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-32 h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-kunu-ochre/40 via-kunu-terracotta/30 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-kunu-green/15 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-adinkra-pattern opacity-25 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="absolute inset-0 bg-grain opacity-40" />
      </div>

      <div className="mx-auto max-w-xl px-6 py-20 text-center sm:px-8">
        <div className="inline-flex">
          <KunuCupGlyph size={80} fillLevel={0.85} withStraw withSparkles animate={false} />
        </div>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-kunu-green/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-kunu-green">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
          Kunu delivered
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-kunu-ink sm:text-5xl">
          You just made {displayName.split(" ")[0]}'s day.
        </h1>
        <p className="mt-3 text-base text-kunu-ink-soft">
          {resolved.kunuCount} kunu{resolved.kunuCount > 1 ? "s" : ""} ·{" "}
          <span className="font-display font-semibold text-kunu-terracotta">
            {formatNaira(resolved.amountKobo)}
          </span>{" "}
          delivered. {displayName} will be notified.
        </p>

        {resolved.message && (
          <div className="mx-auto mt-6 max-w-md rounded-2xl border-2 border-kunu-ink/10 bg-kunu-cream-deep/40 p-4 text-left text-sm text-kunu-ink-soft">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-kunu-clay">
              Your message
            </p>
            <p className="mt-1.5">{resolved.message}</p>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/@${handle}`}
            className="inline-flex items-center gap-2 rounded-full bg-kunu-terracotta px-5 py-2.5 font-display text-sm font-semibold text-kunu-cream shadow-[0_8px_20px_-8px_rgba(200,81,44,0.6)] hover:bg-kunu-terracotta-deep"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to @{handle}
          </Link>
          <Link
            href="/"
            className="rounded-full border-2 border-kunu-ink/10 bg-kunu-cream px-5 py-2.5 font-display text-sm font-semibold text-kunu-ink hover:border-kunu-terracotta hover:text-kunu-terracotta"
          >
            Claim your own page
          </Link>
        </div>

        <p className="mt-8 text-xs text-kunu-clay">
          Reference: <span className="font-mono">{reference}</span>
        </p>
      </div>
    </main>
  );
}

function ErrorState({ reason }: { reason: string }) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-adinkra-pattern opacity-15" />
      </div>
      <div className="mx-auto max-w-xl px-6 py-20 text-center sm:px-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 text-red-600">
          <X className="h-8 w-8" strokeWidth={2.5} />
        </div>
        <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-kunu-ink">
          Something went wrong.
        </h1>
        <p className="mt-3 text-base text-kunu-ink-soft text-pretty">{reason}</p>
        <p className="mt-2 text-sm text-kunu-clay">
          If money was deducted, it'll auto-refund within a few business days.
          Reach out at support@buymekunu.com if you don't see it back.
        </p>
        <div className="mt-8 flex items-center justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-kunu-ink px-5 py-2.5 font-display text-sm font-semibold text-kunu-cream hover:bg-kunu-night"
          >
            <ArrowLeft className="h-4 w-4" />
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
