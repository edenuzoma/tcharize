"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";
import type { LanguageCode } from "@tcharize/contracts";
import { translations, type Translations } from "./translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof Translations) => string;
  strings: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => translations.en[key] ?? "",
  strings: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    (notify) => {
      window.addEventListener("storage", notify);
      window.addEventListener("tcharize-language-change", notify);
      return () => {
        window.removeEventListener("storage", notify);
        window.removeEventListener("tcharize-language-change", notify);
      };
    },
    () => {
      const saved = localStorage.getItem("tcharize-site-language");
      return saved === "ha" || saved === "ig" || saved === "yo" || saved === "pcm" ? saved : "en";
    },
    () => "en" as LanguageCode,
  );

  function setLanguage(lang: LanguageCode) {
    if (typeof window !== "undefined") {
      localStorage.setItem("tcharize-site-language", lang);
      document.documentElement.lang = lang;
      window.dispatchEvent(new CustomEvent("tcharize-language-change", { detail: lang }));
    }
  }

  const strings = translations[language] ?? translations.en;

  const t = (key: keyof Translations): string => {
    return strings[key] ?? translations.en[key] ?? "";
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, strings }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
