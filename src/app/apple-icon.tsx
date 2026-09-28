import { ImageResponse } from "next/og";
import { PIECES } from "~/lib/pieces";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS needs a PNG home-screen icon; render the same pawn as the favicon.
export default function AppleIcon() {
  const pawn = PIECES.pawn.match(/ d="([^"]+)"/)![1];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <svg viewBox="0 0 45 45" width="140" height="140">
          <path d={pawn} fill="#2b1d12" />
        </svg>
      </div>
    ),
    size,
  );
}
