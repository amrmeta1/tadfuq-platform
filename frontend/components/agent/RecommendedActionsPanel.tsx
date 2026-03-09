"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/context";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getTenantId } from "@/lib/api/client";
import { useRecommendedActions } from "@/lib/hooks/useRecommendedActions";
import { Lightbulb, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TreasuryAction } from "@/lib/api/actions-api";

interface RecommendedActionsPanelProps {
  onSimulate?: (action: TreasuryAction) => void;
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "liquidity":
      return "border-s-blue-500";
    case "revenue":
      return "border-s-green-500";
    case "cost_reduction":
      return "border-s-amber-500";
    default:
      return "border-s-gray-500";
  }
}

function getCategoryLabel(category: string, isAr: boolean): string {
  const labels = {
    liquidity: { en: "Liquidity", ar: "السيولة" },
    revenue: { en: "Revenue", ar: "الإيرادات" },
    cost_reduction: { en: "Cost Reduction", ar: "تقليل التكاليف" },
  };
  return isAr
    ? labels[category as keyof typeof labels]?.ar || category
    : labels[category as keyof typeof labels]?.en || category;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "liquidity":
      return <DollarSign className="h-4 w-4 text-blue-500" />;
    case "revenue":
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case "cost_reduction":
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    default:
      return <Lightbulb className="h-4 w-4 text-gray-500" />;
  }
}

interface ActionItemProps {
  action: TreasuryAction;
  isAr: boolean;
  onSimulate?: (action: TreasuryAction) => void;
}

function ActionItem({ action, isAr, onSimulate }: ActionItemProps) {
  const { fmt } = useCurrency();

  return (
    <div className="py-3 border-b last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            {getCategoryIcon(action.category)}
            <h4 className="text-sm font-semibold">{action.title}</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {action.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs font-semibold tabular-nums">
              {fmt(action.impact)}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {Math.round(action.confidence * 100)}%{" "}
              {isAr ? "ثقة" : "confidence"}
            </Badge>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="text-xs shrink-0"
          onClick={() => onSimulate?.(action)}
        >
          {isAr ? "محاكاة" : "Simulate"}
        </Button>
      </div>
    </div>
  );
}

export function RecommendedActionsPanel({ onSimulate }: RecommendedActionsPanelProps) {
  const { locale, dir } = useI18n();
  const tenantId = getTenantId();
  const isAr = locale === "ar";

  const { data, isLoading, isError } = useRecommendedActions(tenantId);

  if (isLoading) {
    return (
      <Card className="border-s-4 border-s-purple-500 shadow-sm" dir={dir}>
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-500" />
            {isAr ? "الإجراءات الموصى بها" : "AI Recommended Actions"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="border-s-4 border-s-purple-500 shadow-sm" dir={dir}>
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-500" />
            {isAr ? "الإجراءات الموصى بها" : "AI Recommended Actions"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {isAr
                ? "تعذر تحميل الإجراءات الموصى بها."
                : "Unable to load recommended actions."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const actions = data?.actions || [];

  if (actions.length === 0) {
    return (
      <Card className="border-s-4 border-s-purple-500 shadow-sm" dir={dir}>
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-500" />
            {isAr ? "الإجراءات الموصى بها" : "AI Recommended Actions"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-center py-6">
            <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {isAr
                ? "لا توجد إجراءات موصى بها في الوقت الحالي."
                : "No recommended actions at this time."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group actions by category
  const groupedActions = actions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, TreasuryAction[]>);

  const categoryOrder = ["liquidity", "revenue", "cost_reduction"];

  return (
    <Card className="border-s-4 border-s-purple-500 shadow-sm" dir={dir}>
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-purple-500" />
          {isAr ? "الإجراءات الموصى بها" : "AI Recommended Actions"}
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {isAr
            ? "إجراءات مقترحة لتحسين الوضع المالي"
            : "Suggested actions to improve financial position"}
        </p>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        {categoryOrder.map((category) => {
          const categoryActions = groupedActions[category];
          if (!categoryActions || categoryActions.length === 0) return null;

          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(category)}
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {getCategoryLabel(category, isAr)}
                </h3>
              </div>
              <div className="space-y-0">
                {categoryActions.map((action, idx) => (
                  <ActionItem
                    key={`${action.type}-${idx}`}
                    action={action}
                    isAr={isAr}
                    onSimulate={onSimulate}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
