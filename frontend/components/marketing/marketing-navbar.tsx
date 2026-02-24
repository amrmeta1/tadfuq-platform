"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { Globe } from "lucide-react";

// ── Component ────────────────────────────────────────────────────────────────

export function MarketingNavbar() {
  const { locale, setLocale } = useI18n();
  const isAr = locale === "ar";

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full backdrop-blur-md border-b"
      style={{ background: "hsl(220 55% 5% / 0.85)", borderColor: "hsl(220 30% 12%)" }}
    >
      <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-4 md:px-6">

        {/* Brand */}
        <Link href="/home" className="flex items-center gap-2 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
            CF
          </div>
          <span className="font-bold text-white text-base tracking-tight">CashFlow.ai</span>
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm">
          {[
            { label: isAr ? "المميزات" : "Features",  href: "#features" },
            { label: isAr ? "الأسعار"  : "Pricing",   href: "/pricing"  },
            { label: isAr ? "الأمان"   : "Security",  href: "/security" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* End actions */}
        <div className="flex items-center gap-2">
          {/* Locale toggle */}
          <button
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="hidden sm:flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1"
          >
            <Globe className="h-3.5 w-3.5" />
            {locale === "en" ? "العربية" : "English"}
          </button>

          {/* Login */}
          <Link
            href="/login"
            className="text-sm text-zinc-300 hover:text-white transition-colors px-3 py-1.5"
          >
            {isAr ? "تسجيل الدخول" : "Login"}
          </Link>

          {/* Book a Demo CTA */}
          <Link
            href="/demo"
            className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "hsl(174 80% 44%)", color: "hsl(220 55% 5%)" }}
          >
            {isAr ? "احجز عرضًا" : "Get a Demo"}
          </Link>
        </div>

      </div>
    </motion.header>
  );
}
