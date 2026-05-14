import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, desc, eq, sql } from "drizzle-orm";
import { ArrowLeft, ArrowUpRight, Mail, Users } from "lucide-react";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { tips } from "@/server/db/schema/tips";
import { formatNaira } from "@/lib/utils";
import { KunuCupGlyph } from "@/components/landing/KunuCupGlyph";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

export default async function SupportersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");
  const user = session.user;

  const [summary] = await db
    .select({
      tipCount: sql<number>`count(*)`.mapWith(Number),
      grossKobo: sql<number>`coalesce(sum(${tips.amountKobo}), 0)`.mapWith(Number),
      netKobo: sql<number>`coalesce(sum(${tips.netKobo}), 0)`.mapWith(Number),
      kunus: sql<number>`coalesce(sum(${tips.kunuCount}), 0)`.mapWith(Number),
      supporters: sql<number>`count(distinct ${tips.supporterEmail})`.mapWith(Number),
    })
    .from(tips)
    .where(and(eq(tips.creatorUserId, user.id), eq(tips.status, "paid")));

  const rows = await db
    .select({
      id: tips.id,
      supporterName: tips.supporterName,
      kunuCount: tips.kunuCount,
      amountKobo: tips.amountKobo,
      netKobo: tips.netKobo,
      message: tips.message,
      paidAt: tips.paidAt,
      isPublic: tips.isPublic,
      paystackChannel: tips.paystackChannel,
    })
    .from(tips)
    .where(and(eq(tips.creatorUserId, user.id), eq(tips.status, "paid")))
    .orderBy(desc(tips.paidAt))
    .limit(PAGE_SIZE);

  const isEmpty = (summary?.tipCount ?? 0) === 0;

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
            Supporters
          </h1>
          <p className="mt-2 text-base text-kunu-ink-soft">
            Everyone who's poured you a kunu, newest first.
          </p>
        </div>
        {user.username && (
          <Link
            href={`/@${user.username}`}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-kunu-ink/10 bg-kunu-cream px-4 py-2 text-sm font-semibold text-kunu-ink hover:border-kunu-terracotta hover:text-kunu-terracotta"
          >
            View public page
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </header>

      {/* Summary cards */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<Users className="h-4 w-4" />}
          label="Unique supporters"
          value={(summary?.supporters ?? 0).toLocaleString()}
        />
        <SummaryCard
          icon={<span className="text-lg leading-none">🥤</span>}
          label="Kunus received"
          value={(summary?.kunus ?? 0).toLocaleString()}
        />
        <SummaryCard
          icon={<Mail className="h-4 w-4" />}
          label="Gross"
          value={formatNaira(summary?.grossKobo ?? 0)}
        />
        <SummaryCard
          icon={<Mail className="h-4 w-4" />}
          label="Net (after fees)"
          value={formatNaira(summary?.netKobo ?? 0)}
          accent
        />
      </section>

      {isEmpty ? (
        <section className="mt-10 rounded-3xl border-2 border-dashed border-kunu-ink/15 bg-kunu-cream-deep/30 p-12 text-center">
          <KunuCupGlyph size={64} fillLevel={0.05} animate={false} />
          <h2 className="mt-4 font-display text-2xl font-semibold text-kunu-ink">
            No supporters yet.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-kunu-ink-soft">
            Share your page. The first tip lands here the moment it clears.
          </p>
          {user.username && (
            <Link
              href={`/@${user.username}`}
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-kunu-terracotta px-5 py-2.5 text-sm font-semibold text-kunu-cream hover:bg-kunu-terracotta-deep"
            >
              See my page
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </section>
      ) : (
        <section className="mt-10">
          <ul className="space-y-2">
            {rows.map((tip) => (
              <li
                key={tip.id}
                className="group rounded-2xl border-2 border-kunu-ink/8 bg-kunu-cream p-5 transition-colors hover:border-kunu-terracotta/40"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="font-display text-base font-semibold text-kunu-ink">
                      {tip.supporterName?.trim() || "Anonymous"}
                    </div>
                    {!tip.isPublic && (
                      <span className="rounded-full bg-kunu-clay/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-kunu-clay">
                        private
                      </span>
                    )}
                    {tip.paystackChannel && (
                      <span className="rounded-full bg-kunu-ink/5 px-2 py-0.5 text-[10px] font-medium text-kunu-clay">
                        {tip.paystackChannel}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-display text-sm font-semibold text-kunu-terracotta">
                      {tip.kunuCount} × 🥤 · {formatNaira(tip.amountKobo)}
                    </div>
                    <div className="text-xs text-kunu-clay">
                      net {formatNaira(tip.netKobo)}
                    </div>
                  </div>
                </div>
                {tip.message && (
                  <p className="mt-2.5 text-sm leading-relaxed text-kunu-ink-soft text-pretty">
                    "{tip.message}"
                  </p>
                )}
                <div className="mt-2.5 text-xs text-kunu-clay">
                  {tip.paidAt
                    ? new Date(tip.paidAt).toLocaleString("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "—"}
                </div>
              </li>
            ))}
          </ul>

          {rows.length >= PAGE_SIZE && (
            <p className="mt-6 text-center text-xs text-kunu-clay">
              Showing the most recent {PAGE_SIZE}. Pagination + filters coming
              soon.
            </p>
          )}
        </section>
      )}
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "rounded-2xl border-2 border-kunu-terracotta-deep/30 bg-kunu-terracotta p-5 text-kunu-cream"
          : "rounded-2xl border-2 border-kunu-ink/8 bg-kunu-cream p-5"
      }
    >
      <div
        className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${accent ? "text-kunu-cream/80" : "text-kunu-clay"}`}
      >
        {icon}
        {label}
      </div>
      <div
        className={`mt-1.5 font-display text-2xl font-semibold tabular-nums ${accent ? "" : "text-kunu-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}
