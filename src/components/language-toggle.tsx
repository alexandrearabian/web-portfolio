"use client";

import { useLanguage } from "~/contexts/LanguageContext";
import { cn } from "~/lib/utils";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t.language.toggle}
      className="flex font-mono text-xs uppercase"
    >
      {(["en", "es"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          aria-pressed={language === lang}
          aria-label={lang === "en" ? t.language.english : t.language.spanish}
          className={cn(
            "px-1.5 py-2 transition-colors",
            language === lang
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
