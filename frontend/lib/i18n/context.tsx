"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { dictionaries, type Locale, type Dictionary } from "./dictionaries";

interface I18nContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue | null>(null);

const LOCALE_STORAGE_KEY = "locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Use fixed default so server and first client render match (avoids hydration error).
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      if (saved && (saved === "en" || saved === "ar")) setLocaleState(saved);
    } catch { /* ignore */ }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch { /* ignore */ }
  }, []);

  const t = dictionaries[locale];
  const dir = t.dir;

  return (
    <I18nContext.Provider value={{ locale, t, setLocale, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
