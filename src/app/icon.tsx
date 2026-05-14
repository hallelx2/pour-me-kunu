import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#C8512C",
          borderRadius: 8,
          color: "#FBF5EC",
          fontSize: 22,
          fontWeight: 800,
          fontFamily: "serif",
        }}
      >
        k
      </div>
    ),
    size,
  );
}
