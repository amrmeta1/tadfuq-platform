"use client";

import React, {
  createContext, useContext, useState, useCallback, useEffect,
} from "react";

// ── Currency definitions ──────────────────────────────────────────────────────

export type CurrencyCode = "SAR" | "AED" | "QAR" | "EGP" | "USD" | "EUR";

export interface CurrencyInfo {
  code: CurrencyCode;
  flag: string;
  nameEn: string;
  nameAr: string;
  symbol: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  SAR: { code: "SAR", flag: "🇸🇦", nameEn: "Saudi Riyal",     nameAr: "ريال سعودي",   symbol: "ر.س" },
  AED: { code: "AED", flag: "🇦🇪", nameEn: "UAE Dirham",      nameAr: "درهم إماراتي",  symbol: "د.إ" },
  QAR: { code: "QAR", flag: "🇶🇦", nameEn: "Qatari Riyal",   nameAr: "ريال قطري",     symbol: "ر.ق" },
  EGP: { code: "EGP", flag: "🇪🇬", nameEn: "Egyptian Pound",  nameAr: "جنيه مصري",    symbol: "ج.م" },
  USD: { code: "USD", flag: "🇺🇸", nameEn: "US Dollar",       nameAr: "دولار أمريكي",  symbol: "$"   },
  EUR: { code: "EUR", flag: "🇪🇺", nameEn: "Euro",            nameAr: "يورو",           symbol: "€"   },
};

export const FX_RATES: Record<CurrencyCode, number> = {
  SAR: 1,
  AED: 1.0222,
  QAR: 1.0312,
  EGP: 13.42,
  USD: 0.2667,
  EUR: 0.2451,
};

export const CURRENCY_ORDER: CurrencyCode[] = ["SAR", "AED", "QAR", "EGP", "USD", "EUR"];

// ── Context ───────────────────────────────────────────────────────────────────

interface CurrencyContextValue {
  selected: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  convert: (amountInSAR: number) => number;
  fmt: (amountInSAR: number) => string;
  fmtDual: (amountInSAR: number) => { main: string; base: string | null };
  fmtAxis: (amountInSAR: number) => string;
  info: CurrencyInfo;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "tadfuq_display_currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<CurrencyCode>("SAR");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null;
      if (saved && FX_RATES[saved] !== undefined) setSelected(saved);
    } catch { /* ignore */ }
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setSelected(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
  }, []);

  const convert = useCallback(
    (amountInSAR: number) => amountInSAR * FX_RATES[selected],
    [selected],
  );

  const fmt = useCallback(
    (amountInSAR: number) => {
      const val = amountInSAR * FX_RATES[selected];
      return `${selected} ${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    },
    [selected],
  );

  const fmtDual = useCallback(
    (amountInSAR: number) => {
      const val = amountInSAR * FX_RATES[selected];
      const main = `${selected} ${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
      if (selected === "SAR") return { main, base: null };
      const base = `SAR ${amountInSAR.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
      return { main, base };
    },
    [selected],
  );

  const fmtAxis = useCallback(
    (amountInSAR: number) => {
      const val = amountInSAR * FX_RATES[selected];
      const abs = Math.abs(val);
      if (abs >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000)     return `${(val / 1_000).toFixed(0)}k`;
      return String(Math.round(val));
    },
    [selected],
  );

  const info = CURRENCIES[selected];

  return (
    <CurrencyContext.Provider
      value={{ selected, setCurrency, convert, fmt, fmtDual, fmtAxis, info }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
