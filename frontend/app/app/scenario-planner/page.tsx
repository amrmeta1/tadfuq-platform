"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Boxes } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { useScenarioPlanner } from "@/lib/hooks/useScenarioPlanner";
import { useForecastSimulation } from "@/features/forecast/use-forecast-simulation";
import { ForecastChart } from "@/features/forecast/forecast-chart";
import { ScenarioSandbox } from "@/features/forecast/scenario-sandbox";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtSAR(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}SAR ${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}SAR ${(abs / 1_000).toFixed(0)}k`;
  return `${sign}SAR ${abs.toLocaleString("en-US")}`;
}

function fmtSARAxis(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val: number = payload[0]?.value ?? 0;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs min-w-[140px]">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className={cn("tabular-nums font-mono font-medium", val >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
        {fmtSAR(val)}
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ScenarioPlannerPage() {
  const { locale, dir } = useI18n();
  const isAr = locale === "ar";

  const { baseline, simulated, params, setParam, reset, cashZeroDate } =
    useForecastSimulation();

  const {
    assumptions,
    derived,
    setAssumption,
    applyPreset,
    presets,
    baselineRevenue,
    baselineBurn,
    currentCashBalance,
  } = useScenarioPlanner();

  const { adjustedRevenue, adjustedBurn, netMonthlyFlow, projectedRunwayMonths, chartData } = derived;
  const isProfitable = projectedRunwayMonths === null;
  const isPositiveFlow = netMonthlyFlow >= 0;

  // Runway color
  const runwayColor =
    isProfitable || (projectedRunwayMonths ?? 0) > 12
      ? "text-emerald-600 dark:text-emerald-400"
      : (projectedRunwayMonths ?? 0) >= 6
      ? "text-amber-600 dark:text-amber-400"
      : "text-destructive";

  return (
    <div dir={dir} className="flex flex-col h-full overflow-y-auto bg-background">
      <div className="max-w-6xl w-full mx-auto px-4 py-8 space-y-6">

        {/* ── Page title ── */}
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {isAr ? "مخطط سيناريوهات الذكاء الاصطناعي" : "AI What-If Scenario Planner"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? "اسحب المتغيرات لمحاكاة تأثيرها الفوري على السيولة والمدرج الزمني."
              : "Drag the sliders to instantly model the impact on your cash runway and balance."}
          </p>
        </div>

        {/* ── Scenario preset bar ── */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.key}
              variant={
                assumptions.revenueGrowthPct === preset.assumptions.revenueGrowthPct &&
                assumptions.costReductionPct === preset.assumptions.costReductionPct &&
                assumptions.collectionSpeedDays === preset.assumptions.collectionSpeedDays
                  ? "default"
                  : "outline"
              }
              size="sm"
              className="gap-1.5"
              onClick={() => applyPreset(preset)}
            >
              {preset.emoji} {isAr
                ? preset.key === "worst" ? "الحالة الأسوأ"
                : preset.key === "base" ? "الحالة الأساسية"
                : "الحالة المثلى"
                : preset.label}
            </Button>
          ))}
        </div>

        {/* ── Main grid: sliders (left) + KPIs (right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Sliders panel ── */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                {isAr ? "متغيرات السيناريو" : "Scenario Assumptions"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-2">

              {/* Slider 1 — Revenue Growth */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <label className="text-sm font-medium">
                    {isAr ? "معدل نمو الإيرادات" : "Revenue Growth Rate"}
                  </label>
                  <span className={cn(
                    "text-sm font-bold tabular-nums",
                    assumptions.revenueGrowthPct > 0 ? "text-emerald-600 dark:text-emerald-400"
                    : assumptions.revenueGrowthPct < 0 ? "text-destructive"
                    : "text-foreground"
                  )}>
                    {assumptions.revenueGrowthPct > 0 ? "+" : ""}{assumptions.revenueGrowthPct}%
                  </span>
                </div>
                <Slider
                  min={-20}
                  max={50}
                  step={1}
                  value={[assumptions.revenueGrowthPct]}
                  onValueChange={([v]) => setAssumption("revenueGrowthPct", v)}
                />
                <p className="text-xs text-muted-foreground">
                  {isAr ? "التأثير على الإيرادات الشهرية المعدلة" : "Impact on adjusted monthly revenue"}
                </p>
              </div>

              {/* Slider 2 — Cost Reduction */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <label className="text-sm font-medium">
                    {isAr ? "تخفيض التكاليف" : "Cost Reduction"}
                  </label>
                  <span className={cn(
                    "text-sm font-bold tabular-nums",
                    assumptions.costReductionPct > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                  )}>
                    -{assumptions.costReductionPct}%
                  </span>
                </div>
                <Slider
                  min={0}
                  max={40}
                  step={1}
                  value={[assumptions.costReductionPct]}
                  onValueChange={([v]) => setAssumption("costReductionPct", v)}
                />
                <p className="text-xs text-muted-foreground">
                  {isAr ? "تخفيض معدل الحرق الشهري" : "Reduction in monthly burn rate"}
                </p>
              </div>

              {/* Slider 3 — Collection Speed */}
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <label className="text-sm font-medium">
                    {isAr ? "سرعة التحصيل" : "Collection Speed"}
                  </label>
                  <span className={cn(
                    "text-sm font-bold tabular-nums",
                    assumptions.collectionSpeedDays < 30 ? "text-emerald-600 dark:text-emerald-400"
                    : assumptions.collectionSpeedDays > 30 ? "text-amber-600 dark:text-amber-400"
                    : "text-foreground"
                  )}>
                    {assumptions.collectionSpeedDays} {isAr ? "يوم" : "days"}
                  </span>
                </div>
                <Slider
                  min={15}
                  max={60}
                  step={1}
                  value={[assumptions.collectionSpeedDays]}
                  onValueChange={([v]) => setAssumption("collectionSpeedDays", v)}
                />
                <p className="text-xs text-muted-foreground">
                  {isAr ? "متوسط أيام تحصيل المستحقات" : "Average days to collect receivables"}
                </p>
              </div>

            </CardContent>
          </Card>

          {/* ── Live KPI panel ── */}
          <div className="grid grid-cols-2 gap-4 content-start">

            {/* KPI 1 — Adjusted Revenue */}
            <Card className={cn(
              "border-s-4 transition-colors",
              adjustedRevenue > baselineRevenue ? "border-s-emerald-500" : adjustedRevenue < baselineRevenue ? "border-s-destructive" : "border-s-border"
            )}>
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {isAr ? "الإيرادات الشهرية المعدلة" : "Adj. Monthly Revenue"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className={cn(
                  "text-xl font-bold tabular-nums tracking-tighter",
                  adjustedRevenue > baselineRevenue ? "text-emerald-600 dark:text-emerald-400"
                  : adjustedRevenue < baselineRevenue ? "text-destructive"
                  : "text-foreground"
                )}>
                  {fmtSAR(adjustedRevenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAr ? "الأساس:" : "Baseline:"} {fmtSAR(baselineRevenue)}
                </p>
              </CardContent>
            </Card>

            {/* KPI 2 — Adjusted Burn */}
            <Card className={cn(
              "border-s-4 transition-colors",
              adjustedBurn < baselineBurn ? "border-s-emerald-500" : adjustedBurn > baselineBurn ? "border-s-destructive" : "border-s-border"
            )}>
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {isAr ? "معدل الحرق الشهري المعدل" : "Adj. Monthly Burn"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className={cn(
                  "text-xl font-bold tabular-nums tracking-tighter",
                  adjustedBurn < baselineBurn ? "text-emerald-600 dark:text-emerald-400"
                  : adjustedBurn > baselineBurn ? "text-destructive"
                  : "text-foreground"
                )}>
                  {fmtSAR(adjustedBurn)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAr ? "الأساس:" : "Baseline:"} {fmtSAR(baselineBurn)}
                </p>
              </CardContent>
            </Card>

            {/* KPI 3 — Net Monthly Flow */}
            <Card className={cn(
              "border-s-4 transition-colors",
              isPositiveFlow ? "border-s-emerald-500" : "border-s-destructive"
            )}>
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {isAr ? "صافي التدفق الشهري" : "Net Monthly Cash Flow"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className={cn(
                  "text-xl font-bold tabular-nums tracking-tighter",
                  isPositiveFlow ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                )}>
                  {netMonthlyFlow >= 0 ? "+" : ""}{fmtSAR(netMonthlyFlow)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAr ? "شهرياً" : "per month"}
                </p>
              </CardContent>
            </Card>

            {/* KPI 4 — Projected Runway */}
            <Card className={cn(
              "border-s-4 transition-colors",
              isProfitable || (projectedRunwayMonths ?? 0) > 12
                ? "border-s-emerald-500"
                : (projectedRunwayMonths ?? 0) >= 6
                ? "border-s-amber-500"
                : "border-s-destructive"
            )}>
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {isAr ? "المدرج الزمني المتوقع" : "Projected Runway"}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className={cn("text-xl font-bold tabular-nums tracking-tighter", runwayColor)}>
                  {isProfitable
                    ? (isAr ? "∞ مربح" : "∞ Profitable")
                    : `${(projectedRunwayMonths ?? 0).toFixed(1)} ${isAr ? "شهر" : "months"}`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAr ? "بناءً على الافتراضات الحالية" : "Based on current assumptions"}
                </p>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* ── Live Area Chart ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {isAr ? "توقعات الرصيد النقدي (١٢ شهراً)" : "Projected Cash Balance (12 Months)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0 72% 51%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(0 72% 51%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(240 5.9% 90% / 0.5)" />

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                    tickFormatter={fmtSARAxis}
                  />

                  <Tooltip content={<ChartTooltipContent />} />

                  {/* Zero-cash danger line */}
                  <ReferenceLine
                    y={0}
                    stroke="hsl(0 72% 51%)"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />

                  {/* Baseline starting balance */}
                  <ReferenceLine
                    y={currentCashBalance}
                    stroke="hsl(240 3.8% 46.1%)"
                    strokeDasharray="4 4"
                    strokeWidth={1}
                    label={{
                      value: isAr ? "الأساس" : "Baseline",
                      position: "insideTopRight",
                      fontSize: 10,
                      fill: "hsl(240 3.8% 46.1%)",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="cashBalance"
                    stroke={isPositiveFlow ? "hsl(142 71% 45%)" : "hsl(0 72% 51%)"}
                    strokeWidth={2}
                    fill={isPositiveFlow ? "url(#greenGradient)" : "url(#redGradient)"}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      {/* ── Section divider ── */}
        <div className="flex items-center gap-3 pt-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Boxes className="h-3 w-3" />
            {isAr ? "محاكي الصدمات المالية" : "Financial Stress Simulator"}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* ── Stress simulator: chart + sandbox ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

          {/* Base vs Simulated chart */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-semibold">
                  {isAr ? "الأساسي مقابل المحاكاة (يومياً)" : "Base vs Simulated Cash Balance (Daily)"}
                </CardTitle>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-5 border-t-2 border-dashed border-muted-foreground/50" />
                    {isAr ? "الأساسي" : "Base"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-5 border-t-2 border-primary" />
                    {isAr ? "المحاكاة" : "Simulated"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ForecastChart data={simulated} locale={locale} isAr={isAr} />
            </CardContent>
          </Card>

          {/* Scenario Sandbox controls */}
          <ScenarioSandbox
            params={params}
            setParam={setParam}
            reset={reset}
            cashZeroDate={cashZeroDate}
            isAr={isAr}
            locale={locale}
          />
        </div>

      </div>
    </div>
  );
}
