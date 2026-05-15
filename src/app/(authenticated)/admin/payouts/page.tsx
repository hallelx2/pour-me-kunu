import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/users";
import { creatorProfiles } from "@/server/db/schema/creators";
import { payouts } from "@/server/db/schema/payouts";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_CLASSES: Record<string, string> = {
  requested: "bg-kunu-clay/15 text-kunu-clay",
  processing: "bg-kunu-ochre/30 text-kunu-terracotta-deep",
  success: "bg-kunu-green/15 text-kunu-green",
  failed: "bg-red-500/15 text-red-600",
  reversed: "bg-red-500/15 text-red-600",
};

export default async function AdminPayoutsPage() {
  const rows = await db
    .select({
      id: payouts.id,
      amountKobo: payouts.amountKobo,
      status: payouts.status,
      failureReason: payouts.failureReason,
      transferCode: payouts.paystackTransferCode,
      reference: payouts.paystackReference,
      requestedAt: payouts.requestedAt,
      completedAt: payouts.completedAt,
      creatorUserId: payouts.creatorUserId,
      creatorName: users.name,
      creatorEmail: users.email,
      creatorUsername: users.username,
      creatorDisplayName: creatorProfiles.displayName,
      bankAccountName: creatorProfiles.payoutAccountName,
      bankAccountNumber: creatorProfiles.payoutAccountNumber,
    })
    .from(payouts)
    .innerJoin(users, eq(users.id, payouts.creatorUserId))
    .leftJoin(creatorProfiles, eq(creatorProfiles.userId, payouts.creatorUserId))
    .orderBy(desc(payouts.requestedAt));

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-kunu-clay hover:text-kunu-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to overview
      </Link>
      <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-kunu-ink sm:text-5xl">
        All payouts
      </h1>
      <p className="mt-2 text-base text-kunu-ink-soft">
        Every withdrawal request across the platform. Look here when a creator
        flags a stuck transfer.
      </p>

      {rows.length === 0 ? (
        <p className="mt-12 rounded-2xl border-2 border-dashed border-kunu-ink/15 bg-kunu-cream-deep/30 p-8 text-center text-sm text-kunu-clay">
          No payouts yet.
        </p>
      ) : (
        <ul className="mt-10 space-y-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border-2 border-kunu-ink/8 bg-kunu-cream p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <div className="font-display text-lg font-semibold text-kunu-ink">
                    {formatNaira(r.amountKobo)}
                  </div>
                  <div className="text-xs text-kunu-ink-soft">
                    {r.creatorDisplayName ?? r.creatorName ?? "—"}{" "}
                    {r.creatorUsername && (
                      <Link
                        href={`/@${r.creatorUsername}`}
                        className="font-medium text-kunu-terracotta hover:underline"
                      >
                        @{r.creatorUsername}
                      </Link>
                    )}
                    <span className="ml-2 text-kunu-clay">{r.creatorEmail}</span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    STATUS_CLASSES[r.status] ?? "bg-kunu-clay/15 text-kunu-clay"
                  }`}
                >
                  {r.status}
                </span>
              </div>

              {r.bankAccountName && (
                <div className="mt-2 text-xs text-kunu-ink-soft">
                  → {r.bankAccountName}
                  {r.bankAccountNumber && (
                    <span className="ml-1 text-kunu-clay">
                      ({r.bankAccountNumber})
                    </span>
                  )}
                </div>
              )}

              {r.failureReason && (
                <p className="mt-2 inline-flex items-start gap-1.5 text-xs text-red-600">
                  <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                  {r.failureReason}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-kunu-clay">
                <span>
                  Requested{" "}
                  {new Date(r.requestedAt).toLocaleString("en-NG")}
                </span>
                {r.completedAt && (
                  <span>
                    Completed{" "}
                    {new Date(r.completedAt).toLocaleString("en-NG")}
                  </span>
                )}
                <span className="font-mono">
                  ref: {r.reference}
                </span>
                {r.transferCode && (
                  <span className="font-mono">
                    transfer: {r.transferCode}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
