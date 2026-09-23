"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { translations } from "~/lib/translations";
import type { Language, TranslationKeys } from "~/lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

function getBrowserLanguage(): Language {
  const langCode = navigator.language.toLowerCase().split("-")[0];
  return langCode === "es" ? "es" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always render "en" on the server and on the first client render, so the
  // markup matches. Only switch to the browser's language after mount.
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Syncing from a browser-only API (navigator.language): this can't be
    // read during render without a server/client mismatch, so a one-off
    // setState on mount is intentional here, not a missed derivation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguage(getBrowserLanguage());
  }, []);

  // Update the HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
