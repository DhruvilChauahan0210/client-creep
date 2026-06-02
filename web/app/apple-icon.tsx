import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#0a0a0a",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 20 20"
          fill="none"
        >
          <circle cx="10" cy="10" r="2.5" fill="white" />
          <line x1="8.2" y1="8.2" x2="4" y2="4" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="3.2" cy="3.2" r="1.6" fill="white" opacity="0.55" />
          <line x1="11.8" y1="8.2" x2="16" y2="4" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="16.8" cy="3.2" r="1.6" fill="white" opacity="0.55" />
          <line x1="8.2" y1="11.8" x2="4" y2="16" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="3.2" cy="16.8" r="1.6" fill="white" opacity="0.3" />
          <line x1="11.8" y1="11.8" x2="16" y2="16" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="16.8" cy="16.8" r="1.6" fill="white" opacity="0.3" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
