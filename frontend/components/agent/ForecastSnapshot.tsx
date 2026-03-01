"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useI18n } from "@/lib/i18n/context";
import { useForecast } from "@/lib/hooks/useForecast";
import { ArrowRight, ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForecastSnapshotProps {
  tenantId: string | null;
}

type TrendType = "improving" | "stable" | "declining";

function calculateTrend(current: number, week13: number): TrendType {
  const change = week13 - current;
  const changePercent = (change / current) * 100;
  
  if (changePercent > 2) return "improving";
  if (changePercent < -2) return "declining";
  return "stable";
}

export function ForecastSnapshot({ tenantId }: ForecastSnapshotProps) {
  const { data, loading } = useForecast(tenantId);
  const { fmt } = useCurrency();
  const { locale } = useI18n();
  const isAr = locale === "ar";

  if (loading) {
    return (
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-base font-semibold">
            {isAr ? "نظرة عامة على ١٣ أسبوع" : "13-Week Cash Outlook"}
          </CardTitle>
          <CardDescription>
            {isAr 
              ? "ملخص تنفيذي للتوقعات النقدية"
              : "Executive summary of cash forecast"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.forecast.length === 0) {
    return (
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-base font-semibold">
            {isAr ? "نظرة عامة على ١٣ أسبوع" : "13-Week Cash Outlook"}
          </CardTitle>
          <CardDescription>
            {isAr 
              ? "ملخص تنفيذي للتوقعات النقدية"
              : "Executive summary of cash forecast"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {isAr 
                ? "لا توجد بيانات كافية لإنشاء التوقعات. قم برفع المعاملات."
                : "Insufficient data for forecast. Upload transactions."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentCash = data.metrics.current_cash || 0;
  const week13 = data.forecast[12]?.baseline || data.forecast[data.forecast.length - 1]?.baseline || 0;
  const trend = calculateTrend(currentCash, week13);
  const confidence = Math.round((data.confidence || 0) * 100);

  const lastUpdated = new Date(data.generated_at).toLocaleString(
    isAr ? "ar-SA" : "en-GB",
    { 
      dateStyle: "short", 
      timeStyle: "short" 
    }
  );

  const trendConfig = {
    improving: {
      label: isAr ? "تحسن" : "Improving",
      icon: TrendingUp,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    stable: {
      label: isAr ? "مستقر" : "Stable",
      icon: Minus,
      className: "bg-slate-50 text-slate-700 border-slate-200",
    },
    declining: {
      label: isAr ? "تراجع" : "Declining",
      icon: TrendingDown,
      className: "bg-rose-50 text-rose-700 border-rose-200",
    },
  };

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-base font-semibold">
          {isAr ? "نظرة عامة على ١٣ أسبوع" : "13-Week Cash Outlook"}
        </CardTitle>
        <CardDescription>
          {isAr 
            ? "ملخص تنفيذي للتوقعات النقدية"
            : "Executive summary of cash forecast"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {isAr ? "الرصيد الحالي" : "Current Cash"}
            </p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {fmt(currentCash)}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {isAr ? "التوقع للأسبوع ١٣" : "Week 13 Projection"}
            </p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {fmt(week13)}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {isAr ? "الاتجاه" : "Trend"}
            </p>
            <div className="flex items-center gap-1.5">
              {(() => {
                const TrendIcon = trendConfig[trend].icon;
                return (
                  <>
                    <TrendIcon className={cn(
                      "h-4 w-4",
                      trend === "improving" && "text-emerald-700",
                      trend === "stable" && "text-slate-700",
                      trend === "declining" && "text-rose-700"
                    )} />
                    <span className="text-sm font-medium">
                      {trendConfig[trend].label}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {isAr ? "الثقة" : "Confidence"}
            </p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {confidence}%
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            {isAr ? "آخر تحديث:" : "Last updated:"} {lastUpdated}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/forecast" className="flex items-center gap-1">
              {isAr ? "عرض التوقعات الكاملة" : "View Full Forecast"}
              {isAr ? <ArrowLeft className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
