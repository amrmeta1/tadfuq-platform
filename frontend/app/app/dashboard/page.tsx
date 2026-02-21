"use client";

import dynamic from "next/dynamic";
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

// ── Mock data ──────────────────────────────────────────────────────────────────

const BANK_ACCOUNTS = [
  { name: "QNB - حساب الشركات",   balance: 125400, share: 0.58 },
  { name: "CBQ - حساب الرواتب",   balance: 54200,  share: 0.25 },
  { name: "مصرف الريان - ودائع",  balance: 38740,  share: 0.17 },
];

const TOTAL_BANK = 218340;


export default function DashboardPage() {
  const { locale, dir } = useI18n();
  const { profile } = useCompany();
  const curr = profile.currency || "SAR";
  const companyName = profile.companyName || "شركتك";

  return (
    <div dir={dir} className="flex flex-col gap-5 p-5 md:p-6 overflow-y-auto h-full">

      {/* ══ HEADER ══ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 suppressHydrationWarning className="text-lg font-semibold tracking-tight">
            نظرة عامة على سيولة {companyName}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">آخر 6 أشهر · بيانات تجريبية</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            آخر 6 أشهر
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" />
            تصدير تقرير
          </Button>
        </div>
      </div>

      {/* ══ SPLIT VIEW ══ */}
      <div className="flex flex-col xl:flex-row gap-6 w-full max-w-[1600px] mx-auto">

        {/* ── RIGHT PANE: KPI Sidebar ── */}
        <div className="w-full xl:w-[280px] shrink-0 flex flex-col gap-3">

          {/* الرصيد الإجمالي */}
          <Card className="shadow-sm border-border/50 overflow-hidden bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide leading-none">الرصيد الإجمالي</p>
              </div>
              <p suppressHydrationWarning className="text-2xl font-bold tabular-nums tracking-tight leading-none text-foreground">
                {curr} {TOTAL_BANK.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">موزعة على 3 حسابات بنكية</p>
              <div className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md text-xs font-medium w-fit mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />+2.1% من الشهر الماضي
              </div>
            </CardContent>
          </Card>

          {/* إجمالي الإيرادات */}
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide leading-none">إجمالي الإيرادات</p>
              </div>
              <p suppressHydrationWarning className="text-2xl font-bold tabular-nums tracking-tight leading-none text-foreground">
                {curr} 112,000
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">هذا الشهر</p>
              <div className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md text-xs font-medium w-fit mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />+12% عن الشهر الماضي
              </div>
            </CardContent>
          </Card>

          {/* إجمالي المصروفات */}
          <Card className="shadow-sm border-border/50 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide leading-none">إجمالي المصروفات</p>
              </div>
              <p suppressHydrationWarning className="text-2xl font-bold tabular-nums tracking-tight leading-none text-foreground">
                {curr} 79,000
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">أكبر حرق: رواتب الموظفين</p>
              <div className="text-rose-500 bg-rose-500/10 px-2 py-1 rounded-md text-xs font-medium w-fit mt-2 flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" />-3.1% من الشهر الماضي
              </div>
            </CardContent>
          </Card>

          {/* المدرج الزمني */}
          <Card className="shadow-sm border-border/50 overflow-hidden bg-muted/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide leading-none">المدرج الزمني</p>
              </div>
              <p className="text-2xl font-bold tabular-nums tracking-tight leading-none text-foreground">
                8.3 أشهر
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">بناءً على معدل الحرق الحالي</p>
              <div className="text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-md text-xs font-medium w-fit mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />مستقر
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
                  <CardTitle className="text-sm font-semibold">أرصدة الحسابات</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-4">
                {BANK_ACCOUNTS.map((acc) => (
                  <div key={acc.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted shrink-0">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium">{acc.name}</span>
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
                    <p className="text-[10px] text-muted-foreground mt-1">{(acc.share * 100).toFixed(0)}% من الإجمالي</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Agents */}
            <Card className="bg-card border-indigo-100 dark:border-indigo-900/50 shadow-sm relative overflow-hidden">
              <CardHeader className="pb-2 pt-5 px-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">وكلاء الذكاء الاصطناعي · AI Agents</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-3">

                {/* 👁️ الوكيل رَقيب */}
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">👁️</span>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">الوكيل رَقيب · Monitoring Agent</p>
                  </div>
                  <p className="text-sm text-foreground leading-snug">
                    يوجد فاتورة متأخرة من شركة الميرة. هل أرسل مطالبة بالواتساب؟
                  </p>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400">
                    <MessageCircle className="h-3 w-3" />
                    إرسال واتساب
                  </Button>
                </div>

                {/* 🔮 الوكيل مُتوقِّع */}
                <div className="rounded-lg border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🔮</span>
                    <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">الوكيل مُتوقِّع · Forecasting Agent</p>
                  </div>
                  <p className="text-sm text-foreground leading-snug">
                    أتوقع عجزاً نقدياً بعد 14 يوماً بسبب تعارض الرواتب مع دفعة الموردين.
                  </p>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400">
                    <TrendingDown className="h-3 w-3" />
                    عرض التوقع
                  </Button>
                </div>

                {/* 🧠 الوكيل مُستشار */}
                <div className="rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🧠</span>
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">الوكيل مُستشار · Decision Agent</p>
                  </div>
                  <p className="text-sm text-foreground leading-snug">
                    أنصح بتأجيل سداد فاتورة Ooredoo لتجنب العجز.
                  </p>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400">
                    <ArrowLeftRight className="h-3 w-3" />
                    تأجيل الفاتورة
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
