"use client";

import { useState } from "react";
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
import { useI18n } from "@/lib/i18n/context";
import { useCompany } from "@/contexts/CompanyContext";

const CashFlowChart = dynamic(
  () => import("@/components/dashboard/CashFlowChart"),
  { ssr: false, loading: () => <Skeleton className="h-[430px] w-full rounded-xl" /> }
);

const BANK_ACCOUNTS = [
  { nameEn: "QNB - Corporate Account", nameAr: "QNB - حساب الشركات",   balance: 125400, share: 0.58 },
  { nameEn: "CBQ - Payroll Account",   nameAr: "CBQ - حساب الرواتب",   balance: 54200,  share: 0.25 },
  { nameEn: "Masraf Al Rayan - Deposits", nameAr: "مصرف الريان - ودائع", balance: 38740,  share: 0.17 },
];

const TOTAL_BANK = 218340;
const VISIBLE_ACCOUNTS = 2;

export default function DashboardPage() {
  const { locale, dir } = useI18n();
  const { t } = useI18n();
  const d = t.dashboard;
  const { profile } = useCompany();
  const curr = profile.currency || "SAR";
  const companyName = profile.companyName || (locale === "ar" ? "شركتك" : "your company");
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const visibleAccounts = showAllAccounts ? BANK_ACCOUNTS : BANK_ACCOUNTS.slice(0, VISIBLE_ACCOUNTS);
  const hasMore = BANK_ACCOUNTS.length > VISIBLE_ACCOUNTS;
  const isAr = locale === "ar";

  return (
    <div dir={dir} className="flex flex-col gap-5 p-5 md:p-6 overflow-y-auto h-full">

      {/* ══ HEADER ══ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 suppressHydrationWarning className="text-lg font-semibold tracking-tight">
            {d.overviewOf} {companyName}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{d.last6Months} · {d.trialData}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {d.last6Months}
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" />
            {d.exportReport}
          </Button>
        </div>
      </div>

      {/* ══ SPLIT VIEW ══ */}
      <div className="flex flex-col xl:flex-row gap-6 w-full max-w-[1600px] mx-auto">

        {/* ── RIGHT PANE: KPI Sidebar ── */}
        <div className="w-full xl:w-[280px] shrink-0 flex flex-col gap-3">

          {/* Total Balance */}
          <Card className="shadow-sm border-border/50 overflow-hidden bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide leading-none">{d.totalBalance}</p>
              </div>
              <p suppressHydrationWarning className="text-2xl font-bold tabular-nums tracking-tight leading-none text-foreground">
                {curr} {TOTAL_BANK.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">{d.across3Accounts}</p>
              <div className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md text-xs font-medium w-fit mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />+2.1% {d.fromLastMonth}
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide leading-none">{d.totalRevenue}</p>
              </div>
              <p suppressHydrationWarning className="text-2xl font-bold tabular-nums tracking-tight leading-none text-foreground">
                {curr} 112,000
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">{d.thisMonth}</p>
              <div className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md text-xs font-medium w-fit mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />+12% {d.vsLastMonth}
              </div>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide leading-none">{d.totalExpenses}</p>
              </div>
              <p suppressHydrationWarning className="text-2xl font-bold tabular-nums tracking-tight leading-none text-foreground">
                {curr} 79,000
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">{d.topBurn}</p>
              <div className="text-rose-500 bg-rose-500/10 px-2 py-1 rounded-md text-xs font-medium w-fit mt-2 flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" />-3.1% {d.fromLastMonth}
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
              <p className="text-2xl font-bold tabular-nums tracking-tight leading-none text-foreground">
                8.3 {d.runwayMonths}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">{d.basedOnBurnRate}</p>
              <div className="text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-md text-xs font-medium w-fit mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />{d.stable}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ── LEFT PANE: Chart + Bottom Grid ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">

          {/* Chart */}
          <Card className="shadow-sm border-border/50 p-1">
            <CashFlowChart currency={curr} />
          </Card>

          {/* Bottom 2-col */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Bank Accounts */}
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
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${(acc.share * 100).toFixed(0)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{(acc.share * 100).toFixed(0)}% {d.ofTotal}</p>
                  </div>
                ))}
                {hasMore && (
                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <button
                      type="button"
                      onClick={() => setShowAllAccounts(!showAllAccounts)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      {showAllAccounts ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          {d.showLess}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          {d.showAll} ({BANK_ACCOUNTS.length})
                        </>
                      )}
                    </button>
                    <Link
                      href="/app/cash-positioning"
                      className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {t.nav.cashPositioning} →
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Agents */}
            <Card className="bg-card border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">{d.aiAgents}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">

                {/* Monitoring Agent */}
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">👁️</span>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{d.monitoringAgent}</p>
                  </div>
                  <p className="text-sm text-foreground leading-snug">
                    {d.monitoringMsg}
                  </p>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400">
                    <MessageCircle className="h-3 w-3" />
                    {d.sendWhatsapp}
                  </Button>
                </div>

                {/* Forecasting Agent */}
                <div className="rounded-lg border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔮</span>
                    <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">{d.forecastingAgent}</p>
                  </div>
                  <p className="text-sm text-foreground leading-snug">
                    {d.forecastingMsg}
                  </p>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400">
                    <TrendingDown className="h-3 w-3" />
                    {d.viewForecast}
                  </Button>
                </div>

                {/* Decision Agent */}
                <div className="rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🧠</span>
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">{d.decisionAgent}</p>
                  </div>
                  <p className="text-sm text-foreground leading-snug">
                    {d.decisionMsg}
                  </p>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400">
                    <ArrowLeftRight className="h-3 w-3" />
                    {d.postponeInvoice}
                  </Button>
                </div>

              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
