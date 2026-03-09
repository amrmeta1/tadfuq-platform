"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/context";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getTenantId } from "@/lib/api/client";
import { useCashStory } from "@/lib/hooks/useCashStory";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CashDriver } from "@/lib/api/cash-story-api";

function getRiskVariant(level: string): "default" | "secondary" | "destructive" {
  if (level === "low") return "default";
  if (level === "medium") return "secondary";
  return "destructive";
}

function getRiskLabel(level: string, isAr: boolean): string {
  const labels = {
    low: { en: "Low Risk", ar: "مخاطر منخفضة" },
    medium: { en: "Medium Risk", ar: "مخاطر متوسطة" },
    high: { en: "High Risk", ar: "مخاطر عالية" },
  };
  return isAr ? labels[level as keyof typeof labels]?.ar || level : labels[level as keyof typeof labels]?.en || level;
}

interface DriverItemProps {
  driver: CashDriver;
}

function DriverItem({ driver }: DriverItemProps) {
  const { fmt } = useCurrency();
  const { locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2">
        {driver.type === "inflow" ? (
          <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
        )}
        <span className="text-sm font-medium">{driver.name}</span>
      </div>
      <span className="text-sm font-semibold tabular-nums">
        {fmt(driver.impact)}
      </span>
    </div>
  );
}

export function CashStoryPanel() {
  const { locale, dir } = useI18n();
  const tenantId = getTenantId();
  const isAr = locale === "ar";

  const { data, isLoading, isError } = useCashStory(tenantId);

  if (isLoading) {
    return (
      <Card className="border-s-4 border-s-teal-500 shadow-sm" dir={dir}>
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-lg font-semibold">
            {isAr ? "قصة النقد" : "Cash Story"}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-s-4 border-s-teal-500 shadow-sm" dir={dir}>
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-lg font-semibold">
            {isAr ? "قصة النقد" : "Cash Story"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="py-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              {isAr
                ? "تعذر تحميل قصة النقد."
                : "Unable to load cash story."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const lastUpdatedFormatted = new Date(data.generated_at).toLocaleString(
    isAr ? "ar-SA" : "en-GB",
    { dateStyle: "short", timeStyle: "short" }
  );

  return (
    <Card className="border-s-4 border-s-teal-500 shadow-sm" dir={dir}>
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-lg font-semibold">
          {isAr ? "قصة النقد" : "Cash Story"}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge variant={getRiskVariant(data.risk_level)} className="text-xs">
            {getRiskLabel(data.risk_level, isAr)}
          </Badge>
          {data.confidence > 0 && (
            <Badge variant="outline" className="text-xs">
              {isAr ? "الثقة" : "Confidence"}: {Math.round(data.confidence * 100)}%
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {isAr ? "آخر تحديث:" : "Last updated:"} {lastUpdatedFormatted}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        {/* AI-Generated Narrative */}
        <div className="rounded-lg bg-muted/30 p-4">
          <p className="text-sm leading-relaxed">
            {data.summary}
          </p>
        </div>

        {/* Key Drivers */}
        {data.drivers && data.drivers.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">
              {isAr ? "المحركات الرئيسية" : "Key Drivers"}
            </h4>
            <div className="rounded-lg border bg-card">
              {data.drivers.map((driver, index) => (
                <DriverItem key={`${driver.name}-${index}`} driver={driver} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
