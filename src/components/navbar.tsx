"use client";

import Link from "next/link";
import { LanguageToggle } from "./language-toggle";
import { ChessPiece } from "./chess-piece";
import { useLanguage } from "~/contexts/LanguageContext";

// Light by default; the choice is saved (see the script in layout.tsx).
// Where supported, the page crossfades between themes.
function toggleTheme() {
  const root = document.documentElement;
  const apply = () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };
  if (
    typeof document.startViewTransition !== "function" ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    apply();
  else document.startViewTransition(apply);
}

export function Navbar() {
  const { t } = useLanguage();
  return (
    // Solid on phones: a backdrop blur re-blurs everything behind the bar
    // on every scroll frame, which phones can't keep up with over the
    // board's animation. Frosted from md up.
    <header className="bg-background/95 md:bg-background/85 fixed inset-x-0 top-0 z-50 md:backdrop-blur-md">
      <nav className="flex h-14 items-center justify-between px-3 lg:px-5">
        {/* Home is the board: on the home page that's the top of the
            page, and scrolling up there plays the move in reverse. */}
        <Link
          href="/"
          onClick={(e) => {
            if (location.pathname !== "/") return;
            e.preventDefault();
            scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="text-foreground hover:text-accent grid size-10 place-items-center transition-colors"
          aria-label={t.nav.home}
          title={t.nav.home}
        >
          <ChessPiece type="king" className="size-8" />
        </Link>
        <div className="flex items-center">
          <button
            type="button"
            onClick={toggleTheme}
            className="text-foreground hover:text-accent grid size-10 place-items-center transition-colors"
            aria-label={t.theme.toggle}
            title={t.theme.toggle}
          >
            <ChessPiece type="pawn" className="size-7" />
          </button>
          <LanguageToggle />
        </div>
      </nav>
    </header>
  );
}
