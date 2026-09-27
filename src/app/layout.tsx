import "~/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "~/contexts/LanguageContext";
import { type Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "~/components/navbar";
import { Footer } from "~/components/footer";

// Runs before first paint so a saved dark theme never flashes light.
const themeScript = `try{var t=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){}`;

export const metadata: Metadata = {
  title: "Alexandre Arabian · Fullstack developer in Barcelona",
  description:
    "Fullstack developer in Barcelona, open to full-time roles and freelance projects: web apps, e-commerce and process automation.",
  openGraph: {
    title: "Alexandre Arabian",
    description:
      "Fullstack developer open to full-time roles and freelance projects.",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="overflow-x-hidden font-sans" suppressHydrationWarning>
        <a
          href="#main"
          className="bg-foreground text-background sr-only z-[60] rounded-full px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Skip to content
        </a>
        <LanguageProvider>
          <ThemeProvider>
            <Navbar />
            <main id="main">{children}</main>
            <Footer />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
