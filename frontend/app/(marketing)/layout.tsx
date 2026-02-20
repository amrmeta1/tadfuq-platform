"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { MarketingNavbar } from "@/components/marketing/marketing-navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, locale, dir } = useI18n();
  const isAr = locale === "ar";

  return (
    <div dir={dir} className="min-h-screen flex flex-col bg-zinc-950">
      <MarketingNavbar />

      <main className="flex-1">{children}</main>

      {/* Dark footer */}
      <footer className="border-t border-white/10 py-12 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-[10px]">CF</div>
                <span className="font-bold text-white text-sm">CashFlow.ai</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {isAr
                  ? "إدارة التدفق النقدي بالذكاء الاصطناعي لشركات الخليج"
                  : "AI-powered cash flow management for GCC SMEs"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wide mb-3">
                {t.marketing.features}
              </h3>
              <ul className="space-y-2 text-xs text-zinc-500">
                {["Forecasting", "Alerts", "Reports", "Integrations"].map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wide mb-3">
                {isAr ? "الشركة" : "Company"}
              </h3>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><Link href="/pricing" className="hover:text-white transition-colors">{t.marketing.pricing}</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">{t.marketing.security}</Link></li>
                <li><Link href="/partners/accounting-firms" className="hover:text-white transition-colors">{t.marketing.partners}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-xs text-zinc-300 uppercase tracking-wide mb-3">
                {isAr ? "تواصل معنا" : "Contact"}
              </h3>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><Link href="/demo" className="hover:text-white transition-colors">{t.marketing.requestDemo}</Link></li>
                <li>hello@cashflow.ai</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-white/5 text-center text-xs text-zinc-600">
            © {new Date().getFullYear()} CashFlow.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
