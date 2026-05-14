import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowUpRight, Eye, Settings } from "lucide-react";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { creatorProfiles, walletBalances } from "@/server/db/schema/creators";
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

  const needsOnboarding = !profile;
  if (needsOnboarding) {
    redirect("/onboarding/creator");
  }

  const handle = user.username;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:px-8 lg:px-12">
      {/* Header */}
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

      {/* Cards */}
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

      {/* Empty state — no tips yet */}
      <section className="mt-10 rounded-3xl border-2 border-dashed border-kunu-ink/15 bg-kunu-cream-deep/30 p-10 text-center">
        <div className="mx-auto inline-flex">
          <KunuCupGlyph size={64} fillLevel={0.05} animate={false} />
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold text-kunu-ink">
          No kunus yet — share your page.
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-kunu-ink-soft">
          Drop <span className="font-semibold">buymekunu.com/@{handle}</span> in
          your Twitter bio, Instagram, WhatsApp status — anywhere your audience
          already hangs out.
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

      <p className="mt-10 text-center text-xs text-kunu-clay">
        Paystack integration is coming. For now your page renders and supporters can
        see what you offer — actual payments unlock in the next release.
      </p>
    </main>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
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
        className={`mt-1.5 font-display text-3xl font-semibold tabular-nums ${accent ? "" : "text-kunu-ink"}`}
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
