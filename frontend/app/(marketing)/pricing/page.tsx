"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/context";
import { PRICING_PLANS } from "@/lib/config/pricing";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <div className="py-16">
      <div className="mx-auto max-w-6xl px-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      {isAr ? plan.period_ar : plan.period_en}
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
                  <Link href={plan.key === "enterprise" ? "/demo" : "/login"}>
                    {isAr ? plan.cta_ar : plan.cta_en}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
