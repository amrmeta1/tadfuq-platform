"use client";

import Link from "next/link";
import {
  TrendingUp,
  Bell,
  Bot,
  FileText,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/context";

const FEATURES = [
  { icon: TrendingUp, key: "forecast", title_en: "13-Week Forecast", title_ar: "توقعات ١٣ أسبوعًا", desc_en: "ML-powered cash flow projections with scenario analysis and confidence bands.", desc_ar: "توقعات التدفق النقدي بالذكاء الاصطناعي مع تحليل السيناريوهات." },
  { icon: Bell, key: "alerts", title_en: "Smart Alerts", title_ar: "تنبيهات ذكية", desc_en: "Get notified before cash shortfalls happen. Never be surprised again.", desc_ar: "احصل على إشعارات قبل حدوث نقص السيولة." },
  { icon: Bot, key: "agents", title_en: "AI Agents", title_ar: "وكلاء ذكيون", desc_en: "Three specialized agents monitor, forecast, and advise 24/7.", desc_ar: "ثلاثة وكلاء متخصصون يراقبون ويتنبأون ويقدمون النصائح." },
  { icon: FileText, key: "reports", title_en: "Board-Ready Reports", title_ar: "تقارير جاهزة لمجلس الإدارة", desc_en: "Auto-generated monthly reports with narratives and charts.", desc_ar: "تقارير شهرية مولدة تلقائيًا مع سرد ورسوم بيانية." },
  { icon: Shield, key: "security", title_en: "Enterprise Security", title_ar: "أمان مؤسسي", desc_en: "RBAC, audit logs, SSO via Keycloak, and encrypted data at rest.", desc_ar: "تحكم بالصلاحيات، سجل مراجعة، SSO عبر Keycloak، وتشفير البيانات." },
  { icon: Globe, key: "i18n", title_en: "Arabic & English", title_ar: "عربي وإنجليزي", desc_en: "Full RTL support. Built for the GCC market from day one.", desc_ar: "دعم كامل للاتجاه من اليمين لليسار. مصمم لسوق الخليج." },
];

export default function HomePage() {
  const { t, locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <div>
      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            {t.marketing.heroTitle}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.marketing.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/login">
                {t.marketing.getStarted}
                <ArrowRight className="ms-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">{t.marketing.requestDemo}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            {t.marketing.features}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.key}>
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">
                      {isAr ? feature.title_ar : feature.title_en}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {isAr ? feature.desc_ar : feature.desc_en}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {isAr ? "موثوق من شركات في جميع أنحاء الخليج" : "Trusted by businesses across the GCC"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isAr
              ? "مقاولات، عيادات، تجزئة، وخدمات مهنية في السعودية وقطر والإمارات."
              : "Contractors, clinics, retail, and professional services in KSA, Qatar, and UAE."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["KSA 🇸🇦", "Qatar 🇶🇦", "UAE 🇦🇪"].map((country) => (
              <div
                key={country}
                className="flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                {country}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {isAr ? "ابدأ في دقائق" : "Get started in minutes"}
          </h2>
          <p className="mb-8 opacity-90">
            {isAr
              ? "لا تحتاج بطاقة ائتمان. ابدأ مجانًا اليوم."
              : "No credit card required. Start free today."}
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">
              {t.marketing.getStarted}
              <ArrowRight className="ms-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
