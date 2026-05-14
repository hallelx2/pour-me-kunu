import { ImageResponse } from "next/og";

export const alt = "Buy Me Kunu — Get paid in kunus.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FBF5EC",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(229,163,71,0.4), transparent 50%), radial-gradient(circle at 10% 90%, rgba(45,95,63,0.18), transparent 55%)",
          padding: 80,
          color: "#1F1611",
          fontFamily: "serif",
        }}
      >
        {/* Top: brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 28,
            fontWeight: 600,
            color: "#1F1611",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#C8512C",
              borderRadius: 12,
              color: "#FBF5EC",
              fontWeight: 800,
              fontSize: 26,
            }}
          >
            k
          </div>
          buymekunu
        </div>

        {/* Middle: headline */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -2,
              color: "#1F1611",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            <span>Get paid in&nbsp;</span>
            <span style={{ color: "#C8512C" }}>kunus.</span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#4A3A2E",
              maxWidth: 880,
              lineHeight: 1.35,
              fontFamily: "sans-serif",
            }}
          >
            The simplest way for African creators to receive support. One-off tips and memberships, paid in naira.
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            marginTop: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#7A5C45",
            fontSize: 20,
            fontFamily: "sans-serif",
          }}
        >
          <div>buymekunu.com</div>
          <div style={{ display: "flex", gap: 24 }}>
            <span>Paystack-powered</span>
            <span>·</span>
            <span>5% per tip</span>
            <span>·</span>
            <span>No subscription</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
