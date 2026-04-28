"use client";

import { motion } from "motion/react";
import { ModeToggle } from "./mode-toggle";
import { LanguageToggle } from "./language-toggle";
import { cn } from "~/lib/utils";
import { useEffect } from "react";
import { useLanguage } from "~/contexts/LanguageContext";

export function Navbar() {
  const { t } = useLanguage();

  const navItems = [
    { href: "#about", label: t.nav.about },
    { href: "#projects", label: t.nav.projects },
    { href: "#contact", label: t.nav.contact },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);

    if (element) {
      const navbar =
        document.querySelector("nav") ??
        document.querySelector('[role="navigation"]');
      const navbarHeight = navbar ? navbar.offsetHeight + 20 : 100;

      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - navbarHeight;

      const startPosition = window.pageYOffset;
      const distance = offsetPosition - startPosition;
      const duration = 1000;
      let start: number | null = null;

      function animation(currentTime: number) {
        start ??= currentTime;
        const timeElapsed = currentTime - start;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      }

      function ease(t: number, b: number, c: number, d: number) {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      }

      requestAnimationFrame(animation);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const href = event.currentTarget.getAttribute("href");
    if (href?.startsWith("#")) {
      const sectionId = href.substring(1);
      scrollToSection(sectionId);
    }
  };

  useEffect(() => {
    const updateHeroButtons = () => {
      const heroButtons = document.querySelectorAll('a[href^="#"]');
      heroButtons.forEach((button) => {
        const existingHandler = (button as HTMLAnchorElement).onclick;
        if (!existingHandler) {
          (button as HTMLAnchorElement).addEventListener("click", (e) => {
            e.preventDefault();
            const href = (e.target as HTMLAnchorElement).getAttribute("href");
            if (href?.startsWith("#")) {
              const sectionId = href.substring(1);
              scrollToSection(sectionId);
            }
          });
        }
      });
    };

    const timer = setTimeout(updateHeroButtons, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="bg-background supports-[backdrop-filter]:bg-background/70 sticky top-0 z-50 w-full border-b backdrop-blur"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <nav className="container">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:h-20 md:px-8">
            <div className="flex min-w-0 items-center gap-3 sm:gap-6 md:gap-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-space text-foreground/90 hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center rounded-md px-2.5 py-2 text-base font-semibold transition-colors focus-visible:ring-[3px] focus-visible:outline-none sm:px-3",
                    "hover:text-purple-500",
                  )}
                  onClick={handleClick}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <motion.div
              className="flex shrink-0 items-center gap-3 sm:gap-4"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <LanguageToggle />
              <ModeToggle />
            </motion.div>
          </div>
        </nav>
      </motion.div>
    </motion.div>
  );
}
