"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { BarChart2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/context";
import { useTenant } from "@/lib/hooks/use-tenant";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import { useWaterfall, useMonthlyTrend } from "@/features/analytics/hooks";

function ChartTooltip({ active, payload, label, fmt }: { active?: boolean; payload?: any[]; label?: string; fmt: (n: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs min-w-[160px]">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 mb-0.5">
          <span className="text-muted-foreground">{p.name}</span>
          <span className={cn("font-medium tabular-nums", p.dataKey === "outflow" ? "text-rose-600" : p.dataKey === "inflow" ? "text-emerald-600" : p.value >= 0 ? "text-emerald-600" : "text-rose-600")}>
            {p.value < 0 ? "-" : ""}{fmt(Math.abs(p.value))}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function WaterfallPage() {
  const { locale, dir } = useI18n();
  const { currentTenant } = useTenant();
  const { fmt } = useCurrency();
  const isAr = locale === "ar";

  const [trendMonths, setTrendMonths] = useState<6 | 12>(6);

  const { data: waterfall = [], isLoading: wLoading } = useWaterfall(currentTenant?.id);
  const { data: trend = [], isLoading: tLoading } = useMonthlyTrend(currentTenant?.id, trendMonths, locale);

  const totalInflow = waterfall.reduce((s, b) => s + b.inflow, 0);
  const totalOutflow = waterfall.reduce((s, b) => s + b.outflow, 0);
  const netFlow = totalInflow - totalOutflow;

  return (
    <div dir={dir} className="flex flex-col gap-5 p-5 md:p-6 overflow-y-auto h-full" data-page-full>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold">
            {isAr ? "تحليل التدفق النقدي" : "Cash Flow Analysis"}
          </h1>
        </div>
      </div>

      {/* ── KPI strip ── */}
      {wLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: isAr ? "إجمالي الواردات" : "Total Inflows", value: totalInflow, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
            { label: isAr ? "إجمالي الصادرات" : "Total Outflows", value: totalOutflow, icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-950/40" },
            { label: isAr ? "صافي التدفق" : "Net Cash Flow", value: netFlow, icon: DollarSign, color: netFlow >= 0 ? "text-emerald-600" : "text-rose-600", bg: netFlow >= 0 ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-rose-50 dark:bg-rose-950/40" },
          ].map((kpi, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</CardTitle>
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", kpi.bg)}>
                  <kpi.icon className={cn("h-3.5 w-3.5", kpi.color)} />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <span className={cn("text-xl font-semibold tracking-tight tabular-nums", kpi.color)}>
                  {kpi.value < 0 ? "-" : ""}{fmt(Math.abs(kpi.value))}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Waterfall bar chart ── */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold">
            {isAr ? "التدفقات الواردة والصادرة حسب الفئة" : "Inflows vs Outflows by Category"}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isAr ? "مقارنة الإيرادات والمصروفات لكل فئة" : "Revenue and expense breakdown per category"}
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {wLoading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={waterfall}
                  margin={{ top: 4, right: 4, left: 0, bottom: 60 }}
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(240 5.9% 90%)" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 10, fill: "hsl(240 3.8% 46.1%)" }}
                    axisLine={false}
                    tickLine={false}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                  />
                  <Tooltip content={<ChartTooltip fmt={fmt} />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    formatter={(value) =>
                      value === "inflow"
                        ? isAr ? "وارد" : "Inflow"
                        : isAr ? "صادر" : "Outflow"
                    }
                  />
                  <Bar dataKey="inflow" name="inflow" fill="hsl(142 71% 45%)" radius={[3, 3, 0, 0]} maxBarSize={28}>
                    {waterfall.map((_, i) => (
                      <Cell key={i} fill="hsl(142 71% 45%)" fillOpacity={0.85} />
                    ))}
                  </Bar>
                  <Bar dataKey="outflow" name="outflow" fill="hsl(0 72% 51%)" radius={[3, 3, 0, 0]} maxBarSize={28}>
                    {waterfall.map((_, i) => (
                      <Cell key={i} fill="hsl(0 72% 51%)" fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Monthly trend ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
          <div>
            <CardTitle className="text-sm font-semibold">
              {isAr ? "الاتجاه الشهري" : "Monthly Trend"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAr ? "الواردات والصادرات وصافي التدفق شهريًا" : "Monthly inflows, outflows and net cash flow"}
            </p>
          </div>
          <div className="flex rounded-md border overflow-hidden text-xs">
            {([6, 12] as const).map((m) => (
              <button
                key={m}
                onClick={() => setTrendMonths(m)}
                className={cn(
                  "px-3 py-1.5 font-medium transition-colors",
                  trendMonths === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                {m === 6 ? (isAr ? "٦ أشهر" : "6M") : (isAr ? "١٢ شهرًا" : "12M")}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {tLoading ? (
            <Skeleton className="h-[260px] w-full" />
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(240 5.9% 90%)" />
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
                    width={48}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                  />
                  <Tooltip content={<ChartTooltip fmt={fmt} />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(value) =>
                      value === "inflow"
                        ? isAr ? "وارد" : "Inflow"
                        : value === "outflow"
                        ? isAr ? "صادر" : "Outflow"
                        : isAr ? "صافي" : "Net"
                    }
                  />
                  <Line dataKey="inflow" name="inflow" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                  <Line dataKey="outflow" name="outflow" stroke="hsl(0 72% 51%)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                  <Line dataKey="net" name="net" stroke="hsl(243 75% 59%)" strokeWidth={2} strokeDasharray="4 3" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
