"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Building2,
  Sparkles,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  MessageCircle,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Newspaper,
  CalendarDays,
  Boxes,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Zap,
  Target,
  Activity,
  Timer,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useI18n } from "@/lib/i18n/context";
import { useCompany } from "@/contexts/CompanyContext";
import { exportToCSV, formatForExport } from "@/lib/export";
import { cn } from "@/lib/utils";

const CashFlowChart = dynamic(
  () => import("@/components/dashboard/CashFlowChart"),
  { ssr: false, loading: () => <Skeleton className="h-[430px] w-full rounded-xl" /> }
);

const BANK_ACCOUNTS = [
  { nameEn: "QNB - Corporate Account", nameAr: "QNB - حساب الشركات", balance: 125400, share: 0.58 },
  { nameEn: "CBQ - Payroll Account", nameAr: "CBQ - حساب الرواتب", balance: 54200, share: 0.25 },
  { nameEn: "Masraf Al Rayan - Deposits", nameAr: "مصرف الريان - ودائع", balance: 38740, share: 0.17 },
];

const TOTAL_BANK = 218340;
const VISIBLE_ACCOUNTS = 2;
const HEALTH_SCORE = 82;

const FORECAST_7D = [
  { day: "Mon", dayAr: "اثنين", balance: 218340 },
  { day: "Tue", dayAr: "ثلاثاء", balance: 241340 },
  { day: "Wed", dayAr: "أربعاء", balance: 238140 },
  { day: "Thu", dayAr: "خميس", balance: 245640 },
  { day: "Fri", dayAr: "جمعة", balance: 245640 },
  { day: "Sat", dayAr: "سبت", balance: 253140 },
  { day: "Sun", dayAr: "أحد", balance: 268000 },
];

interface RecentTx {
  id: string;
  descEn: string;
  descAr: string;
  amount: number;
  type: "inflow" | "outflow";
  time: string;
  timeAr: string;
}

const RECENT_TX: RecentTx[] = [
  { id: "1", descEn: "Client B payment received", descAr: "دفعة العميل ب", amount: 67000, type: "inflow", time: "2h ago", timeAr: "منذ ٢ س" },
  { id: "2", descEn: "Ooredoo auto-debit", descAr: "خصم أوريدو التلقائي", amount: 3200, type: "outflow", time: "5h ago", timeAr: "منذ ٥ س" },
  { id: "3", descEn: "Service revenue - Project Alpha", descAr: "إيراد خدمات - مشروع ألفا", amount: 23000, type: "inflow", time: "1d ago", timeAr: "منذ يوم" },
  { id: "4", descEn: "Office rent payment", descAr: "دفع إيجار المكتب", amount: 15000, type: "outflow", time: "2d ago", timeAr: "منذ ٢ أيام" },
  { id: "5", descEn: "Client A invoice payment", descAr: "دفعة فاتورة العميل أ", amount: 45000, type: "inflow", time: "3d ago", timeAr: "منذ ٣ أيام" },
];

interface UpcomingPmt {
  id: string;
  descEn: string;
  descAr: string;
  amount: number;
  daysUntil: number;
  severity: "danger" | "warning" | "normal";
}

const UPCOMING: UpcomingPmt[] = [
  { id: "1", descEn: "Payroll - All Staff", descAr: "رواتب الموظفين", amount: 89000, daysUntil: 3, severity: "danger" },
  { id: "2", descEn: "GOSI / Social Insurance", descAr: "التأمينات الاجتماعية", amount: 12000, daysUntil: 3, severity: "warning" },
  { id: "3", descEn: "Supplier X - Materials", descAr: "المورد X - مواد", amount: 28000, daysUntil: 7, severity: "normal" },
  { id: "4", descEn: "VAT Filing Q1", descAr: "إقرار ضريبة Q1", amount: 18500, daysUntil: 12, severity: "normal" },
];

const STORAGE_KEY = "dashboard-visible-sections";

interface SectionVisibility {
  kpi: boolean;
  chart: boolean;
  banks: boolean;
  agents: boolean;
  forecast: boolean;
  activity: boolean;
  upcoming: boolean;
  performance: boolean;
}

const DEFAULT_VISIBILITY: SectionVisibility = {
  kpi: true, chart: true, banks: true, agents: true,
  forecast: true, activity: true, upcoming: true, performance: true,
};

function loadVisibility(): SectionVisibility {
  if (typeof window === "undefined") return DEFAULT_VISIBILITY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_VISIBILITY, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return DEFAULT_VISIBILITY;
}

function ForecastTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs min-w-[120px]">
      <p className="font-semibold mb-0.5">{label}</p>
      <p className="tabular-nums font-medium text-indigo-600 dark:text-indigo-400">
        {currency} {Number(payload[0]?.value).toLocaleString()}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { locale, dir, t } = useI18n();
  const d = t.dashboard;
  const { profile } = useCompany();
  const curr = profile.currency || "SAR";
  const companyName = profile.companyName || (locale === "ar" ? "شركتك" : "your company");
  const isAr = locale === "ar";

  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const visibleAccounts = showAllAccounts ? BANK_ACCOUNTS : BANK_ACCOUNTS.slice(0, VISIBLE_ACCOUNTS);
  const hasMore = BANK_ACCOUNTS.length > VISIBLE_ACCOUNTS;

  const handleExportCSV = () => {
    const kpiData = [
      { [isAr ? "المؤشر" : "Metric"]: isAr ? "إجمالي الرصيد" : "Total Balance", [isAr ? "القيمة" : "Value"]: formatForExport(TOTAL_BANK, locale), [isAr ? "العملة" : "Currency"]: curr, [isAr ? "التغيير" : "Change"]: "+2.1%" },
      { [isAr ? "المؤشر" : "Metric"]: isAr ? "إجمالي الإيرادات" : "Total Revenue", [isAr ? "القيمة" : "Value"]: formatForExport(112000, locale), [isAr ? "العملة" : "Currency"]: curr, [isAr ? "التغيير" : "Change"]: "+12%" },
      { [isAr ? "المؤشر" : "Metric"]: isAr ? "إجمالي المصروفات" : "Total Expenses", [isAr ? "القيمة" : "Value"]: formatForExport(79000, locale), [isAr ? "العملة" : "Currency"]: curr, [isAr ? "التغيير" : "Change"]: "-3.1%" },
      { [isAr ? "المؤشر" : "Metric"]: isAr ? "فترة التشغيل" : "Runway", [isAr ? "القيمة" : "Value"]: "8.3", [isAr ? "العملة" : "Currency"]: isAr ? "أشهر" : "months", [isAr ? "التغيير" : "Change"]: isAr ? "مستقر" : "Stable" },
      ...BANK_ACCOUNTS.map((acc) => ({ [isAr ? "المؤشر" : "Metric"]: isAr ? acc.nameAr : acc.nameEn, [isAr ? "القيمة" : "Value"]: formatForExport(acc.balance, locale), [isAr ? "العملة" : "Currency"]: curr, [isAr ? "التغيير" : "Change"]: `${(acc.share * 100).toFixed(0)}%` })),
    ];
    exportToCSV(kpiData, `dashboard-report-${new Date().toISOString().slice(0, 10)}`);
  };

  const [sections, setSections] = useState<SectionVisibility>(DEFAULT_VISIBILITY);
  useEffect(() => { setSections(loadVisibility()); }, []);
  const toggleSection = useCallback((key: keyof SectionVisibility) => {
    setSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const forecastData = FORECAST_7D.map((d_) => ({ ...d_, day: isAr ? d_.dayAr : d_.day }));
  const forecastEnd = FORECAST_7D[FORECAST_7D.length - 1].balance;
  const forecastChange = forecastEnd - TOTAL_BANK;

  return (
    <div dir={dir} className="flex flex-col gap-5 p-5 md:p-6 overflow-y-auto h-full">

      {/* ═══ WELCOME BANNER ═══ */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-emerald-50/50 dark:from-indigo-950/20 dark:via-background dark:to-emerald-950/10 border border-border/50 p-5 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mb-1">
              {d.overviewOf} {companyName}
            </p>
            <h1 suppressHydrationWarning className="text-xl md:text-2xl font-bold tracking-tight">
              {d.greeting}, Adam
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{d.last6Months} · {d.trialData}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold",
              HEALTH_SCORE >= 80
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
            )}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              {d.healthScore}: {HEALTH_SCORE}/100
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5" />
              {d.exportReport}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {d.customize}
                </Button>
              </SheetTrigger>
              <SheetContent side={isAr ? "left" : "right"}>
                <SheetHeader>
                  <SheetTitle>{d.customize}</SheetTitle>
                  <SheetDescription>{d.customizeDesc}</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 p-6">
                  {([
                    { key: "kpi" as const, label: d.sectionKpi },
                    { key: "chart" as const, label: d.sectionChart },
                    { key: "forecast" as const, label: d.sectionForecast },
                    { key: "banks" as const, label: d.sectionBanks },
                    { key: "activity" as const, label: d.sectionActivity },
                    { key: "upcoming" as const, label: d.sectionUpcoming },
                    { key: "performance" as const, label: d.sectionPerformance },
                    { key: "agents" as const, label: d.sectionAgents },
                  ]).map((item) => (
                    <label key={item.key} className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm font-medium">{item.label}</span>
                      <Switch checked={sections[item.key]} onCheckedChange={() => toggleSection(item.key)} />
                    </label>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <Link href="/app/daily-brief">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 bg-white/60 dark:bg-background/60">
              <Newspaper className="h-3.5 w-3.5" /> {d.viewBrief}
            </Button>
          </Link>
          <Link href="/app/cash-calendar">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 bg-white/60 dark:bg-background/60">
              <CalendarDays className="h-3.5 w-3.5" /> {d.viewCalendar}
            </Button>
          </Link>
          <Link href="/app/scenario-planner">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 bg-white/60 dark:bg-background/60">
              <Boxes className="h-3.5 w-3.5" /> {d.viewScenario}
            </Button>
          </Link>
          <Link href="/app/benchmark">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 bg-white/60 dark:bg-background/60">
              <BarChart3 className="h-3.5 w-3.5" /> {d.viewBenchmark}
            </Button>
          </Link>
        </div>
      </div>

      {/* ═══ KPI STRIP (horizontal) ═══ */}
      {sections.kpi && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Balance */}
          <Card className="shadow-sm border-border/50 overflow-hidden bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide leading-none">{d.totalBalance}</p>
              </div>
              <p suppressHydrationWarning className="text-xl font-bold tabular-nums tracking-tight leading-none">
                {curr} {TOTAL_BANK.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">{d.across3Accounts}</p>
              <div className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md text-xs font-medium w-fit mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />+2.1%
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide leading-none">{d.totalRevenue}</p>
              </div>
              <p suppressHydrationWarning className="text-xl font-bold tabular-nums tracking-tight leading-none">
                {curr} 112,000
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">{d.thisMonth}</p>
              <div className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md text-xs font-medium w-fit mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />+12%
              </div>
            </CardContent>
          </Card>

          {/* Expenses */}
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide leading-none">{d.totalExpenses}</p>
              </div>
              <p suppressHydrationWarning className="text-xl font-bold tabular-nums tracking-tight leading-none">
                {curr} 79,000
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">{d.topBurn}</p>
              <div className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md text-xs font-medium w-fit mt-2 flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" />-3.1%
              </div>
            </CardContent>
          </Card>

          {/* Runway */}
          <Card className="shadow-sm border-border/50 overflow-hidden bg-muted/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide leading-none">{d.runway}</p>
              </div>
              <p className="text-xl font-bold tabular-nums tracking-tight leading-none">
                8.3 {d.runwayMonths}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">{d.basedOnBurnRate}</p>
              <div className="text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md text-xs font-medium w-fit mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />{d.stable}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ MAIN CHART + 7-DAY FORECAST ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
        {/* Cash Flow Chart */}
        {sections.chart && (
          <Card className="shadow-sm border-border/50 p-1">
            <CashFlowChart currency={curr} />
          </Card>
        )}

        {/* 7-Day Forecast mini chart */}
        {sections.forecast && (
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  <CardTitle className="text-sm font-semibold">{d.next7Days}</CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px]">87% {d.forecastConfidence}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(239 84% 67%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(239 84% 67%)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(240 3.8% 46.1%)" }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={["dataMin - 10000", "dataMax + 10000"]} />
                    <Tooltip content={<ForecastTooltip currency={curr} />} />
                    <Area type="monotone" dataKey="balance" stroke="hsl(239 84% 67%)" strokeWidth={2} fill="url(#forecastGrad)" dot={{ r: 3, fill: "var(--background)", stroke: "hsl(239 84% 67%)", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between px-3 pt-2 border-t border-border/50">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{isAr ? "الرصيد المتوقع" : "Projected"}</p>
                  <p className="text-sm font-bold tabular-nums">{curr} {forecastEnd.toLocaleString()}</p>
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md",
                  forecastChange >= 0 ? "text-emerald-600 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10"
                )}>
                  {forecastChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {forecastChange >= 0 ? "+" : ""}{curr} {forecastChange.toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═══ MIDDLE ROW: Performance + Banks + Upcoming ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Performance Metrics */}
        {sections.performance && (
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">{d.performance}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              {/* DSO */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{d.dso}</span>
                  <span className="text-sm font-bold tabular-nums">32 {d.dsoDays}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: "35%" }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{isAr ? "متوسط القطاع: ٤٥ يوم" : "Industry avg: 45 days"}</p>
              </div>
              {/* Collection Rate */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{d.collectionRate}</span>
                  <span className="text-sm font-bold tabular-nums text-emerald-600">85%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: "85%" }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{isAr ? "متوسط القطاع: ٧٢٪" : "Industry avg: 72%"}</p>
              </div>
              {/* Burn Multiple */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{d.burnMultiple}</span>
                  <span className="text-sm font-bold tabular-nums">0.71x</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: "71%" }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{isAr ? "هدف: أقل من ١x" : "Target: below 1x"}</p>
              </div>
              {/* Net Cash Flow */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{d.netCashFlow}</span>
                  <span className="text-sm font-bold tabular-nums text-emerald-600">+{curr} 33,000</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: "60%" }} />
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">{d.cashFlowPositive}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bank Accounts */}
        {sections.banks && (
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">{d.bankBalances}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-4">
              {visibleAccounts.map((acc) => (
                <div key={acc.nameEn}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted shrink-0">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium">{isAr ? acc.nameAr : acc.nameEn}</span>
                    </div>
                    <span suppressHydrationWarning className="text-sm font-semibold tabular-nums ms-auto ps-4">
                      {curr} {acc.balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${(acc.share * 100).toFixed(0)}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{(acc.share * 100).toFixed(0)}% {d.ofTotal}</p>
                </div>
              ))}
              {hasMore && (
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <button type="button" onClick={() => setShowAllAccounts(!showAllAccounts)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium">
                    {showAllAccounts ? <><ChevronUp className="h-3 w-3" />{d.showLess}</> : <><ChevronDown className="h-3 w-3" />{d.showAll} ({BANK_ACCOUNTS.length})</>}
                  </button>
                  <Link href="/app/cash-positioning" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                    {t.nav.cashPositioning} →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Payments */}
        {sections.upcoming && (
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">{d.upcomingPayments}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {UPCOMING.map((pmt) => (
                <div key={pmt.id} className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                  pmt.severity === "danger" ? "border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/10" :
                  pmt.severity === "warning" ? "border-amber-200 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/10" :
                  "border-border/50"
                )}>
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    pmt.severity === "danger" ? "bg-rose-100 dark:bg-rose-900/40" :
                    pmt.severity === "warning" ? "bg-amber-100 dark:bg-amber-900/40" :
                    "bg-muted"
                  )}>
                    {pmt.severity === "danger" ? <AlertTriangle className="h-4 w-4 text-rose-500" /> :
                     pmt.severity === "warning" ? <Clock className="h-4 w-4 text-amber-500" /> :
                     <Calendar className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{isAr ? pmt.descAr : pmt.descEn}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {d.dueIn} {pmt.daysUntil} {d.days}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-rose-600 dark:text-rose-400 shrink-0">
                    -{curr} {pmt.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═══ BOTTOM ROW: Recent Activity + AI Agents ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Activity */}
        {sections.activity && (
          <Card className="shadow-sm border-border/50">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">{d.recentActivity}</CardTitle>
                </div>
                <Link href="/app/transactions" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                  {t.nav.transactions} →
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-1">
                {RECENT_TX.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-b-0">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      tx.type === "inflow" ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-rose-100 dark:bg-rose-900/40"
                    )}>
                      {tx.type === "inflow"
                        ? <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                        : <ArrowUpRight className="h-4 w-4 text-rose-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{isAr ? tx.descAr : tx.descEn}</p>
                      <p className="text-[10px] text-muted-foreground">{isAr ? tx.timeAr : tx.time}</p>
                    </div>
                    <span className={cn(
                      "text-sm font-semibold tabular-nums shrink-0",
                      tx.type === "inflow" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}>
                      {tx.type === "inflow" ? "+" : "-"}{curr} {tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Agents */}
        {sections.agents && (
          <Card className="bg-card border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">{d.aiAgents}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">👁️</span>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{d.monitoringAgent}</p>
                </div>
                <p className="text-sm text-foreground leading-snug">{d.monitoringMsg}</p>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400">
                  <MessageCircle className="h-3 w-3" />{d.sendWhatsapp}
                </Button>
              </div>
              <div className="rounded-lg border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔮</span>
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">{d.forecastingAgent}</p>
                </div>
                <p className="text-sm text-foreground leading-snug">{d.forecastingMsg}</p>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400">
                  <TrendingDown className="h-3 w-3" />{d.viewForecast}
                </Button>
              </div>
              <div className="rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🧠</span>
                  <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">{d.decisionAgent}</p>
                </div>
                <p className="text-sm text-foreground leading-snug">{d.decisionMsg}</p>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400">
                  <ArrowLeftRight className="h-3 w-3" />{d.postponeInvoice}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
