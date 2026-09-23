"use client";

import { useLanguage } from "~/contexts/LanguageContext";
import { cn } from "~/lib/utils";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t.language.toggle}
      className="flex rounded-full font-mono text-[11px] uppercase"
    >
      {(["en", "es"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          aria-pressed={language === lang}
          aria-label={lang === "en" ? t.language.english : t.language.spanish}
          className={cn(
            "rounded-full px-2 py-1.5 transition-colors active:scale-95",
            language === lang
              ? "text-brand"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
