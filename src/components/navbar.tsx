"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { LanguageToggle } from "./language-toggle";
import { cn } from "~/lib/utils";
import { useLanguage } from "~/contexts/LanguageContext";

const sections = ["about", "projects", "contact"] as const;

export function Navbar() {
  const { t } = useLanguage();
  const [active, setActive] = useState<string | null>(null);

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
    <motion.header
      className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-5"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <nav className="bg-background/70 flex items-center gap-1 rounded-full border p-1.5 shadow-[0_8px_32px_-12px_color-mix(in_oklch,var(--brand)_35%,transparent),inset_0_1px_0_0_oklch(1_0_0/0.06)] backdrop-blur-xl">
        <a
          href="#"
          className="hover:text-brand hidden px-3 font-mono text-sm font-medium tracking-tight transition-colors sm:block"
          aria-label="Back to top"
        >
          AA
        </a>
        <span className="bg-border mx-1 hidden h-5 w-px sm:block" />
        {sections.map((id) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? "true" : undefined}
            className={cn(
              // Fixed width so the pill doesn't resize when the label's
              // language changes (e.g. "About" vs "Acerca").
              "relative w-[4.5rem] rounded-full py-1.5 text-center text-sm font-medium transition-colors sm:w-20",
              active === id
                ? "text-background"
                : "text-foreground/70 hover:text-foreground",
            )}
          >
            {active === id && (
              <motion.span
                layoutId="nav-pill"
                className="bg-foreground absolute inset-0 -z-10 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {t.nav[id]}
          </a>
        ))}
        <span className="bg-border mx-1 h-5 w-px" />
        <LanguageToggle />
        <ModeToggle />
      </nav>
    </motion.header>
  );
}
