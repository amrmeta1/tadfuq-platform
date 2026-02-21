"use client";

import dynamic from "next/dynamic";
import { ChevronDown, RefreshCw, Settings2, Wallet, ArrowUpCircle, TrendingUp, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/context";
import { useCompany } from "@/contexts/CompanyContext";
import type { CashflowMonthPoint } from "@/components/forecast/MasterForecastChart";

const MasterForecastChart = dynamic(
  () => import("@/components/forecast/MasterForecastChart").then((m) => ({ default: m.MasterForecastChart })),
  { ssr: false, loading: () => <Skeleton className="h-[350px] w-full" /> }
);

// ── Mock data ──────────────────────────────────────────────────────────────────

const CHART_DATA: CashflowMonthPoint[] = [
  { month: "فبراير", inflow: 920_000,  outflow: 710_000,  balance: 2_310_000 },
  { month: "مارس",   inflow: 1_050_000, outflow: 830_000, balance: 2_530_000 },
  { month: "أبريل",  inflow: 980_000,  outflow: 760_000,  balance: 2_750_000, isCurrent: true },
  { month: "مايو",   inflowFuture: 1_100_000, outflowFuture: 870_000,  balanceForecast: 2_980_000 },
  { month: "يونيو",  inflowFuture: 1_050_000, outflowFuture: 920_000,  balanceForecast: 3_110_000 },
  { month: "يوليو",  inflowFuture: 1_200_000, outflowFuture: 850_000,  balanceForecast: 3_460_000 },
  { month: "أغسطس", inflowFuture: 1_150_000, outflowFuture: 990_000,  balanceForecast: 3_620_000 },
  { month: "سبتمبر", inflowFuture: 1_300_000, outflowFuture: 1_010_000, balanceForecast: 3_910_000 },
  { month: "أكتوبر", inflowFuture: 1_250_000, outflowFuture: 960_000,  balanceForecast: 4_200_000 },
];

// Grid data rows
type GridRow = {
  label: string;
  icon: string;
  color: string;
  bold?: boolean;
  muted?: boolean;
  indent?: boolean;
  values: (number | null)[];
};

const MONTHS = ["فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر"];
const CURRENT_MONTH_IDX = 2; // أبريل

const GRID_ROWS: GridRow[] = [
  {
    label: "الرصيد بداية الشهر",
    icon: "●", color: "text-blue-500", bold: true,
    values: [2_100_000, 2_310_000, 2_530_000, 2_750_000, 2_980_000, 3_110_000, 3_460_000, 3_620_000, 3_910_000],
  },
  {
    label: "التدفقات الداخلة",
    icon: "▲", color: "text-emerald-600", bold: true,
    values: [920_000, 1_050_000, 980_000, 1_100_000, 1_050_000, 1_200_000, 1_150_000, 1_300_000, 1_250_000],
  },
  {
    label: "مبيعات التجزئة",
    icon: "", color: "text-muted-foreground", indent: true,
    values: [540_000, 620_000, 580_000, 650_000, 620_000, 710_000, 680_000, 770_000, 740_000],
  },
  {
    label: "تحصيل ذمم",
    icon: "", color: "text-muted-foreground", indent: true,
    values: [380_000, 430_000, 400_000, 450_000, 430_000, 490_000, 470_000, 530_000, 510_000],
  },
  {
    label: "التدفقات الخارجة",
    icon: "▼", color: "text-rose-600", bold: true,
    values: [710_000, 830_000, 760_000, 870_000, 920_000, 850_000, 990_000, 1_010_000, 960_000],
  },
  {
    label: "رواتب",
    icon: "", color: "text-muted-foreground", indent: true,
    values: [320_000, 320_000, 320_000, 320_000, 320_000, 320_000, 320_000, 320_000, 320_000],
  },
  {
    label: "موردين",
    icon: "", color: "text-muted-foreground", indent: true,
    values: [390_000, 510_000, 440_000, 550_000, 600_000, 530_000, 670_000, 690_000, 640_000],
  },
  {
    label: "الرصيد نهاية الشهر",
    icon: "◆", color: "text-foreground", bold: true, muted: true,
    values: [2_310_000, 2_530_000, 2_750_000, 2_980_000, 3_110_000, 3_460_000, 3_620_000, 3_910_000, 4_200_000],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtK(n: number | null, curr: string): string {
  if (n == null) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}k`;
  return `${sign}${abs.toLocaleString()}`;
}

// ── KPI Card ───────────────────────────────────────────────────────────────────

function KpiCard({
  value, label, dotColor, gradient, curr, icon: Icon,
}: {
  value: string; label: string; dotColor: string; gradient?: string;
  curr: string; icon: React.ElementType;
}) {
  return (
    <Card className={`shadow-sm border-border/50 overflow-hidden ${gradient ?? ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
          <p className="text-[11px] text-muted-foreground font-medium leading-none">{label}</p>
        </div>
        <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground leading-none" suppressHydrationWarning>
          +{value} <span className="text-sm font-semibold text-muted-foreground">{curr}</span>
        </p>
        <div className="mt-2 flex justify-end">
          <Icon className="h-4 w-4 text-muted-foreground/40" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ForecastPage() {
  const { dir } = useI18n();
  const { profile } = useCompany();
  const curr = profile.currency || "SAR";

  return (
    <div dir={dir} className="flex flex-col gap-5 p-5 md:p-6 overflow-y-auto h-full">

      {/* ══ FILTER BAR ══ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            "كل المشاريع",
            "يناير ← ديسمبر",
            "السيناريو الأساسي",
            "عرض مجمع",
          ].map((label) => (
            <Button key={label} variant="outline" size="sm" className="h-8 text-xs gap-1.5 font-medium">
              {label}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            تحديث الحساب
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            خيارات
          </Button>
        </div>
      </div>

      {/* ══ SPLIT VIEW ══ */}
      <div className="flex flex-col xl:flex-row gap-6 w-full max-w-[1600px] mx-auto">

        {/* ── RIGHT PANE: KPI Sidebar ── */}
        <div className="w-full xl:w-[280px] shrink-0 flex flex-col gap-3">
          <KpiCard
            value="3,088,421"
            label="الرصيد النقدي (Cash balance)"
            dotColor="bg-blue-500"
            gradient="bg-gradient-to-br from-blue-50/70 to-transparent dark:from-blue-950/20"
            curr={curr}
            icon={Wallet}
          />
          <KpiCard
            value="820,000"
            label="تسويات (Adjustment)"
            dotColor="bg-violet-500"
            curr={curr}
            icon={ArrowUpCircle}
          />
          <KpiCard
            value="625,000"
            label="استثمارات (Investments)"
            dotColor="bg-teal-500"
            curr={curr}
            icon={TrendingUp}
          />
          <KpiCard
            value="1,497,600"
            label="الإجمالي (Total)"
            dotColor="bg-zinc-500"
            gradient="bg-muted/30"
            curr={curr}
            icon={LayoutGrid}
          />
        </div>

        {/* ── LEFT PANE: Chart + Grid ── */}
        <div className="flex-1 min-w-0 overflow-hidden border rounded-xl bg-card flex flex-col shadow-sm">

          {/* Chart */}
          <div className="h-auto p-4 border-b relative">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold">عرض التدفق النقدي الرئيسي</p>
                <p className="text-xs text-muted-foreground mt-0.5">Master Cashflow View · فبراير — أكتوبر</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: "#34d399" }} />فعلي
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ border: "2px solid #34d399" }} />متوقع
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 shrink-0" style={{ borderTop: "2px solid #818cf8" }} />الرصيد
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-5 shrink-0" style={{ borderTop: "2px dashed #818cf8" }} />توقع الرصيد
                </span>
              </div>
            </div>
            <MasterForecastChart data={CHART_DATA} currency={curr} />
          </div>

          {/* Synced Data Grid */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b bg-muted/40">
                  {/* Sticky label header */}
                  <th className="sticky right-0 bg-muted/40 z-10 w-[120px] min-w-[120px] max-w-[120px] border-l shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)] p-2 text-start">
                    <span className="text-[11px] font-semibold text-muted-foreground">البند</span>
                  </th>
                  {MONTHS.map((m, i) => (
                    <th
                      key={m}
                      className={`p-2 text-end text-[11px] font-semibold min-w-[90px] ${
                        i === CURRENT_MONTH_IDX
                          ? "bg-blue-500/5 text-blue-700 dark:text-blue-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {m}
                      {i === CURRENT_MONTH_IDX && (
                        <span className="block text-[9px] font-normal opacity-70">الشهر الحالي</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GRID_ROWS.map((row, ri) => (
                  <tr
                    key={ri}
                    className={`border-b transition-colors hover:bg-muted/30 ${row.muted ? "bg-muted/20" : ""}`}
                  >
                    {/* Sticky label cell */}
                    <td className={`sticky right-0 z-10 border-l shadow-[2px_0_4px_-2px_rgba(0,0,0,0.04)] p-2 bg-card w-[120px] min-w-[120px] max-w-[120px] ${row.muted ? "bg-muted/20" : ""}`}>
                      <div className={`flex items-center gap-1.5 ${row.indent ? "ps-5" : ""}`}>
                        {row.icon && (
                          <span className={`text-[10px] shrink-0 ${row.color}`}>{row.icon}</span>
                        )}
                        <span className={`text-[12px] ${row.bold ? "font-semibold" : "font-normal text-muted-foreground"}`}>
                          {row.label}
                        </span>
                      </div>
                    </td>
                    {row.values.map((val, ci) => (
                      <td
                        key={ci}
                        className={`p-2 text-end text-[12px] tabular-nums ${
                          ci === CURRENT_MONTH_IDX ? "bg-blue-500/5" : ""
                        } ${row.bold ? "font-semibold" : "text-muted-foreground"} ${
                          row.label.includes("خارجة") || row.label === "رواتب" || row.label === "موردين"
                            ? "text-rose-600 dark:text-rose-400"
                            : row.label.includes("داخلة") || row.label === "مبيعات التجزئة" || row.label === "تحصيل ذمم"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : ""
                        }`}
                        suppressHydrationWarning
                      >
                        {fmtK(val, curr)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
