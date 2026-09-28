import "~/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "~/contexts/LanguageContext";
import { type Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import Script from "next/script";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
      // The theme script sets data-theme before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <Script id="theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body className="overflow-x-hidden" suppressHydrationWarning>
        <a
          href="#main"
          className="bg-foreground text-background sr-only z-[60] px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        <LanguageProvider>
          <ThemeProvider>
            <Navbar />
            <main id="main">{children}</main>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
