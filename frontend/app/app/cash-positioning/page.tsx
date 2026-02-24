"use client";

import { useState, useMemo } from "react";
import {
  Sparkles, ChevronDown, Search, RefreshCw, AlertTriangle,
  Building2, ArrowDownLeft, ArrowUpRight, Zap, TrendingUp,
  Download, Shield, Bot, ChevronRight, X, ArrowLeftRight,
} from "lucide-react";
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Area,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { useCompany } from "@/contexts/CompanyContext";
import { cn } from "@/lib/utils";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtAbs(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(abs / 1_000).toFixed(0)}k`;
  return abs.toLocaleString();
}

function fmtFull(n: number, curr: string, sign = true): string {
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (!sign) return `${formatted} ${curr}`;
  const s = n < 0 ? "-" : "+";
  return `${s}${formatted} ${curr}`;
}

// ── Mock data ──────────────────────────────────────────────────────────────────

interface ChartPoint {
  dateEn: string;
  dateAr: string;
  actual: number | null;
  forecast: number | null;
  isToday?: boolean;
}

const CHART_DATA: ChartPoint[] = [
  { dateEn: "12 Dec", dateAr: "12 ديس", actual: 19_800_000, forecast: null },
  { dateEn: "14 Dec", dateAr: "14 ديس", actual: 21_200_000, forecast: null },
  { dateEn: "17 Dec", dateAr: "17 ديس", actual: 18_900_000, forecast: null },
  { dateEn: "19 Dec", dateAr: "19 ديس", actual: 16_787_545, forecast: 16_787_545, isToday: true },
  { dateEn: "22 Dec", dateAr: "22 ديس", actual: null, forecast: 14_200_000 },
  { dateEn: "26 Dec", dateAr: "26 ديس", actual: null, forecast: 17_500_000 },
  { dateEn: "2 Jan",  dateAr: "2 يناير", actual: null, forecast: 20_100_000 },
  { dateEn: "9 Jan",  dateAr: "9 يناير", actual: null, forecast: 18_600_000 },
  { dateEn: "16 Jan", dateAr: "16 يناير", actual: null, forecast: 22_300_000 },
  { dateEn: "18 Jan", dateAr: "18 يناير", actual: null, forecast: 24_000_000 },
];

interface Account {
  id: string;
  nameEn: string;
  nameAr: string;
  bank: string;
  type: string;
  typeAr: string;
  prevBalance: number;
  todayBalance: number;
  overdraftLimit?: number;
  color: string;
}

const ACCOUNTS: Account[] = [
  { id: "all",    nameEn: "All Accounts",         nameAr: "جميع الحسابات",   bank: "",               type: "Summary",  typeAr: "ملخص",        prevBalance: 18_987_719, todayBalance: 16_787_545, color: "bg-indigo-500" },
  { id: "curr",   nameEn: "Current Accounts",      nameAr: "الحسابات الجارية", bank: "",               type: "Group",    typeAr: "مجموعة",       prevBalance: 16_419_430, todayBalance: 14_219_430, color: "bg-zinc-400" },
  { id: "barc",   nameEn: "Barclays – Corporate",  nameAr: "باركليز - الشركات", bank: "Barclays",      type: "Current",  typeAr: "جاري",         prevBalance: 5_752_678,  todayBalance: 5_752_678,  color: "bg-sky-500" },
  { id: "eur",    nameEn: "EUR Account",            nameAr: "حساب اليورو",     bank: "QNB",            type: "FX",       typeAr: "عملة أجنبية",  prevBalance: 4_427_100,  todayBalance: 4_427_100,  color: "bg-amber-500" },
  { id: "hsbc",   nameEn: "HSBC – Current",         nameAr: "HSBC - جاري",     bank: "HSBC",           type: "Current",  typeAr: "جاري",         prevBalance: -516_401,   todayBalance: -2_924_197, overdraftLimit: -460_000, color: "bg-rose-500" },
  { id: "cbq",    nameEn: "CBQ – Payroll",          nameAr: "CBQ - رواتب",     bank: "CBQ",            type: "Payroll",  typeAr: "رواتب",        prevBalance: 4_239_264,  todayBalance: 4_239_264,  color: "bg-violet-500" },
  { id: "masraf", nameEn: "Masraf Al Rayan",        nameAr: "مصرف الريان",     bank: "Masraf Al Rayan",type: "Islamic",  typeAr: "إسلامي",       prevBalance: 2_568_278,  todayBalance: 2_568_278,  color: "bg-emerald-500" },
];

interface Transaction {
  id: number;
  nameEn: string;
  nameAr: string;
  categoryEn: string;
  categoryAr: string;
  amount: number;
  type: "in" | "out";
  accountId: string;
  vatRingfenced?: boolean;
}

const TRANSACTIONS_BY_DATE: Record<string, Transaction[]> = {
  "19 Dec": [
    { id: 1,  nameEn: "UK Supplier",            nameAr: "مورد المملكة المتحدة",  categoryEn: "Suppliers UK",       categoryAr: "موردون",        amount: -1_000_000,   type: "out", accountId: "hsbc" },
    { id: 2,  nameEn: "Supplier XPDF",           nameAr: "المورد XPDF",           categoryEn: "Suppliers Intl",     categoryAr: "موردون دوليون", amount: -423_792,     type: "out", accountId: "hsbc" },
    { id: 3,  nameEn: "Supplier XPDF",           nameAr: "المورد XPDF",           categoryEn: "Suppliers Intl",     categoryAr: "موردون دوليون", amount: -372_596,     type: "out", accountId: "hsbc" },
    { id: 4,  nameEn: "Supplier XPDF",           nameAr: "المورد XPDF",           categoryEn: "Suppliers Intl",     categoryAr: "موردون دوليون", amount: -368_755,     type: "out", accountId: "hsbc" },
    { id: 5,  nameEn: "Supplier 1",              nameAr: "المورد 1",              categoryEn: "Suppliers UK",       categoryAr: "موردون",        amount: -218_446,     type: "out", accountId: "hsbc" },
    { id: 6,  nameEn: "Supplier 1",              nameAr: "المورد 1",              categoryEn: "Suppliers UK",       categoryAr: "موردون",        amount: -218_446,     type: "out", accountId: "hsbc" },
    { id: 7,  nameEn: "Sale Enterprise #2",      nameAr: "مبيعات مشاريع #2",     categoryEn: "Client 3",           categoryAr: "عميل 3",        amount:  171_345,     type: "in",  accountId: "hsbc" },
    { id: 8,  nameEn: "Sale Enterprise #2",      nameAr: "مبيعات مشاريع #2",     categoryEn: "Client 3",           categoryAr: "عميل 3",        amount:  171_345,     type: "in",  accountId: "hsbc" },
    { id: 9,  nameEn: "Bank Transfer Intl",      nameAr: "تحويل بنكي دولي",      categoryEn: "Suppliers Intl",     categoryAr: "موردون دوليون", amount: -138_607,     type: "out", accountId: "hsbc" },
    { id: 10, nameEn: "PNL Phase 3",             nameAr: "PNL المرحلة 3",        categoryEn: "Suppliers UK",       categoryAr: "موردون",        amount: -113_513,     type: "out", accountId: "hsbc" },
    { id: 11, nameEn: "PNL Phase 3",             nameAr: "PNL المرحلة 3",        categoryEn: "Suppliers UK",       categoryAr: "موردون",        amount: -113_513,     type: "out", accountId: "hsbc" },
    { id: 12, nameEn: "VAT Q4 – ZATCA",          nameAr: "ضريبة القيمة المضافة Q4", categoryEn: "Tax", categoryAr: "ضرائب",             amount: -2_326_525,   type: "out", accountId: "hsbc", vatRingfenced: true },
    { id: 13, nameEn: "Client A – Invoice 041",  nameAr: "العميل أ – فاتورة 041",categoryEn: "Sales",              categoryAr: "مبيعات",        amount: 2_868_115,    type: "in",  accountId: "hsbc" },
  ],
  "22 Dec": [
    { id: 14, nameEn: "Payroll – All Staff",     nameAr: "رواتب الموظفين",       categoryEn: "Payroll",            categoryAr: "رواتب",         amount: -89_000,      type: "out", accountId: "cbq" },
    { id: 15, nameEn: "GOSI Contribution",       nameAr: "التأمينات الاجتماعية", categoryEn: "Government",         categoryAr: "حكومي",         amount: -12_000,      type: "out", accountId: "cbq" },
    { id: 16, nameEn: "Client B – Project Beta", nameAr: "العميل ب – بيتا",      categoryEn: "Sales",              categoryAr: "مبيعات",        amount: 145_000,      type: "in",  accountId: "barc" },
    { id: 17, nameEn: "Supplier Materials",      nameAr: "مواد من المورد",       categoryEn: "Suppliers",          categoryAr: "موردون",        amount: -28_000,      type: "out", accountId: "barc" },
  ],
};

// ── Custom tooltip ─────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, currency }: {
  active?: boolean; payload?: any[]; label?: string; currency: string;
}) {
  if (!active || !payload?.length) return null;
  const actual = payload.find((p) => p.dataKey === "actual");
  const forecast = payload.find((p) => p.dataKey === "forecast");
  return (
    <div className="bg-popover border border-border shadow-lg rounded-xl p-3 text-xs min-w-[180px] space-y-1.5">
      <p className="font-semibold text-foreground">{label}</p>
      {actual?.value != null && (
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-indigo-500 inline-block" />
            Actual
          </span>
          <span className="font-mono font-semibold tabular-nums text-foreground" dir="ltr">
            {fmtAbs(actual.value)} {currency}
          </span>
        </div>
      )}
      {forecast?.value != null && (
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full border border-violet-400 inline-block" />
            Forecast
          </span>
          <span className="font-mono font-semibold tabular-nums text-muted-foreground" dir="ltr">
            {fmtAbs(forecast.value)} {currency}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CashPositioningPage() {
  const { locale, dir } = useI18n();
  const isAr = locale === "ar";
  const { profile } = useCompany();
  const curr = profile.currency || "SAR";

  // Selected date (clicking chart point or account)
  const [selectedDate, setSelectedDate] = useState("19 Dec");
  const [selectedAccountId, setSelectedAccountId] = useState("hsbc");
  const [txSearch, setTxSearch] = useState("");
  const [aiExpanded, setAiExpanded] = useState(true);

  const selectedAccount = ACCOUNTS.find((a) => a.id === selectedAccountId) ?? ACCOUNTS[4];
  const rawTransactions = TRANSACTIONS_BY_DATE[selectedDate] ?? TRANSACTIONS_BY_DATE["19 Dec"];

  const filteredTxns = useMemo(() => {
    const query = txSearch.toLowerCase();
    return rawTransactions.filter((t) => {
      const name = isAr ? t.nameAr : t.nameEn;
      const cat = isAr ? t.categoryAr : t.categoryEn;
      return !query || name.toLowerCase().includes(query) || cat.toLowerCase().includes(query);
    });
  }, [rawTransactions, txSearch, isAr]);

  const totalInflow  = rawTransactions.filter((t) => t.type === "in").reduce((s, t) => s + t.amount, 0);
  const totalOutflow = rawTransactions.filter((t) => t.type === "out").reduce((s, t) => s + t.amount, 0);
  const openingBal   = selectedAccount.prevBalance;
  const closingBal   = openingBal + totalInflow + totalOutflow;
  const isOverdraft  = closingBal < 0;
  const vatAmount    = rawTransactions.filter((t) => t.vatRingfenced).reduce((s, t) => s + Math.abs(t.amount), 0);

  const chartData = CHART_DATA.map((p) => ({
    ...p,
    date: isAr ? p.dateAr : p.dateEn,
  }));

  function handleChartClick(data: any) {
    if (data?.activePayload?.[0]) {
      const point = data.activePayload[0].payload as ChartPoint;
      const dateKey = point.dateEn;
      if (TRANSACTIONS_BY_DATE[dateKey]) setSelectedDate(dateKey);
    }
  }

  return (
    <div dir={dir} className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] w-full overflow-hidden">

      {/* ════════════════════════════════════════════════════════════════════════
          MASTER PANE (LEFT)
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="flex-[3] flex flex-col gap-4 overflow-y-auto p-5 md:p-6 min-w-0 pb-6">

        {/* ── Header ── */}
        <div>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {isAr ? "تمركز السيولة" : "Cash Positioning"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isAr ? "12 ديس 2025 ← 18 يناير 2026" : "12 Dec 2025 → 18 Jan 2026"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                <Download className="h-3.5 w-3.5" />
                {isAr ? "تصدير" : "Export"}
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                {isAr ? "جميع الحسابات" : "All Accounts"} <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
              <Button size="sm" className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.6)]">
                <Sparkles className="h-3.5 w-3.5" />
                {isAr ? "موازنة ذكية" : "Smart Balance"}
              </Button>
            </div>
          </div>

          {/* Total balance */}
          <div className="mt-4 flex items-end gap-3 flex-wrap">
            <div>
              <p className="text-3xl font-bold tabular-nums tracking-tight" dir="ltr" suppressHydrationWarning>
                +16,787,545.78{" "}
                <span className="text-xl font-semibold text-muted-foreground">{curr}</span>
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-medium">
                  <ArrowUpRight className="h-3 w-3" />
                  {isAr ? "إجمالي الأرصدة البنكية" : "Total Bank Balances"}
                </span>
                {isOverdraft && (
                  <span className="inline-flex items-center gap-1 text-xs text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md font-medium animate-pulse">
                    <AlertTriangle className="h-3 w-3" />
                    {isAr ? "HSBC في منطقة السحب المكشوف" : "HSBC in overdraft zone"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              {isAr ? "تخصيص التوقعات" : "Allocate Forecast"} <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              {isAr ? "تعيين معاملات" : "Assign Transactions"} <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </div>
        </div>

        {/* ── Chart card ── */}
        <Card className="shadow-sm border-border/50 shrink-0">
          <CardContent className="p-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {isAr ? "تطور الرصيد النقدي" : "Cash Balance Trend"}
              </p>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 bg-indigo-500 inline-block rounded" />
                  {isAr ? "فعلي" : "Actual"}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-4 border-t-2 border-dashed border-violet-400 inline-block" />
                  {isAr ? "متوقع" : "Forecast"}
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart
                data={chartData}
                margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                onClick={handleChartClick}
                style={{ cursor: "pointer" }}
              >
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="rgb(99,102,241)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="rgb(99,102,241)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="currentColor" opacity={0.04} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(240 3.8% 46.1%)" }}
                  axisLine={false}
                  tickLine={false}
                  width={54}
                  tickFormatter={(v: number) => {
                    const abs = Math.abs(v);
                    if (abs >= 1_000_000) return `${v < 0 ? "-" : ""}${(abs / 1_000_000).toFixed(0)}M`;
                    if (abs >= 1_000)     return `${v < 0 ? "-" : ""}${(abs / 1_000).toFixed(0)}k`;
                    return String(v);
                  }}
                />
                <Tooltip content={<ChartTooltip currency={curr} />} />

                {/* Zero reference */}
                <ReferenceLine y={0} stroke="hsl(240 3.8% 46.1%)" strokeOpacity={0.3} strokeWidth={1} />

                {/* Authorized overdraft floor */}
                <ReferenceLine
                  y={-460_000}
                  stroke="#ef4444"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{ value: "-460k OD", position: "insideTopRight", fontSize: 9, fill: "#ef4444" }}
                />

                {/* Today marker */}
                <ReferenceLine
                  x={isAr ? "19 ديس" : "19 Dec"}
                  stroke="#3b82f6"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: isAr ? "اليوم" : "Today", position: "insideTopRight", fontSize: 10, fill: "#3b82f6" }}
                />

                {/* Area fill under actual */}
                <Area
                  type="monotone"
                  dataKey="actual"
                  fill="url(#actualGrad)"
                  stroke="transparent"
                  connectNulls={false}
                />

                {/* Actual line */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="rgb(99,102,241)"
                  strokeWidth={2.5}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    const isSelected = (isAr ? payload.dateAr : payload.dateEn) === selectedDate || payload.dateEn === selectedDate;
                    return (
                      <circle
                        key={`dot-actual-${payload.dateEn}`}
                        cx={cx} cy={cy} r={isSelected ? 6 : 4}
                        fill={isSelected ? "rgb(99,102,241)" : "var(--background)"}
                        stroke="rgb(99,102,241)"
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={{ r: 6, fill: "rgb(99,102,241)", stroke: "var(--background)", strokeWidth: 2 }}
                  connectNulls={false}
                />

                {/* Forecast line (dashed) */}
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="rgb(167,139,250)"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={{ r: 3, fill: "var(--background)", stroke: "rgb(167,139,250)", strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: "rgb(167,139,250)", stroke: "var(--background)", strokeWidth: 2 }}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── Account grid ── */}
        <Card className="flex-1 overflow-hidden flex flex-col shadow-sm border-border/50 min-h-[220px]">
          <div className="flex border-b shrink-0">
            <div className="px-4 py-2.5 text-xs font-semibold border-b-2 border-primary text-foreground">
              {isAr ? "ملخص الأرصدة" : "Balance Summary"}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="sticky start-0 bg-muted/30 z-10 p-2.5 text-start font-semibold text-muted-foreground min-w-[180px]">
                    {isAr ? "الحساب" : "Account"}
                  </th>
                  <th className="p-2.5 text-end font-semibold text-muted-foreground min-w-[150px]">
                    {isAr ? "الأربعاء 18/12" : "Wed 18/12"}
                  </th>
                  <th className="p-2.5 text-end font-semibold min-w-[150px] bg-indigo-500/5 text-indigo-700 dark:text-indigo-400">
                    {isAr ? "الخميس 19/12" : "Thu 19/12"}
                    <span className="block text-[9px] font-normal opacity-70">{isAr ? "اليوم" : "Today"}</span>
                  </th>
                  <th className="p-2.5 text-end font-semibold text-muted-foreground min-w-[80px]">
                    {isAr ? "التغيير" : "Change"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ACCOUNTS.map((acc) => {
                  const delta = acc.todayBalance - acc.prevBalance;
                  const isNegToday = acc.todayBalance < 0;
                  const isSelected = selectedAccountId === acc.id;
                  return (
                    <tr
                      key={acc.id}
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={cn(
                        "border-b transition-colors cursor-pointer",
                        isSelected ? "bg-primary/5 hover:bg-primary/8" : "hover:bg-muted/40",
                        acc.id === "all" && "font-semibold bg-muted/20"
                      )}
                    >
                      <td className="sticky start-0 bg-card p-2.5 z-10">
                        <div className="flex items-center gap-2">
                          {acc.id !== "all" && acc.id !== "curr" && (
                            <span className={`w-2 h-2 rounded-full shrink-0 ${acc.color}`} />
                          )}
                          <span className={cn(acc.id === "all" || acc.id === "curr" ? "ps-1" : "")}>
                            {isAr ? acc.nameAr : acc.nameEn}
                          </span>
                          {acc.overdraftLimit && (
                            <Badge variant="destructive" className="text-[9px] px-1 py-0 h-4">OD</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 text-end tabular-nums font-mono" suppressHydrationWarning>
                        <span className="flex items-center justify-end gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${acc.prevBalance < 0 ? "bg-destructive" : "bg-emerald-500"}`} />
                          <span className={acc.prevBalance < 0 ? "text-destructive" : ""}>
                            {fmtAbs(acc.prevBalance)} {curr}
                          </span>
                        </span>
                      </td>
                      <td className={cn(
                        "p-2.5 text-end tabular-nums font-mono bg-indigo-500/5",
                        isNegToday ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                      )} suppressHydrationWarning>
                        <span className="flex items-center justify-end gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isNegToday ? "bg-destructive" : "bg-emerald-500"}`} />
                          {fmtAbs(acc.todayBalance)} {curr}
                        </span>
                      </td>
                      <td className="p-2.5 text-end tabular-nums">
                        <span className={cn(
                          "text-[11px] font-medium",
                          delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                        )}>
                          {delta >= 0 ? "+" : ""}{fmtAbs(delta)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          DETAIL PANE (RIGHT)
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="flex-[2] flex flex-col border-s border-border/50 overflow-y-auto min-w-0 pb-6">

        {/* Context header */}
        <div className="px-5 pt-5 pb-4 border-b border-border/50 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                {selectedDate.toUpperCase()} 2025
              </p>
              <p className="text-sm font-semibold mt-0.5">
                {isAr ? selectedAccount.nameAr : selectedAccount.nameEn}
                {selectedAccount.bank && (
                  <span className="text-muted-foreground font-normal"> — {selectedAccount.bank}</span>
                )}
              </p>
            </div>
            {selectedAccount.overdraftLimit && (
              <div className="flex items-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/5 px-2.5 py-1.5 text-[11px] font-medium text-destructive shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse shrink-0" />
                <span dir="ltr">OD Limit: {Math.abs(selectedAccount.overdraftLimit).toLocaleString()} {curr}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 flex-1">

          {/* 4 Micro KPIs */}
          <div className="grid grid-cols-2 gap-2 shrink-0">
            {[
              { labelEn: "Opening Balance", labelAr: "رصيد افتتاحي", value: openingBal,    neg: openingBal < 0 },
              { labelEn: "Cash Inflow",      labelAr: "تدفق داخل",    value: totalInflow,   neg: false },
              { labelEn: "Cash Outflow",     labelAr: "تدفق خارج",    value: totalOutflow,  neg: true },
              { labelEn: "Closing Balance",  labelAr: "رصيد ختامي",   value: closingBal,    neg: closingBal < 0 },
            ].map((kpi) => (
              <div
                key={kpi.labelEn}
                className={cn(
                  "p-3 rounded-xl border text-center",
                  kpi.neg ? "border-destructive/20 bg-destructive/5" : "border-emerald-500/20 bg-emerald-500/5"
                )}
              >
                <p className="text-[10px] text-muted-foreground font-medium leading-none mb-1.5">
                  {isAr ? kpi.labelAr : kpi.labelEn}
                </p>
                <p className={cn(
                  "text-[11px] font-bold tabular-nums leading-none",
                  kpi.neg ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                )} dir="ltr" suppressHydrationWarning>
                  {kpi.value >= 0 ? "+" : ""}{fmtAbs(kpi.value)}
                </p>
              </div>
            ))}
          </div>

          {/* VAT ring-fenced badge */}
          {vatAmount > 0 && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/8 px-3 py-2.5 shrink-0">
              <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {isAr ? "ضريبة القيمة المضافة محمية" : "VAT Ring-Fenced"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isAr
                    ? `${fmtAbs(vatAmount)} ${curr} مجمدة للزكاة والضريبة`
                    : `${fmtAbs(vatAmount)} ${curr} locked for ZATCA`}
                </p>
              </div>
              <Badge className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium px-2 h-5">
                {isAr ? "مؤمّن" : "Locked"}
              </Badge>
            </div>
          )}

          {/* Create balancing transfer */}
          {isOverdraft && (
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 w-full border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/5 shrink-0">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              {isAr ? "إنشاء تحويل موازنة" : "Create Balancing Transfer"}
              <ChevronRight className="h-3.5 w-3.5 ms-auto opacity-50" />
            </Button>
          )}

          {/* AI Mustashar insight */}
          {aiExpanded && (
            <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/8 to-violet-500/5 p-4 shrink-0">
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 ring-2 ring-indigo-500/20">
                  <Bot className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                      {isAr ? "تنبيه مستشار" : "Mustashar Insight"}
                    </p>
                    <button onClick={() => setAiExpanded(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed mt-1.5">
                    {isAr
                      ? <>رصيد HSBC سيتجاوز حد السحب المكشوف المرخص (<strong>460,000 {curr}</strong>) بحلول <strong>25 ديسمبر</strong> بسبب دفعات الموردين. أنصح بتحويل <strong>3.4M {curr}</strong> من QNB لتجنب الغرامات.</>
                      : <>HSBC will breach its authorized overdraft of <strong>{curr} 460,000</strong> by <strong>Dec 25</strong> due to supplier payouts. Consider transferring <strong>{curr} 3.4M</strong> from QNB Corporate to avoid penalty charges.</>
                    }
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="h-7 text-[11px] gap-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_-5px_rgba(99,102,241,0.5)]">
                      <Zap className="h-3 w-3" />
                      {isAr ? "تحويل فوري" : "Transfer Now"}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {isAr ? "عرض سيناريوهات" : "View Scenarios"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction list */}
          <Card className="flex-1 flex flex-col overflow-hidden shadow-sm border-border/50 min-h-[280px]">
            {/* Search + filter row */}
            <div className="flex items-center gap-2 p-3 border-b shrink-0">
              <div className="relative flex-1">
                <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={isAr ? "بحث في المعاملات..." : "Search transactions..."}
                  className="h-8 ps-8 text-xs"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 shrink-0">
                {isAr ? "الكل" : "All Types"} <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto">
              {filteredTxns.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {isAr ? "لا توجد معاملات" : "No transactions found"}
                </div>
              ) : (
                filteredTxns.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input type="checkbox" className="h-3.5 w-3.5 rounded shrink-0 accent-primary" />
                      {txn.type === "out" ? (
                        <span className="w-5 h-5 rounded-full border-2 border-destructive shrink-0 flex items-center justify-center">
                          <ArrowDownLeft className="h-3 w-3 text-destructive" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 shrink-0 flex items-center justify-center">
                          <ArrowUpRight className="h-3 w-3 text-white" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-[12px] font-medium truncate">
                            {isAr ? txn.nameAr : txn.nameEn}
                          </p>
                          {txn.vatRingfenced && (
                            <Badge className="text-[9px] px-1 py-0 h-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                              {isAr ? "ضريبة" : "VAT"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {isAr ? txn.categoryAr : txn.categoryEn}
                        </p>
                      </div>
                    </div>

                    <p className={cn(
                      "text-[12px] font-mono font-semibold tabular-nums shrink-0",
                      txn.amount < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                    )} dir="ltr" suppressHydrationWarning>
                      {txn.amount < 0 ? "-" : "+"}{fmtAbs(txn.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
