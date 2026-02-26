"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
  { key: "solutions", en: "Solutions", ar: "الحلول", href: "#solutions" },
  { key: "platform", en: "Platform", ar: "المنصة", href: "#platform" },
  { key: "liquidity", en: "Liquidity Performance", ar: "أداء السيولة", href: "#liquidity" },
  { key: "agents", en: "Agents", ar: "الوكلاء", href: "#agents" },
  { key: "resources", en: "Resources", ar: "الموارد", href: "#resources" },
  { key: "pricing", en: "Pricing", ar: "الأسعار", href: "/pricing" },
  { key: "about", en: "About", ar: "عن تدفق", href: "#about" },
];

export function MarketingNavbar() {
  const { locale, setLocale, dir } = useI18n();
  const isAr = locale === "ar";

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-50 w-full backdrop-blur-xl border-b border-white/5",
        "bg-landing-darker/95 supports-[backdrop-filter]:bg-landing-darker/80"
      )}
    >
      <div className="mx-auto max-w-7xl flex h-16 items-center justify-between gap-6 px-4 md:px-6 lg:px-8">
        {/* Logo — Tadfuq.ai with neon accent */}
        <Link
          href="/home"
          className="flex items-center gap-2 shrink-0 font-bold text-lg tracking-tight text-white"
        >
          <span>Tadfuq</span>
          <span className="text-neon">.ai</span>
        </Link>

        {/* Center nav — Kyriba-style menu */}
        <nav className="hidden lg:flex items-center gap-8 text-sm">
          {MENU_ITEMS.map(({ key, en, ar, href }) => (
            <Link
              key={key}
              href={href}
              className="text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
            >
              {isAr ? ar : en}
            </Link>
          ))}
        </nav>

        {/* Right: Language + Login + Request Demo */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1.5 rounded-md hover:bg-white/5"
            aria-label={isAr ? "Switch to English" : "التبديل إلى العربية"}
          >
            <Globe className="h-3.5 w-3.5" />
            <span className={locale === "en" ? "text-neon font-medium" : ""}>EN</span>
            <span className="text-zinc-600" aria-hidden>|</span>
            <span className={locale === "ar" ? "text-neon font-medium" : ""}>عربي</span>
          </button>

          <Link
            href="/login"
            className="text-sm text-zinc-300 hover:text-white transition-colors px-3 py-2 hidden sm:inline-block"
          >
            {isAr ? "تسجيل الدخول" : "Login"}
          </Link>

          <Link
            href="/demo"
            className={cn(
              "rounded-lg px-5 py-2.5 text-sm font-semibold transition-all",
              "bg-neon text-landing-darker hover:bg-neon/90 hover:shadow-[0_0_24px_rgba(0,255,170,0.4)]"
            )}
          >
            {isAr ? "اطلب عرضًا" : "Request Demo"}
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
