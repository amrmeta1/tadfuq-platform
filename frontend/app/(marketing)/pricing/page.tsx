"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Building2,
  ShieldCheck,
  BrainCircuit,
  Headset,
  ArrowRight,
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
import { PRICING_PLANS, ENTERPRISE_PLAN } from "@/lib/config/pricing";
import { cn } from "@/lib/utils";

const PILLAR_ICONS = {
  building: Building2,
  shield: ShieldCheck,
  brain: BrainCircuit,
  headset: Headset,
} as const;

export default function PricingPage() {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const ep = ENTERPRISE_PLAN;

  return (
    <div className="py-16" dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-6xl px-4">
        {/* ══ Header ══ */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold">
            {isAr ? "خطط أسعار بسيطة وشفافة" : "Simple, transparent pricing"}
          </h1>
          <p className="mt-3 text-muted-foreground text-lg">
            {isAr
              ? "ابدأ مجانًا. قم بالترقية حسب نمو عملك."
              : "Start free. Upgrade as your business grows."}
          </p>
        </div>

        {/* ══ Plan Cards (Starter, Core, Pro) ══ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.key}
              className={cn(
                "relative",
                plan.highlighted && "border-primary shadow-lg ring-1 ring-primary"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 inset-x-0 flex justify-center">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    {isAr ? "الأكثر شيوعًا" : "Most Popular"}
                  </span>
                </div>
              )}
              <CardHeader className="pt-8">
                <CardTitle>{isAr ? plan.name_ar : plan.name_en}</CardTitle>
                <CardDescription>{isAr ? plan.description_ar : plan.description_en}</CardDescription>
                <div className="mt-4">
                  {plan.price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.currency} {plan.price}</span>
                      <span className="text-muted-foreground text-sm">
                        {isAr ? plan.period_ar : plan.period_en}
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold">
                      {isAr ? (plan as { period_ar: string; period_en: string }).period_ar : (plan as { period_ar: string; period_en: string }).period_en}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {(isAr ? plan.features_ar : plan.features_en).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href="/login">
                    {isAr ? plan.cta_ar : plan.cta_en}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ══ Enterprise Section ══ */}
        <div className="relative rounded-2xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950 dark:from-zinc-950 dark:via-zinc-950 dark:to-emerald-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_60%)]" />

          <div className="relative px-6 py-14 md:px-12 md:py-20">
            {/* Enterprise Header */}
            <div className="max-w-3xl mx-auto text-center mb-14">
              <span className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-4">
                <Building2 className="h-4 w-4" />
                {isAr ? ep.name_ar : ep.name_en}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {isAr
                  ? "حلول مخصصة للشركات الكبرى"
                  : "Custom solutions for large organizations"}
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                {isAr ? ep.tagline_ar : ep.tagline_en}
              </p>
            </div>

            {/* Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14 max-w-4xl mx-auto">
              {ep.pillars.map((pillar) => {
                const Icon = PILLAR_ICONS[pillar.icon];
                return (
                  <div
                    key={pillar.icon}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 hover:border-emerald-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
                        <Icon className="h-5 w-5 text-emerald-400" />
                      </div>
                      <h3 className="text-white font-semibold">
                        {isAr ? pillar.title_ar : pillar.title_en}
                      </h3>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {isAr ? pillar.desc_ar : pillar.desc_en}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14 max-w-3xl mx-auto">
              {ep.stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-emerald-400 tabular-nums">
                    {isAr ? stat.value_ar : stat.value_en}
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {isAr ? stat.label_ar : stat.label_en}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-8"
                asChild
              >
                <Link href="/demo">
                  {isAr ? ep.cta_ar : ep.cta_en}
                  <ArrowRight className={cn("h-4 w-4", isAr && "rotate-180")} />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white gap-2"
                asChild
              >
                <Link href="/demo">
                  {isAr ? ep.cta2_ar : ep.cta2_en}
                </Link>
              </Button>
            </div>

            {/* Trust line */}
            <p className="text-center text-zinc-600 text-xs mt-10">
              {isAr ? ep.logos_label_ar : ep.logos_label_en}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
