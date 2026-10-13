import { ImageResponse } from "next/og";

export const alt = "Solat.Today by drmsr";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          background: "#f9fafb",
          color: "#111827",
        }}
      >
        <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: -3 }}>Solat Today</div>
        <div style={{ fontSize: 44, marginTop: 24, color: "#374151" }}>
          Prayer times for your location in Malaysia
        </div>
        <div style={{ fontSize: 32, marginTop: 56, color: "#15803d" }}>JAKIM zones · solat.today</div>
      </div>
    ),
    size
  );
}
