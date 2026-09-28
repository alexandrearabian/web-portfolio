import "~/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "~/contexts/LanguageContext";
import { type Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import { cookies, headers } from "next/headers";
import type { Language } from "~/lib/translations";
import { Navbar } from "~/components/navbar";

// Runs before first paint so a saved dark theme never flashes light.
// Light is the default; only an explicit choice switches.
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem("theme")||"light"}catch(e){}`;

export const metadata: Metadata = {
  title: "Alexandre Arabian · Software Engineer in Barcelona",
  description:
    "Software engineer in Barcelona building web apps end to end. Experience, projects and CV.",
  openGraph: {
    title: "Alexandre Arabian",
    description: "Software engineer in Barcelona. Experience, projects and CV.",
    type: "website",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

// The visitor's language, decided on the server so the first render is
// already right: a saved choice (cookie), else the browser's preference.
async function pickLanguage(): Promise<Language> {
  const saved = (await cookies()).get("lang")?.value;
  if (saved === "en" || saved === "es") return saved;
  const accept = (await headers()).get("accept-language") ?? "";
  return accept.trim().toLowerCase().startsWith("es") ? "es" : "en";
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const language = await pickLanguage();
  return (
    <html
      lang={language}
      className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
      // The theme script sets data-theme before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <Script id="theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      {/* overflow-x: clip, not hidden: `hidden` turns <body> into a scroll
          container as soon as <html> stops scrolling (the board locks it
          during its moves), and the pinned board then jumps off-screen. */}
      <body className="overflow-x-clip" suppressHydrationWarning>
        <a
          href="#main"
          className="bg-foreground text-background sr-only z-[60] px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        <LanguageProvider initial={language}>
          <ThemeProvider>
            <Navbar />
            <main id="main">{children}</main>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
