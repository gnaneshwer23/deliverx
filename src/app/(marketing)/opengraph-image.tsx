import { ImageResponse } from "next/og";

export const alt = "DeliverX | AI Product Experience Company";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "linear-gradient(145deg, #0C0C0A 0%, #121810 55%, #1C4A2E 100%)",
          color: "#F5F5F0",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#3D9660",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 14 14"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M1 7h12M7 1v12M2 2l10 10M12 2L2 12" />
            </svg>
          </div>
          <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em" }}>
            DeliverX
          </span>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            maxWidth: 900,
          }}
        >
          Delivery clarity for every role on your team.
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            lineHeight: 1.5,
            color: "rgba(245,245,240,0.72)",
            maxWidth: 820,
          }}
        >
          AI delivery intelligence with human approval on every change.
        </div>
      </div>
    ),
    { ...size },
  );
}
