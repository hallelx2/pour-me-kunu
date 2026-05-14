import { notFound } from "next/navigation";
import { and, desc, eq, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/users";
import { creatorProfiles } from "@/server/db/schema/creators";
import { tips } from "@/server/db/schema/tips";
import { CreatorTipWidget } from "@/components/creator/CreatorTipWidget";
import { Nav } from "@/components/landing/Nav";
import { cn, formatNaira } from "@/lib/utils";

const ACCENT_TO_GRADIENT: Record<string, string> = {
  terracotta: "from-kunu-terracotta/60 via-kunu-ochre/40 to-kunu-cream-deep",
  ochre: "from-kunu-ochre/70 via-kunu-cream-deep to-kunu-cream",
  green: "from-kunu-green/60 via-kunu-green-soft/40 to-kunu-cream-deep",
  clay: "from-kunu-clay/55 via-kunu-cream-deep to-kunu-cream",
};

interface PageProps {
  params: Promise<{ username: string }>;
}

async function loadCreator(usernameRaw: string) {
  const username = usernameRaw.toLowerCase();
  const user = await db.query.users.findFirst({
    where: eq(sql`lower(${users.username})`, username),
    columns: {
      id: true,
      name: true,
      username: true,
      image: true,
      avatarUrl: true,
      isCreator: true,
    },
  });
  if (!user || !user.username) return null;
  const profile = await db.query.creatorProfiles.findFirst({
    where: eq(creatorProfiles.userId, user.id),
  });
  return { user, profile };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const found = await loadCreator(username);
  if (!found || !found.profile) {
    return {
      title: `@${username.toLowerCase()} on Buy Me Kunu`,
    };
  }
  const { user, profile } = found;
  return {
    title: `${profile.displayName} (@${user.username}) — Buy Me Kunu`,
    description:
      profile.tagline ??
      `Support ${profile.displayName} with a ${profile.kunuLabel} on Buy Me Kunu.`,
  };
}

export default async function CreatorPage({ params }: PageProps) {
  const { username } = await params;
  const found = await loadCreator(username);

  if (!found) {
    notFound();
  }

  const { user, profile } = found;
  const handle = user.username!;

  // Profile exists but not published yet → soft empty state
  if (!profile || !profile.isPublished) {
    return (
      <>
        <Nav />
        <main className="pt-24">
          <div className="mx-auto max-w-2xl px-6 py-20 text-center sm:px-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-kunu-cream-deep text-3xl">
              🥤
            </div>
            <h1 className="mt-6 font-display text-4xl font-semibold text-kunu-ink">
              @{handle} hasn't poured a page yet.
            </h1>
            <p className="mt-3 text-base text-kunu-ink-soft">
              This handle is claimed but the creator hasn't published their page.
              Check back soon.
            </p>
          </div>
        </main>
      </>
    );
  }

  const accentGradient =
    ACCENT_TO_GRADIENT[profile.accentColor] ?? ACCENT_TO_GRADIENT.terracotta;

  return (
    <>
      <Nav />
      <main>
        {/* Cover */}
        <div
          className={cn(
            "relative h-48 w-full bg-gradient-to-br sm:h-64",
            accentGradient,
          )}
          style={
            profile.coverUrl
              ? {
                  backgroundImage: `url(${profile.coverUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-adinkra-pattern opacity-25" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-kunu-cream to-transparent" />
        </div>

        {/* Profile header (overlapping cover) */}
        <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-12">
          <div className="relative -mt-12 flex flex-wrap items-end gap-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-kunu-cream bg-kunu-cream-deep ring-2 ring-kunu-terracotta/30 sm:h-28 sm:w-28">
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">
                  {profile.kunuEmoji}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 pb-2">
              <h1 className="font-display text-3xl font-semibold leading-tight text-kunu-ink sm:text-4xl">
                {profile.displayName}
              </h1>
              <p className="mt-1 text-sm font-medium text-kunu-terracotta">
                @{handle}
              </p>
              {profile.tagline && (
                <p className="mt-2 text-base text-kunu-ink-soft">
                  {profile.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Two-column: about + tip widget */}
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
            <section>
              <h2 className="font-display text-xl font-semibold text-kunu-ink">
                About
              </h2>
              {profile.bio ? (
                <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-kunu-ink-soft text-pretty">
                  {profile.bio}
                </p>
              ) : (
                <p className="mt-3 text-base text-kunu-clay">
                  {profile.displayName} hasn't written a bio yet.
                </p>
              )}

              {/* Supporters wall */}
              <SupportersWall
                creatorUserId={user.id}
                firstName={profile.displayName.split(" ")[0]}
                kunuLabel={profile.kunuLabel}
              />

            </section>

            <aside className="lg:sticky lg:top-24">
              <CreatorTipWidget
                creator={{
                  username: handle,
                  displayName: profile.displayName,
                  kunuPriceKobo: profile.kunuPriceKobo,
                  kunuLabel: profile.kunuLabel,
                  kunuEmoji: profile.kunuEmoji,
                  accentColor: profile.accentColor,
                }}
              />
              <p className="mt-3 text-center text-xs text-kunu-clay">
                Payments processed by Paystack. NGN only for now.
              </p>
            </aside>
          </div>
        </div>

        <footer className="mt-20 border-t border-kunu-ink/8 bg-kunu-cream-deep/30 py-10 text-center text-xs text-kunu-clay">
          Powered by{" "}
          <a
            href="/"
            className="font-display font-semibold text-kunu-ink hover:text-kunu-terracotta"
          >
            Buy Me Kunu
          </a>{" "}
          · the home for African creators.
        </footer>
      </main>
    </>
  );
}

async function SupportersWall({
  creatorUserId,
  firstName,
  kunuLabel,
}: {
  creatorUserId: string;
  firstName: string;
  kunuLabel: string;
}) {
  const recent = await db
    .select({
      id: tips.id,
      supporterName: tips.supporterName,
      kunuCount: tips.kunuCount,
      amountKobo: tips.amountKobo,
      message: tips.message,
      paidAt: tips.paidAt,
    })
    .from(tips)
    .where(
      and(
        eq(tips.creatorUserId, creatorUserId),
        eq(tips.status, "paid"),
        eq(tips.isPublic, true),
      ),
    )
    .orderBy(desc(tips.paidAt))
    .limit(20);

  return (
    <section className="mt-12">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-semibold text-kunu-ink">
          Supporters
        </h2>
        {recent.length > 0 && (
          <span className="text-xs text-kunu-clay">
            {recent.length}+ recent
          </span>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="mt-3 rounded-2xl border-2 border-dashed border-kunu-ink/12 bg-kunu-cream-deep/30 p-8 text-center">
          <Heart className="mx-auto h-6 w-6 text-kunu-terracotta" />
          <p className="mt-2 text-sm text-kunu-ink-soft">
            Be the first to send {firstName} a {kunuLabel}.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {recent.map((tip) => (
            <li
              key={tip.id}
              className="rounded-2xl border-2 border-kunu-ink/8 bg-kunu-cream p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-display text-sm font-semibold text-kunu-ink">
                  {tip.supporterName?.trim() || "Anonymous"}
                </div>
                <div className="shrink-0 text-xs font-medium text-kunu-terracotta">
                  {tip.kunuCount} × {kunuLabel}
                  {tip.kunuCount > 1 ? "s" : ""} · {formatNaira(tip.amountKobo)}
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
      )}
    </section>
  );
}
