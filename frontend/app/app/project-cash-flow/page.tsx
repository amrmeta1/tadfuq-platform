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
  Legend,
} from "recharts";
import {
  FolderKanban,
  TrendingUp,
  Wallet,
  AlertTriangle,
  CalendarClock,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { useCompany } from "@/contexts/CompanyContext";

// ── Types ────────────────────────────────────────────────────────────────────

type ProjectStatus = "on-track" | "at-risk" | "over-budget";
type FilterMode = "all" | "active" | "completed";

interface Project {
  id: string;
  nameEn: string;
  nameAr: string;
  budget: number;
  spent: number;
  status: ProjectStatus;
  burnRate: number;
  estimatedCompletionEn: string;
  estimatedCompletionAr: string;
  isCompleted: boolean;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const PROJECTS: Project[] = [
  {
    id: "p1",
    nameEn: "Al Wakra Mall Construction",
    nameAr: "إنشاء مجمع الوكرة",
    budget: 1_800_000,
    spent: 1_200_000,
    status: "on-track",
    burnRate: 150_000,
    estimatedCompletionEn: "Aug 2026",
    estimatedCompletionAr: "أغسطس ٢٠٢٦",
    isCompleted: false,
  },
  {
    id: "p2",
    nameEn: "ERP Migration Phase 2",
    nameAr: "ترحيل ERP المرحلة الثانية",
    budget: 450_000,
    spent: 380_000,
    status: "over-budget",
    burnRate: 95_000,
    estimatedCompletionEn: "Apr 2026",
    estimatedCompletionAr: "أبريل ٢٠٢٦",
    isCompleted: false,
  },
  {
    id: "p3",
    nameEn: "Lusail Office Fit-out",
    nameAr: "تجهيز مكتب لوسيل",
    budget: 800_000,
    spent: 320_000,
    status: "on-track",
    burnRate: 80_000,
    estimatedCompletionEn: "Oct 2026",
    estimatedCompletionAr: "أكتوبر ٢٠٢٦",
    isCompleted: false,
  },
  {
    id: "p4",
    nameEn: "Fleet Expansion Q1",
    nameAr: "توسعة الأسطول الربع الأول",
    budget: 650_000,
    spent: 620_000,
    status: "at-risk",
    burnRate: 110_000,
    estimatedCompletionEn: "May 2026",
    estimatedCompletionAr: "مايو ٢٠٢٦",
    isCompleted: false,
  },
  {
    id: "p5",
    nameEn: "Website Redesign",
    nameAr: "إعادة تصميم الموقع",
    budget: 120_000,
    spent: 85_000,
    status: "on-track",
    burnRate: 28_000,
    estimatedCompletionEn: "Mar 2026",
    estimatedCompletionAr: "مارس ٢٠٢٦",
    isCompleted: false,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtCurrency(n: number, symbol: string): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${symbol} ${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${symbol} ${(abs / 1_000).toFixed(0)}K`;
  return `${symbol} ${abs.toLocaleString("en-US")}`;
}

function fmtAxisValue(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function pct(spent: number, budget: number): number {
  return Math.round((spent / budget) * 100);
}

const STATUS_CONFIG: Record<
  ProjectStatus,
  { colorClass: string; bgClass: string; progressClass: string; labelEn: string; labelAr: string }
> = {
  "on-track": {
    colorClass: "text-emerald-700 dark:text-emerald-400",
    bgClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    progressClass: "[&>div]:bg-emerald-500",
    labelEn: "On Track",
    labelAr: "في المسار",
  },
  "at-risk": {
    colorClass: "text-amber-700 dark:text-amber-400",
    bgClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    progressClass: "[&>div]:bg-amber-500",
    labelEn: "At Risk",
    labelAr: "في خطر",
  },
  "over-budget": {
    colorClass: "text-red-700 dark:text-red-400",
    bgClass: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800",
    progressClass: "[&>div]:bg-red-500",
    labelEn: "Over Budget",
    labelAr: "تجاوز الميزانية",
  },
};

// ── Chart tooltip ────────────────────────────────────────────────────────────

function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2.5 shadow-md text-xs min-w-[160px] space-y-1">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-mono font-medium tabular-nums">
            {fmtCurrency(entry.value, "SAR")}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectCashFlowPage() {
  const { locale, dir } = useI18n();
  const isAr = locale === "ar";
  const { profile } = useCompany();
  const currencySymbol = profile.currency || "SAR";

  const [filter, setFilter] = useState<FilterMode>("active");

  const filtered = PROJECTS.filter((p) => {
    if (filter === "active") return !p.isCompleted;
    if (filter === "completed") return p.isCompleted;
    return true;
  });

  const totalBudget = PROJECTS.filter((p) => !p.isCompleted).reduce((s, p) => s + p.budget, 0);
  const totalSpent = PROJECTS.filter((p) => !p.isCompleted).reduce((s, p) => s + p.spent, 0);
  const activeCount = PROJECTS.filter((p) => !p.isCompleted).length;
  const atRiskCount = PROJECTS.filter(
    (p) => !p.isCompleted && (p.status === "at-risk" || p.status === "over-budget"),
  ).length;

  const chartData = filtered.map((p) => ({
    name: isAr ? p.nameAr : p.nameEn,
    shortName:
      (isAr ? p.nameAr : p.nameEn).length > 16
        ? (isAr ? p.nameAr : p.nameEn).slice(0, 14) + "…"
        : isAr
          ? p.nameAr
          : p.nameEn,
    budget: p.budget,
    actual: p.spent,
    status: p.status,
  }));

  return (
    <div dir={dir} className="flex flex-col h-full overflow-y-auto bg-background">
      <div className="max-w-6xl w-full mx-auto px-4 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {isAr ? "التدفق النقدي للمشاريع" : "Project Cash Flow"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isAr
                  ? "تتبع ميزانيات وإنفاق المشاريع في الوقت الفعلي"
                  : "Track project budgets and spending in real time"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {(["active", "completed", "all"] as FilterMode[]).map((mode) => (
              <Button
                key={mode}
                variant={filter === mode ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(mode)}
              >
                {mode === "active"
                  ? isAr ? "نشط" : "Active"
                  : mode === "completed"
                    ? isAr ? "مكتمل" : "Completed"
                    : isAr ? "الكل" : "All"}
              </Button>
            ))}
          </div>
        </div>

        {/* ── Summary KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-s-4 border-s-primary">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {isAr ? "المشاريع النشطة" : "Active Projects"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold tabular-nums tracking-tighter">{activeCount}</p>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-s-4 border-s-blue-500">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {isAr ? "إجمالي الميزانية" : "Total Budget"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold tabular-nums tracking-tighter">
                  {fmtCurrency(totalBudget, currencySymbol)}
                </p>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-s-4 border-s-emerald-500">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {isAr ? "إجمالي الإنفاق" : "Total Spent"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold tabular-nums tracking-tighter">
                  {fmtCurrency(totalSpent, currencySymbol)}
                </p>
                <span className="text-xs text-muted-foreground font-medium">
                  ({pct(totalSpent, totalBudget)}%)
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-s-4 border-s-amber-500">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {isAr ? "مشاريع في خطر" : "At Risk"}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold tabular-nums tracking-tighter text-amber-600 dark:text-amber-400">
                  {atRiskCount}
                </p>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-muted-foreground">
                  {isAr ? "مشاريع" : "projects"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Project Cards ── */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {isAr ? "تفاصيل المشاريع" : "Project Details"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((project) => {
              const cfg = STATUS_CONFIG[project.status];
              const percentage = pct(project.spent, project.budget);
              const remaining = project.budget - project.spent;

              return (
                <Card key={project.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold leading-snug">
                        {isAr ? project.nameAr : project.nameEn}
                      </CardTitle>
                      <Badge className={cn("shrink-0 text-[10px]", cfg.bgClass)}>
                        {isAr ? cfg.labelAr : cfg.labelEn}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    {/* Budget vs Spent */}
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-muted-foreground">
                          {isAr ? "الإنفاق" : "Spent"}
                        </span>
                        <span className="font-mono font-medium tabular-nums">
                          {fmtCurrency(project.spent, currencySymbol)}{" "}
                          <span className="text-muted-foreground">
                            / {fmtCurrency(project.budget, currencySymbol)}
                          </span>
                        </span>
                      </div>
                      <Progress
                        value={percentage}
                        className={cn("h-2", cfg.progressClass)}
                      />
                      <p className={cn("text-xs font-semibold tabular-nums text-end", cfg.colorClass)}>
                        {percentage}%
                      </p>
                    </div>

                    {/* Meta rows */}
                    <div className="grid grid-cols-2 gap-y-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">
                          {isAr ? "معدل الحرق/شهر" : "Burn Rate/mo"}
                        </p>
                        <p className="font-medium font-mono tabular-nums">
                          {fmtCurrency(project.burnRate, currencySymbol)}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="text-muted-foreground">
                          {isAr ? "الانتهاء المتوقع" : "Est. Completion"}
                        </p>
                        <p className="font-medium flex items-center justify-end gap-1">
                          <CalendarClock className="h-3 w-3" />
                          {isAr ? project.estimatedCompletionAr : project.estimatedCompletionEn}
                        </p>
                      </div>
                      <div className="col-span-2 pt-2 border-t">
                        <div className="flex items-baseline justify-between">
                          <span className="text-muted-foreground">
                            {isAr ? "المتبقي" : "Remaining"}
                          </span>
                          <span
                            className={cn(
                              "font-mono font-semibold tabular-nums",
                              remaining < 0
                                ? "text-red-600 dark:text-red-400"
                                : "text-foreground",
                            )}
                          >
                            {remaining < 0 ? "-" : ""}
                            {fmtCurrency(Math.abs(remaining), currencySymbol)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ── Budget vs Actual Chart ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              {isAr ? "الميزانية مقابل الفعلي" : "Budget vs Actual Spending"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                  barGap={4}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(240 5.9% 90% / 0.5)"
                  />
                  <XAxis
                    dataKey="shortName"
                    tick={{ fontSize: 10, fill: "hsl(240 3.8% 46.1%)" }}
                    axisLine={false}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }}
                    axisLine={false}
                    tickLine={false}
                    width={55}
                    tickFormatter={fmtAxisValue}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend
                    verticalAlign="top"
                    height={30}
                    formatter={(value: string) =>
                      value === "budget"
                        ? isAr ? "الميزانية" : "Budget"
                        : isAr ? "الفعلي" : "Actual"
                    }
                  />
                  <Bar
                    dataKey="budget"
                    name="budget"
                    fill="hsl(217 91% 60%)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar dataKey="actual" name="actual" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          entry.status === "over-budget"
                            ? "hsl(0 72% 51%)"
                            : entry.status === "at-risk"
                              ? "hsl(38 92% 50%)"
                              : "hsl(142 71% 45%)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ── AI Insight Card ── */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                {isAr ? "تحليل المستشار الذكي" : "Mustashar AI Insight"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-amber-900/80 dark:text-amber-200/80">
              {isAr
                ? "مشروع \"توسعة الأسطول الربع الأول\" بلغ 95% من الميزانية مع بقاء شهرين. أوصي بطلب تمديد ميزانية بقيمة 180,000 ر.س أو تأجيل المشتريات غير الضرورية."
                : "Project \"Fleet Expansion Q1\" is at 95% of budget with 2 months remaining. I recommend requesting a budget extension of SAR 180K or deferring non-critical purchases."}
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" className="text-xs border-amber-300 dark:border-amber-700">
                {isAr ? "طلب تمديد الميزانية" : "Request Budget Extension"}
              </Button>
              <Button size="sm" variant="ghost" className="text-xs">
                {isAr ? "تجاهل" : "Dismiss"}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
