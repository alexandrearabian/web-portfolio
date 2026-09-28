"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";
import { LanguageToggle } from "./language-toggle";
import { ChessPiece } from "./chess-piece";
import { useLanguage } from "~/contexts/LanguageContext";

// The navbar takes on the colour of whatever band is under it (a section,
// or the board's growing square), so it never sits cream on walnut.
function useToneUnder(header: React.RefObject<HTMLElement | null>) {
  const [tone, setTone] = useState<string>();
  useEffect(() => {
    let raf = 0;
    const frame = () => {
      raf = 0;
      const under = document
        .elementsFromPoint(innerWidth / 2, 20)
        .find((el) => !header.current?.contains(el))
        ?.closest<HTMLElement>("[data-tone]");
      setTone(under?.dataset.tone);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, [header]);
  return tone;
}

export function Navbar() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const tone = useToneUnder(ref);

  return (
    <header
      ref={ref}
      className={cn(
        "bg-background/85 fixed inset-x-0 top-0 z-50 backdrop-blur-md transition-colors duration-300",
        tone && `tone-${tone}`,
      )}
    >
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
          <LanguageToggle />
        </div>
      </nav>
    </header>
  );
}
