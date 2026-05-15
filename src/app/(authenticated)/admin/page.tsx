import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { ShieldCheck, Users2, Sparkles, Banknote, Heart } from "lucide-react";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/users";
import { creatorProfiles, walletBalances } from "@/server/db/schema/creators";
import { tips } from "@/server/db/schema/tips";
import {
  subscriptions,
  subscriptionCharges,
  membershipTiers,
} from "@/server/db/schema/memberships";
import { payouts } from "@/server/db/schema/payouts";
import { formatNaira } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  // Aggregates — five small parallel queries
  const [
    userCounts,
    creatorCounts,
    tipAgg,
    subAgg,
    payoutAgg,
    recentTips,
    recentSubs,
    recentPayouts,
  ] = await Promise.all([
    db
      .select({
        users: sql<number>`count(*)`.mapWith(Number),
        creators: sql<number>`count(*) filter (where ${users.isCreator} = true)`.mapWith(
          Number,
        ),
      })
      .from(users),
    db
      .select({
        publishedCreators: sql<number>`count(*) filter (where ${creatorProfiles.isPublished} = true)`.mapWith(
          Number,
        ),
        totalProfiles: sql<number>`count(*)`.mapWith(Number),
      })
      .from(creatorProfiles),
    db
      .select({
        paidTips: sql<number>`count(*) filter (where ${tips.status} = 'paid')`.mapWith(
          Number,
        ),
        grossKobo: sql<number>`coalesce(sum(${tips.amountKobo}) filter (where ${tips.status} = 'paid'), 0)`.mapWith(
          Number,
        ),
        netKobo: sql<number>`coalesce(sum(${tips.netKobo}) filter (where ${tips.status} = 'paid'), 0)`.mapWith(
          Number,
        ),
      })
      .from(tips),
    db
      .select({
        activeSubs: sql<number>`count(*) filter (where ${subscriptions.status} = 'active' and ${subscriptions.paystackSubscriptionCode} is not null)`.mapWith(
          Number,
        ),
        totalSubs: sql<number>`count(*) filter (where ${subscriptions.paystackSubscriptionCode} is not null)`.mapWith(
          Number,
        ),
        chargesKobo: sql<number>`coalesce((select sum(${subscriptionCharges.amountKobo}) from ${subscriptionCharges}), 0)`.mapWith(
          Number,
        ),
      })
      .from(subscriptions),
    db
      .select({
        successCount: sql<number>`count(*) filter (where ${payouts.status} = 'success')`.mapWith(
          Number,
        ),
        successKobo: sql<number>`coalesce(sum(${payouts.amountKobo}) filter (where ${payouts.status} = 'success'), 0)`.mapWith(
          Number,
        ),
        pendingCount: sql<number>`count(*) filter (where ${payouts.status} in ('requested','processing'))`.mapWith(
          Number,
        ),
        failedCount: sql<number>`count(*) filter (where ${payouts.status} in ('failed','reversed'))`.mapWith(
          Number,
        ),
      })
      .from(payouts),
    db
      .select({
        id: tips.id,
        creatorUserId: tips.creatorUserId,
        supporterName: tips.supporterName,
        amountKobo: tips.amountKobo,
        kunuCount: tips.kunuCount,
        paidAt: tips.paidAt,
      })
      .from(tips)
      .where(eq(tips.status, "paid"))
      .orderBy(desc(tips.paidAt))
      .limit(10),
    db
      .select({
        id: subscriptions.id,
        creatorUserId: subscriptions.creatorUserId,
        supporterEmail: subscriptions.supporterEmail,
        tierName: membershipTiers.name,
        priceKobo: membershipTiers.priceKobo,
        status: subscriptions.status,
        startedAt: subscriptions.startedAt,
      })
      .from(subscriptions)
      .innerJoin(membershipTiers, eq(subscriptions.tierId, membershipTiers.id))
      .orderBy(desc(subscriptions.startedAt))
      .limit(10),
    db
      .select({
        id: payouts.id,
        creatorUserId: payouts.creatorUserId,
        amountKobo: payouts.amountKobo,
        status: payouts.status,
        requestedAt: payouts.requestedAt,
      })
      .from(payouts)
      .orderBy(desc(payouts.requestedAt))
      .limit(10),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-kunu-ink/8 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-kunu-ink">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-kunu-ink sm:text-5xl">
            System overview
          </h1>
          <p className="mt-2 text-base text-kunu-ink-soft">
            Everything happening on Buy Me Kunu, all at once.
          </p>
        </div>
        <nav className="flex gap-2 text-sm">
          <Link
            href="/admin/creators"
            className="rounded-full border-2 border-kunu-ink/10 bg-kunu-cream px-4 py-2 font-semibold text-kunu-ink hover:border-kunu-terracotta hover:text-kunu-terracotta"
          >
            All creators →
          </Link>
          <Link
            href="/admin/payouts"
            className="rounded-full border-2 border-kunu-ink/10 bg-kunu-cream px-4 py-2 font-semibold text-kunu-ink hover:border-kunu-terracotta hover:text-kunu-terracotta"
          >
            All payouts →
          </Link>
        </nav>
      </header>

      {/* Stat grid */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<Users2 className="h-4 w-4" />}
          label="Users"
          value={(userCounts[0]?.users ?? 0).toLocaleString()}
          hint={`${userCounts[0]?.creators ?? 0} creators`}
        />
        <Stat
          icon={<Sparkles className="h-4 w-4" />}
          label="Published"
          value={(creatorCounts[0]?.publishedCreators ?? 0).toLocaleString()}
          hint={`${creatorCounts[0]?.totalProfiles ?? 0} total profiles`}
        />
        <Stat
          icon={<Heart className="h-4 w-4" />}
          label="Tips paid"
          value={(tipAgg[0]?.paidTips ?? 0).toLocaleString()}
          hint={`${formatNaira(tipAgg[0]?.grossKobo ?? 0)} gross`}
        />
        <Stat
          icon={<Banknote className="h-4 w-4" />}
          label="Active subs"
          value={(subAgg[0]?.activeSubs ?? 0).toLocaleString()}
          hint={`${formatNaira(subAgg[0]?.chargesKobo ?? 0)} from renewals`}
        />
      </section>

      <section className="mt-4 grid gap-4 sm:grid-cols-3">
        <Stat
          icon={<Banknote className="h-4 w-4" />}
          label="Payouts paid"
          value={(payoutAgg[0]?.successCount ?? 0).toLocaleString()}
          hint={formatNaira(payoutAgg[0]?.successKobo ?? 0)}
          accent
        />
        <Stat
          icon={<Banknote className="h-4 w-4" />}
          label="Payouts in flight"
          value={(payoutAgg[0]?.pendingCount ?? 0).toLocaleString()}
          hint="requested + processing"
        />
        <Stat
          icon={<Banknote className="h-4 w-4" />}
          label="Payouts failed"
          value={(payoutAgg[0]?.failedCount ?? 0).toLocaleString()}
          hint="needs review"
          danger={(payoutAgg[0]?.failedCount ?? 0) > 0}
        />
      </section>

      {/* Three recent-activity panels */}
      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        <Panel title="Recent tips">
          {recentTips.length === 0 ? (
            <EmptyRow label="No paid tips yet." />
          ) : (
            <ul className="space-y-2">
              {recentTips.map((t) => (
                <li key={t.id} className="rounded-xl border border-kunu-ink/8 bg-kunu-cream p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-semibold text-kunu-ink">
                      {t.supporterName?.trim() || "Anonymous"}
                    </span>
                    <span className="font-display text-sm font-semibold text-kunu-terracotta">
                      {t.kunuCount}🥤 · {formatNaira(t.amountKobo)}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-kunu-clay">
                    {t.paidAt ? new Date(t.paidAt).toLocaleString("en-NG") : "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent subscriptions">
          {recentSubs.length === 0 ? (
            <EmptyRow label="No subscriptions yet." />
          ) : (
            <ul className="space-y-2">
              {recentSubs.map((s) => (
                <li key={s.id} className="rounded-xl border border-kunu-ink/8 bg-kunu-cream p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-semibold text-kunu-ink">
                      {s.supporterEmail}
                    </span>
                    <StatusDot status={s.status} />
                  </div>
                  <div className="mt-0.5 text-xs text-kunu-ink-soft">
                    {s.tierName} · {formatNaira(s.priceKobo)}
                  </div>
                  <div className="mt-1 text-[10px] text-kunu-clay">
                    Started {new Date(s.startedAt).toLocaleString("en-NG")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent payouts">
          {recentPayouts.length === 0 ? (
            <EmptyRow label="No payouts yet." />
          ) : (
            <ul className="space-y-2">
              {recentPayouts.map((p) => (
                <li key={p.id} className="rounded-xl border border-kunu-ink/8 bg-kunu-cream p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-semibold text-kunu-ink">
                      {formatNaira(p.amountKobo)}
                    </span>
                    <StatusDot status={p.status} />
                  </div>
                  <div className="mt-1 text-[10px] text-kunu-clay">
                    Requested {new Date(p.requestedAt).toLocaleString("en-NG")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  accent,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
  danger?: boolean;
}) {
  const baseClass = accent
    ? "border-kunu-terracotta-deep/30 bg-kunu-terracotta text-kunu-cream"
    : danger
      ? "border-red-500/30 bg-red-500/5 text-kunu-ink"
      : "border-kunu-ink/8 bg-kunu-cream text-kunu-ink";
  return (
    <div className={`rounded-2xl border-2 p-5 ${baseClass}`}>
      <div
        className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${
          accent ? "text-kunu-cream/80" : danger ? "text-red-600" : "text-kunu-clay"
        }`}
      >
        {icon}
        {label}
      </div>
      <div className="mt-1.5 font-display text-2xl font-semibold tabular-nums">
        {value}
      </div>
      <div
        className={`mt-1 text-xs ${
          accent ? "text-kunu-cream/70" : danger ? "text-red-600/80" : "text-kunu-clay"
        }`}
      >
        {hint}
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-kunu-ink/8 bg-kunu-cream-deep/30 p-4">
      <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-kunu-clay">
        {title}
      </h2>
      {children}
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return <p className="text-sm text-kunu-clay">{label}</p>;
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-kunu-green/15 text-kunu-green",
    "non-renewing": "bg-kunu-ochre/30 text-kunu-terracotta-deep",
    attention: "bg-kunu-ochre/30 text-kunu-terracotta-deep",
    cancelled: "bg-kunu-clay/15 text-kunu-clay",
    completed: "bg-kunu-clay/15 text-kunu-clay",
    requested: "bg-kunu-clay/15 text-kunu-clay",
    processing: "bg-kunu-ochre/30 text-kunu-terracotta-deep",
    success: "bg-kunu-green/15 text-kunu-green",
    failed: "bg-red-500/15 text-red-600",
    reversed: "bg-red-500/15 text-red-600",
  };
  const cls = map[status] ?? "bg-kunu-clay/15 text-kunu-clay";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}
    >
      {status}
    </span>
  );
}
