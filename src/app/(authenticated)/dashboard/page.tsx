import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, desc, eq, sql } from "drizzle-orm";
import { ArrowUpRight, Eye, Settings } from "lucide-react";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { creatorProfiles, walletBalances } from "@/server/db/schema/creators";
import { tips } from "@/server/db/schema/tips";
import { formatNaira } from "@/lib/utils";
import { KunuCupGlyph } from "@/components/landing/KunuCupGlyph";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");
  const user = session.user;

  const profile = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, user.id),
  });
  const wallet = await db.query.walletBalances.findFirst({
    where: eq(walletBalances.creatorUserId, user.id),
  });

  if (!profile) {
    redirect("/onboarding/creator");
  }

  const [counts] = await db
    .select({
      totalKunus: sql<number>`coalesce(sum(${tips.kunuCount}), 0)`.mapWith(Number),
      supporters: sql<number>`count(distinct ${tips.supporterEmail})`.mapWith(Number),
      tipCount: sql<number>`count(*)`.mapWith(Number),
    })
    .from(tips)
    .where(and(eq(tips.creatorUserId, user.id), eq(tips.status, "paid")));

  const recentTips = await db
    .select({
      id: tips.id,
      supporterName: tips.supporterName,
      kunuCount: tips.kunuCount,
      amountKobo: tips.amountKobo,
      netKobo: tips.netKobo,
      message: tips.message,
      paidAt: tips.paidAt,
      isPublic: tips.isPublic,
    })
    .from(tips)
    .where(and(eq(tips.creatorUserId, user.id), eq(tips.status, "paid")))
    .orderBy(desc(tips.paidAt))
    .limit(10);

  const handle = user.username;
  const hasReceivedTips = (counts?.tipCount ?? 0) > 0;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:px-8 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-kunu-clay">Dashboard</p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-kunu-ink sm:text-5xl">
            Hi {user.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          {handle && (
            <p className="mt-2 text-base text-kunu-ink-soft">
              Your page:{" "}
              <Link
                href={`/@${handle}`}
                className="font-display font-semibold text-kunu-terracotta hover:underline"
              >
                buymekunu.com/@{handle}
              </Link>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/@${handle}`}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-kunu-ink/10 bg-kunu-cream px-4 py-2 text-sm font-semibold text-kunu-ink hover:border-kunu-terracotta hover:text-kunu-terracotta"
          >
            <Eye className="h-4 w-4" />
            View page
          </Link>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-1.5 rounded-full bg-kunu-ink px-4 py-2 text-sm font-semibold text-kunu-cream hover:bg-kunu-night"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </header>

      {/* Wallet cards */}
      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Available"
          value={formatNaira(wallet?.availableKobo ?? 0)}
          hint="Ready to withdraw"
        />
        <StatCard
          label="Pending"
          value={formatNaira(wallet?.pendingKobo ?? 0)}
          hint="Clearing soon"
        />
        <StatCard
          label="Lifetime"
          value={formatNaira(wallet?.lifetimeKobo ?? 0)}
          hint="All time gross"
          accent
        />
      </section>

      {/* Activity cards */}
      <section className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Kunus received"
          value={(counts?.totalKunus ?? 0).toLocaleString()}
          hint={`${counts?.tipCount ?? 0} tip${counts?.tipCount === 1 ? "" : "s"} total`}
          small
        />
        <StatCard
          label="Supporters"
          value={(counts?.supporters ?? 0).toLocaleString()}
          hint="Unique emails"
          small
        />
        <StatCard
          label="Kunu price"
          value={formatNaira(profile.kunuPriceKobo)}
          hint="Per kunu — change in settings"
          small
        />
      </section>

      {!hasReceivedTips ? (
        <section className="mt-10 rounded-3xl border-2 border-dashed border-kunu-ink/15 bg-kunu-cream-deep/30 p-10 text-center">
          <div className="mx-auto inline-flex">
            <KunuCupGlyph size={64} fillLevel={0.05} animate={false} />
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold text-kunu-ink">
            No kunus yet — share your page.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-kunu-ink-soft">
            Drop <span className="font-semibold">buymekunu.com/@{handle}</span>{" "}
            in your Twitter bio, Instagram, WhatsApp status — anywhere your
            audience already hangs out.
          </p>
          <div className="mt-6">
            <Link
              href={`/@${handle}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-kunu-terracotta px-5 py-2.5 text-sm font-semibold text-kunu-cream hover:bg-kunu-terracotta-deep"
            >
              See my page
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold text-kunu-ink">
            Recent tips
          </h2>
          <ul className="mt-4 space-y-2">
            {recentTips.map((tip) => (
              <li
                key={tip.id}
                className="rounded-2xl border-2 border-kunu-ink/8 bg-kunu-cream p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="font-display text-base font-semibold text-kunu-ink">
                      {tip.supporterName?.trim() || "Anonymous"}
                    </div>
                    {!tip.isPublic && (
                      <span className="rounded-full bg-kunu-clay/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-kunu-clay">
                        private
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-display font-semibold text-kunu-terracotta">
                    {tip.kunuCount} × 🥤 · {formatNaira(tip.amountKobo)}
                    <span className="ml-2 text-xs font-normal text-kunu-clay">
                      ({formatNaira(tip.netKobo)} after fees)
                    </span>
                  </div>
                </div>
                {tip.message && (
                  <p className="mt-2 text-sm leading-relaxed text-kunu-ink-soft text-pretty">
                    {tip.message}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-10 text-center text-xs text-kunu-clay">
        Set PAYSTACK_SECRET_KEY in Vercel env vars to enable real tips, then
        register the webhook URL{" "}
        <span className="font-mono">/api/paystack/webhook</span> in the Paystack
        dashboard.
      </p>
    </main>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
  small,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-3xl border-2 border-kunu-terracotta-deep/30 bg-kunu-terracotta p-6 text-kunu-cream"
          : "rounded-3xl border-2 border-kunu-ink/8 bg-kunu-cream p-6"
      }
    >
      <div
        className={`text-[10px] font-semibold uppercase tracking-wider ${accent ? "text-kunu-cream/80" : "text-kunu-clay"}`}
      >
        {label}
      </div>
      <div
        className={`mt-1.5 font-display font-semibold tabular-nums ${accent ? "" : "text-kunu-ink"} ${small ? "text-2xl" : "text-3xl"}`}
      >
        {value}
      </div>
      <div
        className={`mt-1 text-xs ${accent ? "text-kunu-cream/70" : "text-kunu-clay"}`}
      >
        {hint}
      </div>
    </div>
  );
}
