"use client";

import { AnimatePresence, motion } from "motion/react";
import { Home, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { LanguageToggle } from "./language-toggle";
import { cn } from "~/lib/utils";
import { useLanguage } from "~/contexts/LanguageContext";

const sections = ["about", "experience", "projects", "contact"] as const;

// Icons swap via the dark: variant, so the button needs no React state
// and matches the theme the inline script in layout.tsx already applied.
function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {}
}

export function Navbar() {
  const { t } = useLanguage();
  const [active, setActive] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Highlight the section crossing the middle of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
          else if (
            entry.target.id === "about" &&
            entry.boundingClientRect.top > 0
          )
            setActive(null);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-5"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <nav className="bg-card/80 flex items-center gap-1 rounded-full border p-1.5 shadow-[0_10px_36px_-16px_color-mix(in_oklch,var(--brand)_22%,transparent),inset_0_1px_0_0_var(--highlight)] backdrop-blur-xl">
          <a
            href="#"
            className="text-foreground/70 hover:text-brand hidden shrink-0 place-items-center px-3 transition-colors sm:grid"
            aria-label="Back to top"
          >
            <Home className="size-[18px]" strokeWidth={1.75} />
          </a>
          <span className="bg-border mx-1 hidden h-5 w-px sm:block" />

          {/* Desktop: inline links, fixed width so the pill doesn't resize
              when a label's language changes (e.g. "About" vs "Acerca"). */}
          <div className="hidden items-center gap-1 sm:flex">
            {sections.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? "true" : undefined}
                className={cn(
                  "relative w-20 rounded-full py-1.5 text-center text-sm font-medium transition-colors",
                  active === id
                    ? "text-brand-foreground"
                    : "text-foreground/70 hover:text-foreground",
                )}
              >
                {active === id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="bg-brand absolute inset-0 -z-10 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {t.nav[id]}
              </a>
            ))}
          </div>

          {/* Mobile: a menu button opens a full-screen overlay instead of
              cramming four fixed-width links into a small pill. */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="text-foreground/70 hover:text-foreground grid size-9 place-items-center rounded-full transition-colors sm:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu className="size-[18px]" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="text-foreground/70 hover:text-brand grid size-9 place-items-center rounded-full transition-colors"
            aria-label={t.theme.toggle}
            title={t.theme.toggle}
          >
            <Moon className="size-[18px] dark:hidden" strokeWidth={1.75} />
            <Sun className="hidden size-[18px] dark:block" strokeWidth={1.75} />
          </button>

          <span className="bg-border mx-1 h-5 w-px" />
          <div className="pr-1 pl-0.5">
            <LanguageToggle />
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="bg-background/97 fixed inset-0 z-[60] flex flex-col items-center justify-center gap-2 backdrop-blur-xl sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="text-foreground/70 hover:text-foreground absolute top-5 right-5 grid size-10 place-items-center rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="size-5" strokeWidth={1.75} />
            </button>
            {sections.map((id, i) => (
              <motion.a
                key={id}
                href={`#${id}`}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "text-3xl font-semibold tracking-[-0.02em] transition-colors",
                  active === id ? "text-brand" : "text-foreground",
                )}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 + i * 0.05 }}
              >
                {t.nav[id]}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
