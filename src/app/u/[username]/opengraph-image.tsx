import { ImageResponse } from "next/og";
import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/users";
import { creatorProfiles } from "@/server/db/schema/creators";

export const alt = "Buy Me Kunu creator page";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ username: string }>;
}

const ACCENT_BG: Record<string, { from: string; to: string; chip: string }> = {
  terracotta: { from: "#C8512C", to: "#E5A347", chip: "#8E3819" },
  ochre: { from: "#E5A347", to: "#F4D7A3", chip: "#8E3819" },
  green: { from: "#2D5F3F", to: "#5C8A6E", chip: "#1A3A26" },
  clay: { from: "#7A5C45", to: "#B49680", chip: "#1F1611" },
};

export default async function CreatorOpenGraphImage({ params }: Props) {
  const { username } = await params;
  const usernameRaw = username.toLowerCase();

  // Fetch creator data — same shape as the page itself
  const user = await db.query.users.findFirst({
    where: eq(sql`lower(${users.username})`, usernameRaw),
    columns: { id: true, username: true, name: true },
  });

  const profile = user
    ? await db.query.creatorProfiles.findFirst({
        where: eq(creatorProfiles.userId, user.id),
      })
    : null;

  // Fall back to the brand OG if creator doesn't exist or hasn't published
  if (!user || !profile || !profile.isPublished) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "#FBF5EC",
            color: "#1F1611",
            fontFamily: "serif",
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 700 }}>
            @{usernameRaw}
          </div>
          <div style={{ marginTop: 16, fontSize: 28, color: "#7A5C45" }}>
            Couldn't find this kunu page.
          </div>
        </div>
      ),
      size,
    );
  }

  const accent =
    ACCENT_BG[profile.accentColor as keyof typeof ACCENT_BG] ?? ACCENT_BG.terracotta;
  const firstName = profile.displayName.split(" ")[0];
  const handle = user.username!;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FBF5EC",
          backgroundImage: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 50%, #FBF5EC 100%)`,
          padding: 80,
          color: "#1F1611",
          fontFamily: "serif",
        }}
      >
        {/* Top: brand chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 22,
            fontWeight: 600,
            color: "#1F1611",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#1F1611",
              borderRadius: 10,
              color: "#FBF5EC",
              fontWeight: 800,
              fontSize: 22,
            }}
          >
            k
          </div>
          buymekunu
        </div>

        {/* Middle: creator */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 28,
              color: accent.chip,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                background: "rgba(251,245,236,0.6)",
                padding: "6px 16px",
                borderRadius: 999,
              }}
            >
              @{handle}
            </span>
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -2,
              color: "#1F1611",
              maxWidth: 1000,
            }}
          >
            Buy {firstName} a {profile.kunuLabel} {profile.kunuEmoji}
          </div>
          {profile.tagline ? (
            <div
              style={{
                fontSize: 32,
                color: "#4A3A2E",
                maxWidth: 900,
                fontFamily: "sans-serif",
                lineHeight: 1.3,
              }}
            >
              {profile.tagline}
            </div>
          ) : (
            <div
              style={{
                fontSize: 32,
                color: "#4A3A2E",
                fontFamily: "sans-serif",
              }}
            >
              On Buy Me Kunu
            </div>
          )}
        </div>

        {/* Bottom: site URL */}
        <div
          style={{
            marginTop: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#7A5C45",
            fontSize: 22,
            fontFamily: "sans-serif",
          }}
        >
          <div>buymekunu.com/@{handle}</div>
          <div>Powered by Paystack</div>
        </div>
      </div>
    ),
    size,
  );
}
