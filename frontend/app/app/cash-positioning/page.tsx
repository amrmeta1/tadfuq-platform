"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  ChevronDown,
  Search,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/context";
import { useCompany } from "@/contexts/CompanyContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

// ── Mock data ──────────────────────────────────────────────────────────────────

const LINE_DATA = [
  { day: "12 ديس", balance: 1_200_000 },
  { day: "19 ديس", balance: -460_000 },
  { day: "26 ديس", balance: 320_000 },
  { day: "2 يناير", balance: 980_000 },
  { day: "9 يناير", balance: 650_000 },
  { day: "16 يناير", balance: 1_100_000 },
];

const BANK_ROWS = [
  { label: "جميع الحسابات", wed: "16,787,545.78", thu: "11,511,633.24", thuNeg: false },
  { label: "الحسابات الجارية", wed: "14,219,430.54", thu: "9,943,518.00", thuNeg: false },
  { label: "Barclays", wed: "2,310,450.00", thu: "2,310,450.00", thuNeg: false },
  { label: "EUR", wed: "1,876,200.00", thu: "-516,401.17", thuNeg: true },
  { label: "HSBC", wed: "9,032,780.54", thu: "-2,924,197.96", thuNeg: true },
];

const TRANSACTIONS = [
  { id: 1, name: "مورد UK", category: "موردين", amount: -1_250_000, type: "out" },
  { id: 2, name: "فاتورة Ooredoo", category: "اتصالات", amount: -87_500, type: "out" },
  { id: 3, name: "تحصيل عميل A", category: "مبيعات", amount: 2_100_000, type: "in" },
  { id: 4, name: "رواتب الموظفين", category: "رواتب", amount: -980_000, type: "out" },
  { id: 5, name: "دفعة موردين", category: "موردين", amount: -430_000, type: "out" },
  { id: 6, name: "إيراد خدمات", category: "خدمات", amount: 768_115, type: "in" },
  { id: 7, name: "إيجار مكتب", category: "مصروفات ثابتة", amount: -125_000, type: "out" },
  { id: 8, name: "تحصيل ذمم", category: "مبيعات", amount: 450_000, type: "in" },
  { id: 9, name: "فاتورة كهرباء", category: "مرافق", amount: -22_412, type: "out" },
  { id: 10, name: "عمولة بنكية", category: "رسوم", amount: -3_500, type: "out" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtAbs(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(abs / 1_000).toFixed(0)}k`;
  return abs.toLocaleString();
}

function fmtFull(n: number, curr: string): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "+";
  return `${sign}${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curr}`;
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────

function LineTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value as number;
  return (
    <div dir="rtl" className="bg-popover border border-border shadow-sm rounded-lg p-3 text-xs min-w-[160px]">
      <p className="font-semibold mb-1">{label}</p>
      <span dir="ltr" className={`font-mono font-medium tabular-nums ${val < 0 ? "text-destructive" : "text-emerald-600"}`} suppressHydrationWarning>
        {fmtFull(val, currency)}
      </span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CashPositioningPage() {
  const { dir } = useI18n();
  const { profile } = useCompany();
  const curr = profile.currency || "SAR";
  const [activeTab, setActiveTab] = useState<"summary" | "calendar">("summary");

  return (
    <div dir={dir} className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-0 w-full max-w-[1800px] mx-auto overflow-hidden p-5 md:p-6 gap-6">

      {/* ══════════════════════════════════════════════════════════════════════
          RIGHT PANE — Master View
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-[3] flex flex-col gap-4 overflow-y-auto min-w-0 pb-4">

        {/* A. Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">تمركز السيولة <span className="text-muted-foreground font-normal text-lg">(Cash positioning)</span></h1>
          <p className="text-sm text-muted-foreground mt-1">12 Dec 2025 → 18 Jan 2026</p>

          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              تخصيص التوقعات
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <CheckSquare className="h-3.5 w-3.5" />
              تعيين المعاملات
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              <Sparkles className="h-3.5 w-3.5" />
              موازنة تلقائية
            </Button>
          </div>

          <p className="text-3xl font-bold text-foreground tabular-nums mt-4" suppressHydrationWarning>
            +16,787,545.78 <span className="text-xl font-semibold text-muted-foreground">{curr}</span>
          </p>
          <div className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md text-xs font-medium w-fit mt-2 flex items-center gap-1">
            ↗ إجمالي الأرصدة البنكية
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              جميع الحسابات <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              جميع المعاملات <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </div>
        </div>

        {/* B. Line Chart */}
        <Card className="shadow-sm border-border/50 shrink-0">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3">تطور الرصيد النقدي</p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={LINE_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="currentColor" opacity={0.05} vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                  tickFormatter={(v: number) => {
                    const abs = Math.abs(v);
                    const sign = v < 0 ? "-" : "";
                    if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
                    if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}k`;
                    return String(v);
                  }}
                />
                <Tooltip content={<LineTooltip currency={curr} />} />

                {/* Danger floor */}
                <ReferenceLine
                  y={-460000}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  label={{ value: "-460,000", position: "insideTopRight", fontSize: 10, fill: "#ef4444" }}
                />

                {/* Today marker */}
                <ReferenceLine
                  x="19 ديس"
                  stroke="#3b82f6"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: "اليوم", position: "insideTopRight", fontSize: 10, fill: "#3b82f6" }}
                />

                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--background)", stroke: "#818cf8", strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: "var(--background)", stroke: "#818cf8", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* C. Bank Grid */}
        <Card className="flex-1 overflow-hidden flex flex-col shadow-sm border-border/50 min-h-[250px]">
          {/* Tabs */}
          <div className="flex border-b shrink-0">
            {[
              { key: "summary", label: "ملخص الأرصدة" },
              { key: "calendar", label: "تقويم المعاملات" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dense table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="sticky right-0 bg-muted/40 z-10 p-2 text-start font-semibold text-muted-foreground min-w-[160px] border-l">
                    الحساب
                  </th>
                  <th className="p-2 text-end font-semibold text-muted-foreground min-w-[140px]">
                    الأربعاء 18/12
                  </th>
                  <th className="p-2 text-end font-semibold min-w-[140px] bg-blue-500/5 text-blue-700 dark:text-blue-400">
                    الخميس 19/12
                    <span className="block text-[9px] font-normal opacity-70">اليوم</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {BANK_ROWS.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="sticky right-0 bg-card z-10 p-2 font-medium border-l shadow-[2px_0_4px_-2px_rgba(0,0,0,0.04)]">
                      {row.label}
                    </td>
                    <td className="p-2 text-end tabular-nums font-mono" suppressHydrationWarning>
                      <span className="flex items-center justify-end gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {row.wed} {curr}
                      </span>
                    </td>
                    <td className={`p-2 text-end tabular-nums font-mono bg-blue-500/5 ${row.thuNeg ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`} suppressHydrationWarning>
                      <span className="flex items-center justify-end gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${row.thuNeg ? "bg-destructive" : "bg-emerald-500"}`} />
                        {row.thu} {curr}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          LEFT PANE — Detail / Transaction Panel
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-[2] flex flex-col gap-4 border-s border-border/50 ps-6 overflow-y-auto min-w-0 pb-4">

        {/* A. Context header */}
        <div className="flex items-start justify-between gap-3 shrink-0">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">19 DECEMBER 2025</p>
            <p className="text-sm font-semibold mt-0.5">HSBC — Current</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/5 px-2.5 py-1.5 text-[11px] font-medium text-destructive shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
            <span suppressHydrationWarning>سحب مكشوف مصرح به: 100,000.00 {curr}</span>
          </div>
        </div>

        {/* B. 4 Micro KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
          {[
            { label: "رصيد افتتاحي", value: "-516,401.17", neg: true },
            { label: "تدفق داخل", value: "+2,868,115.75", neg: false },
            { label: "تدفق خارج", value: "-5,275,912.54", neg: true },
            { label: "رصيد ختامي", value: "-2,924,197.96", neg: true },
          ].map((kpi) => (
            <div key={kpi.label} className="p-2 text-center rounded-lg border bg-card">
              <p className="text-[10px] text-muted-foreground font-medium leading-none mb-1.5">{kpi.label}</p>
              <p className={`text-[11px] font-bold tabular-nums leading-none ${kpi.neg ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`} suppressHydrationWarning>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 w-full shrink-0">
          <RefreshCw className="h-3.5 w-3.5" />
          إنشاء تحويل موازنة (Create balancing transfer)
        </Button>

        {/* C. Transaction list */}
        <Card className="flex-1 overflow-hidden flex flex-col shadow-sm border-border/50">
          {/* Search + filter */}
          <div className="flex items-center gap-2 p-3 border-b shrink-0">
            <div className="relative flex-1">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="بحث في المعاملات..."
                className="h-8 ps-8 text-xs"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 shrink-0">
              جميع الأنواع <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </div>

          {/* Scrollable rows */}
          <div className="flex-1 overflow-y-auto">
            {TRANSACTIONS.map((txn) => (
              <div
                key={txn.id}
                className="p-3 border-b text-sm flex justify-between items-center hover:bg-muted/50 transition-colors gap-3"
              >
                {/* Right side (RTL start) */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <input type="checkbox" className="h-3.5 w-3.5 rounded shrink-0 accent-primary" />
                  {txn.type === "out" ? (
                    <span className="w-4 h-4 rounded-full border-2 border-destructive shrink-0 flex items-center justify-center">
                      <ArrowDownLeft className="h-2.5 w-2.5 text-destructive" />
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 shrink-0 flex items-center justify-center">
                      <ArrowUpRight className="h-2.5 w-2.5 text-white" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium truncate">{txn.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{txn.category}</p>
                  </div>
                </div>

                {/* Left side (RTL end) */}
                <p
                  className={`text-[12px] font-mono font-semibold tabular-nums shrink-0 ${
                    txn.amount < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                  suppressHydrationWarning
                >
                  <span dir="ltr">{txn.amount < 0 ? "-" : "+"}{fmtAbs(txn.amount)} {curr}</span>
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
