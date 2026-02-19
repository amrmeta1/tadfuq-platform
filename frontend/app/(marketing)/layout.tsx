"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t, locale, setLocale, dir } = useI18n();

  return (
    <div dir={dir} className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              CF
            </div>
            <span className="font-semibold text-lg">CashFlow.ai</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.marketing.pricing}
            </Link>
            <Link href="/security" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.marketing.security}
            </Link>
            <Link href="/partners/accounting-firms" className="text-muted-foreground hover:text-foreground transition-colors">
              {t.marketing.partners}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
            >
              <Globe className="h-4 w-4 me-1" />
              {locale === "en" ? "العربية" : "English"}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">{t.auth.login}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/demo">{t.marketing.requestDemo}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-sm mb-3">CashFlow.ai</h3>
              <p className="text-sm text-muted-foreground">
                {locale === "ar"
                  ? "إدارة التدفق النقدي بالذكاء الاصطناعي لشركات الخليج"
                  : "AI-powered cash flow management for GCC SMEs"}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">{t.marketing.features}</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>Forecasting</li>
                <li>Alerts</li>
                <li>Reports</li>
                <li>Integrations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Company</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li><Link href="/pricing" className="hover:text-foreground">{t.marketing.pricing}</Link></li>
                <li><Link href="/security" className="hover:text-foreground">{t.marketing.security}</Link></li>
                <li><Link href="/partners/accounting-firms" className="hover:text-foreground">{t.marketing.partners}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Contact</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li><Link href="/demo" className="hover:text-foreground">{t.marketing.requestDemo}</Link></li>
                <li>hello@cashflow.ai</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} CashFlow.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
