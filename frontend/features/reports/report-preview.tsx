"use client";

import { TrendingUp, TrendingDown, Printer, Download, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Report } from "./types";

const CHART_DATA = [
  { month: "Aug", inflow: 980_000, outflow: 920_000 },
  { month: "Sep", inflow: 1_050_000, outflow: 990_000 },
  { month: "Oct", inflow: 1_120_000, outflow: 1_060_000 },
  { month: "Nov", inflow: 1_090_000, outflow: 1_050_000 },
  { month: "Dec", inflow: 1_180_000, outflow: 1_140_000 },
  { month: "Jan", inflow: 1_240_000, outflow: 1_115_000 },
];

interface ReportPreviewProps {
  report: Report;
  onClose: () => void;
  isAr: boolean;
  locale: string;
}

export function ReportPreview({ report, onClose, isAr, locale }: ReportPreviewProps) {
  const { summary } = report;
  const isPositive = summary.net_cash_flow >= 0;
  const currency = "SAR";

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      {/* ── Toolbar (hidden on print) ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-card shrink-0 print:hidden">
        <p className="text-xs font-medium text-muted-foreground">
          {isAr ? "معاينة التقرير" : "Report Preview"}
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5"
            onClick={() => window.print()}
          >
            <Printer className="h-3.5 w-3.5" />
            {isAr ? "طباعة / PDF" : "Print / PDF"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            {isAr ? "تصدير CSV" : "Export CSV"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Scrollable A4 canvas ── */}
      <div
        id="report-print-area"
        className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible"
      >
        {/*
          A4 document container.
          print: classes ensure ONLY this element is visible when printing —
          sidebar, navbar, and toolbar are hidden via globals.css @media print rules.
        */}
        <div
          className={cn(
            "mx-auto bg-white dark:bg-zinc-900 shadow-md",
            "w-full max-w-[794px]",
            "print:shadow-none print:max-w-none print:w-full print:bg-white"
          )}
        >
          {/* ── Document header ── */}
          <div className="px-12 pt-10 pb-6 border-b border-zinc-200 dark:border-zinc-700 print:border-zinc-300">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs print:bg-indigo-600">
                    CF
                  </div>
                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    CashFlow.ai
                  </span>
                </div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 print:text-zinc-900">
                  {isAr ? report.title_ar : report.title_en}
                </h1>
                <p className="text-sm text-zinc-500 mt-1">
                  {isAr ? "تاريخ الإنشاء:" : "Generated:"}{" "}
                  {formatDate(report.generated_at, locale)}
                </p>
              </div>
              <div className="text-end shrink-0">
                <p className="text-xs text-zinc-400">{isAr ? "الفترة" : "Period"}</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 print:text-zinc-900">
                  {report.period}
                </p>
                {report.include_ai && (
                  <div className="flex items-center gap-1 mt-1 justify-end">
                    <Sparkles className="h-3 w-3 text-violet-500" />
                    <span className="text-xs text-violet-600">
                      {isAr ? "يتضمن رؤى AI" : "Includes AI Insights"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── KPI grid ── */}
          <div className="px-12 py-6 border-b border-zinc-200 dark:border-zinc-700 print:border-zinc-300">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              {isAr ? "ملخص تنفيذي" : "Executive Summary"}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: isAr ? "الرصيد الافتتاحي" : "Opening Balance",
                  value: summary.opening_balance,
                  color: "text-zinc-900 dark:text-zinc-100 print:text-zinc-900",
                },
                {
                  label: isAr ? "الرصيد الختامي" : "Closing Balance",
                  value: summary.closing_balance,
                  color: "text-zinc-900 dark:text-zinc-100 print:text-zinc-900",
                },
                {
                  label: isAr ? "إجمالي التدفقات" : "Total Inflows",
                  value: summary.total_inflows,
                  color: "text-emerald-600",
                },
                {
                  label: isAr ? "إجمالي المدفوعات" : "Total Outflows",
                  value: summary.total_outflows,
                  color: "text-red-600",
                },
              ].map((kpi, i) => (
                <div
                  key={i}
                  className="rounded border border-zinc-100 dark:border-zinc-700 p-3 print:border-zinc-200"
                >
                  <p className="text-xs text-zinc-400 mb-1">{kpi.label}</p>
                  <p className={cn("text-base font-bold tabular", kpi.color)}>
                    {formatCurrency(kpi.value, currency, locale)}
                  </p>
                </div>
              ))}
            </div>

            {/* Net cash flow highlight */}
            <div
              className={cn(
                "mt-4 rounded border px-4 py-3 flex items-center justify-between print:border",
                isPositive
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30 print:bg-emerald-50 print:border-emerald-200"
                  : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 print:bg-red-50 print:border-red-200"
              )}
            >
              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 print:text-zinc-700">
                  {isAr ? "صافي التدفق النقدي" : "Net Cash Flow"}
                </span>
              </div>
              <span
                className={cn(
                  "text-lg font-bold tabular",
                  isPositive ? "text-emerald-600" : "text-red-600"
                )}
              >
                {isPositive ? "+" : ""}
                {formatCurrency(summary.net_cash_flow, currency, locale)}
              </span>
            </div>
          </div>

          {/* ── Chart ── */}
          <div className="px-12 py-6 border-b border-zinc-200 dark:border-zinc-700 print:border-zinc-300">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              {isAr ? "التدفقات النقدية الشهرية (٦ أشهر)" : "Monthly Cash Flows (6 months)"}
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={CHART_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rptInflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rptOutflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1_000).toFixed(0)}k`}
                  width={40}
                />
                <ReTooltip
                  contentStyle={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 6 }}
                  formatter={(v: number) => formatCurrency(v, currency, locale)}
                />
                <Area
                  dataKey="inflow"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  fill="url(#rptInflowGrad)"
                  dot={false}
                  name={isAr ? "التدفقات" : "Inflows"}
                />
                <Area
                  dataKey="outflow"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  fill="url(#rptOutflowGrad)"
                  dot={false}
                  name={isAr ? "المدفوعات" : "Outflows"}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ── AI narrative (conditional) ── */}
          {report.include_ai && (
            <div className="px-12 py-6 border-b border-zinc-200 dark:border-zinc-700 print:border-zinc-300">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {isAr ? "تحليل الذكاء الاصطناعي — مستشار" : "AI Analysis — Mustashar"}
                </p>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed print:text-zinc-700">
                {isAr
                  ? `خلال ${report.period}، حقق الكيان صافي تدفق نقدي ${isPositive ? "إيجابي" : "سلبي"} بقيمة ${formatCurrency(Math.abs(summary.net_cash_flow), currency, locale)}. ارتفع الرصيد من ${formatCurrency(summary.opening_balance, currency, locale)} إلى ${formatCurrency(summary.closing_balance, currency, locale)}. تجاوزت التدفقات الداخلة التوقعات بنسبة ٤٪ مدفوعةً بتحصيل مبكر من عملاء رئيسيين. يُوصى بالحفاظ على احتياطي نقدي لا يقل عن ٦٠ يومًا من المصاريف التشغيلية.`
                  : `During ${report.period}, the entity achieved a ${isPositive ? "positive" : "negative"} net cash flow of ${formatCurrency(Math.abs(summary.net_cash_flow), currency, locale)}. The balance moved from ${formatCurrency(summary.opening_balance, currency, locale)} to ${formatCurrency(summary.closing_balance, currency, locale)}. Inflows exceeded projections by 4%, driven by early collection from key clients. It is recommended to maintain a cash reserve of at least 60 days of operating expenses.`}
              </p>
            </div>
          )}

          {/* ── Document footer ── */}
          <div className="px-12 py-4 flex justify-between text-xs text-zinc-400">
            <span>CashFlow.ai — {isAr ? "سري وخاص" : "Confidential"}</span>
            <span>{isAr ? "صفحة ١ من ١" : "Page 1 of 1"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
