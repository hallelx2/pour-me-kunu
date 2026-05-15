import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/users";
import { creatorProfiles, walletBalances } from "@/server/db/schema/creators";
import { tips } from "@/server/db/schema/tips";
import { subscriptions } from "@/server/db/schema/memberships";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCreatorsPage() {
  // Pull creators + profile + wallet + supporter counts in one query
  const rows = await db
    .select({
      userId: users.id,
      username: users.username,
      name: users.name,
      email: users.email,
      isCreator: users.isCreator,
      createdAt: users.createdAt,
      displayName: creatorProfiles.displayName,
      isPublished: creatorProfiles.isPublished,
      kunuPriceKobo: creatorProfiles.kunuPriceKobo,
      availableKobo: walletBalances.availableKobo,
      lifetimeKobo: walletBalances.lifetimeKobo,
    })
    .from(users)
    .leftJoin(creatorProfiles, eq(creatorProfiles.userId, users.id))
    .leftJoin(walletBalances, eq(walletBalances.creatorUserId, users.id))
    .orderBy(desc(users.createdAt));

  // Per-creator paid tip counts (cheap aggregate)
  const tipCounts = await db
    .select({
      creatorUserId: tips.creatorUserId,
      paidTips: sql<number>`count(*) filter (where ${tips.status} = 'paid')`.mapWith(
        Number,
      ),
      supporters: sql<number>`count(distinct ${tips.supporterEmail}) filter (where ${tips.status} = 'paid')`.mapWith(
        Number,
      ),
    })
    .from(tips)
    .groupBy(tips.creatorUserId);

  const tipMap = new Map(tipCounts.map((c) => [c.creatorUserId, c]));

  const subCounts = await db
    .select({
      creatorUserId: subscriptions.creatorUserId,
      activeSubs: sql<number>`count(*) filter (where ${subscriptions.status} = 'active' and ${subscriptions.paystackSubscriptionCode} is not null)`.mapWith(
        Number,
      ),
    })
    .from(subscriptions)
    .groupBy(subscriptions.creatorUserId);

  const subMap = new Map(subCounts.map((c) => [c.creatorUserId, c]));

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
        All creators
      </h1>
      <p className="mt-2 text-base text-kunu-ink-soft">
        Every account on the platform — published or not.
      </p>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[800px] border-separate border-spacing-y-1.5">
          <thead>
            <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-kunu-clay">
              <th className="px-3 py-2">Creator</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Published</th>
              <th className="px-3 py-2 text-right">Price</th>
              <th className="px-3 py-2 text-right">Tips</th>
              <th className="px-3 py-2 text-right">Active subs</th>
              <th className="px-3 py-2 text-right">Available</th>
              <th className="px-3 py-2 text-right">Lifetime</th>
              <th className="px-3 py-2">Joined</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const tipStat = tipMap.get(r.userId);
              const subStat = subMap.get(r.userId);
              return (
                <tr key={r.userId} className="bg-kunu-cream">
                  <td className="rounded-l-xl border-y border-l border-kunu-ink/8 px-3 py-3">
                    <div className="font-display text-sm font-semibold text-kunu-ink">
                      {r.displayName ?? r.name ?? "—"}
                    </div>
                    <div className="text-xs text-kunu-terracotta">
                      {r.username ? `@${r.username}` : "—"}
                    </div>
                  </td>
                  <td className="border-y border-kunu-ink/8 px-3 py-3 text-xs text-kunu-ink-soft">
                    {r.email}
                  </td>
                  <td className="border-y border-kunu-ink/8 px-3 py-3">
                    {r.isPublished ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-kunu-green/15 px-2 py-0.5 text-[10px] font-semibold text-kunu-green">
                        <span className="h-1.5 w-1.5 rounded-full bg-kunu-green" />
                        Live
                      </span>
                    ) : r.displayName ? (
                      <span className="inline-flex items-center rounded-full bg-kunu-ochre/30 px-2 py-0.5 text-[10px] font-semibold text-kunu-terracotta-deep">
                        Draft
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-kunu-clay/15 px-2 py-0.5 text-[10px] font-semibold text-kunu-clay">
                        No profile
                      </span>
                    )}
                  </td>
                  <td className="border-y border-kunu-ink/8 px-3 py-3 text-right text-xs tabular-nums">
                    {r.kunuPriceKobo ? formatNaira(r.kunuPriceKobo) : "—"}
                  </td>
                  <td className="border-y border-kunu-ink/8 px-3 py-3 text-right text-xs tabular-nums">
                    {tipStat?.paidTips ?? 0}
                    {tipStat?.supporters ? (
                      <span className="ml-1 text-kunu-clay">
                        ({tipStat.supporters})
                      </span>
                    ) : null}
                  </td>
                  <td className="border-y border-kunu-ink/8 px-3 py-3 text-right text-xs tabular-nums">
                    {subStat?.activeSubs ?? 0}
                  </td>
                  <td className="border-y border-kunu-ink/8 px-3 py-3 text-right text-xs tabular-nums font-semibold text-kunu-ink">
                    {formatNaira(r.availableKobo ?? 0)}
                  </td>
                  <td className="border-y border-kunu-ink/8 px-3 py-3 text-right text-xs tabular-nums text-kunu-clay">
                    {formatNaira(r.lifetimeKobo ?? 0)}
                  </td>
                  <td className="border-y border-kunu-ink/8 px-3 py-3 text-[10px] text-kunu-clay">
                    {new Date(r.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "2-digit",
                    })}
                  </td>
                  <td className="rounded-r-xl border-y border-r border-kunu-ink/8 px-3 py-3 text-right">
                    {r.username && r.isPublished && (
                      <Link
                        href={`/@${r.username}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-kunu-terracotta hover:underline"
                      >
                        View
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-kunu-clay">
        Showing {rows.length} accounts.
      </p>
    </main>
  );
}
