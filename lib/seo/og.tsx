import { ImageResponse } from "next/og"

export const OG_SIZE = { width: 1200, height: 630 }

/** Shared branded Open Graph card. */
export function ogImage({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #1c1210 0%, #3b1d0e 55%, #c2410c 140%)",
          color: "#fff7ed",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#ea580c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>Applyo</div>
          <div style={{ marginLeft: "auto", fontSize: 24, color: "#fdba74" }}>{eyebrow}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: title.length > 60 ? 58 : 68, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 28, color: "#fed7aa", lineHeight: 1.35 }}>{subtitle}</div>}
        </div>
        <div style={{ fontSize: 24, color: "#fdba74" }}>applyo.app</div>
      </div>
    ),
    OG_SIZE,
  )
}
