import { ImageResponse } from "next/og";
import { PIECE_SETS } from "~/lib/pieces";
import { translations } from "~/lib/translations";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Alexandre Arabian, Software Engineer in Barcelona";

const NAME = "Alexandre Arabian";
const ROLE = translations.en.hero.role;

// The site's fonts, subset to the text drawn. Built once at build time; if
// Google Fonts can't be reached the card still renders in the default font.
async function font(family: string, text: string) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`,
    ).then((r) => r.text());
    const url = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(
      css,
    )?.[1];
    return url ? await fetch(url).then((r) => r.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

// The link preview: name and role beside a corner of the wooden board, the
// knight on its centre square.
export default async function OpengraphImage() {
  const [serif, sans] = await Promise.all([
    font("Instrument+Serif", NAME),
    font("Geist:wght@500", ROLE),
  ]);
  const knight = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">${PIECE_SETS.black.knight}</svg>`,
  )}`;
  const sq = 124;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 96px",
          background: "#ffffff",
          color: "#2b1d12",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: serif ? "Instrument Serif" : undefined,
              fontSize: 100,
              lineHeight: 1,
              width: 600,
            }}
          >
            {NAME}
          </div>
          <div
            style={{
              fontFamily: sans ? "Geist" : undefined,
              fontSize: 36,
              marginTop: 28,
              color: "#6e5a48",
            }}
          >
            {ROLE}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: sq * 3 + 28,
            padding: 14,
            background: "#4a3121",
          }}
        >
          {Array.from({ length: 9 }, (_, n) => (
            <div
              key={n}
              style={{
                width: sq,
                height: sq,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: n % 2 === 0 ? "#ddbf8e" : "#8b6440",
              }}
            >
              {n === 4 && (
                <img src={knight} width={sq * 0.9} height={sq * 0.9} alt="" />
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(serif
          ? [{ name: "Instrument Serif", data: serif, weight: 400 as const }]
          : []),
        ...(sans ? [{ name: "Geist", data: sans, weight: 500 as const }] : []),
      ],
    },
  );
}
