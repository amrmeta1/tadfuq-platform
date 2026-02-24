"use client";

import {
  Printer,
  Download,
  Shield,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  Bot,
  FileText,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { useCompany } from "@/contexts/CompanyContext";
import { cn } from "@/lib/utils";

// ── Data ─────────────────────────────────────────────────────────────────────

const CASH_TREND = [
  { month: "Sep", monthAr: "سبتمبر", balance: 3200000 },
  { month: "Oct", monthAr: "أكتوبر", balance: 3500000 },
  { month: "Nov", monthAr: "نوفمبر", balance: 3800000 },
  { month: "Dec", monthAr: "ديسمبر", balance: 4100000 },
  { month: "Jan", monthAr: "يناير", balance: 4450000 },
  { month: "Feb", monthAr: "فبراير", balance: 4820000 },
];

const REVENUE_VS_EXPENSES = [
  { month: "Sep", monthAr: "سبتمبر", revenue: 890000, expenses: 720000 },
  { month: "Oct", monthAr: "أكتوبر", revenue: 950000, expenses: 780000 },
  { month: "Nov", monthAr: "نوفمبر", revenue: 1020000, expenses: 810000 },
  { month: "Dec", monthAr: "ديسمبر", revenue: 1080000, expenses: 850000 },
  { month: "Jan", monthAr: "يناير", revenue: 1100000, expenses: 920000 },
  { month: "Feb", monthAr: "فبراير", revenue: 1230000, expenses: 980000 },
];

interface Entity {
  nameEn: string;
  nameAr: string;
  balance: number;
  revenue: number;
  expenses: number;
  health: number;
  trendDir: "up" | "down" | "flat";
}

const ENTITIES: Entity[] = [
  { nameEn: "Tadfuq HQ", nameAr: "تدفق - المقر الرئيسي", balance: 2100000, revenue: 520000, expenses: 380000, health: 88, trendDir: "up" },
  { nameEn: "Construction LLC", nameAr: "شركة المقاولات ذ.م.م", balance: 1450000, revenue: 410000, expenses: 350000, health: 76, trendDir: "up" },
  { nameEn: "Trading Co.", nameAr: "شركة التجارة", balance: 680000, revenue: 180000, expenses: 150000, health: 72, trendDir: "flat" },
  { nameEn: "Tech Solutions", nameAr: "الحلول التقنية", balance: 420000, revenue: 95000, expenses: 80000, health: 65, trendDir: "up" },
  { nameEn: "Properties", nameAr: "العقارات", balance: 170000, revenue: 25000, expenses: 20000, health: 45, trendDir: "down" },
];

interface Risk {
  severity: "high" | "medium" | "low";
  en: string;
  ar: string;
}

const RISKS: Risk[] = [
  { severity: "high", en: "Payroll + GOSI due in 3 days (SAR 101,000). Ensure funds in payroll account.", ar: "الرواتب + التأمينات مستحقة خلال ٣ أيام (١٠١,٠٠٠ ر.س). تأكد من توفر الأموال في حساب الرواتب." },
  { severity: "medium", en: "Overdue receivable SAR 28,000 from Supplier X (7 days late). Escalate collection.", ar: "مستحقات متأخرة ٢٨,٠٠٠ ر.س من المورد X (متأخرة ٧ أيام). صعّد التحصيل." },
  { severity: "low", en: "USD/SAR rate favorable for FX-denominated contracts. Consider locking rate.", ar: "سعر صرف USD/SAR مناسب للعقود بالعملات الأجنبية. فكّر في تثبيت السعر." },
];

interface AgentSummary {
  nameEn: string;
  nameAr: string;
  emoji: string;
  summaryEn: string;
  summaryAr: string;
}

const AGENTS: AgentSummary[] = [
  { nameEn: "Raqib", nameAr: "رقيب", emoji: "👁️", summaryEn: "12 anomalies detected, 3 critical resolved", summaryAr: "١٢ حالة شاذة مكتشفة، ٣ حرجة تم حلها" },
  { nameEn: "Mutawaqi", nameAr: "متوقّع", emoji: "🔮", summaryEn: "Forecast accuracy 94%, predicted payroll squeeze 5 days early", summaryAr: "دقة التنبؤ ٩٤٪، توقّع ضغط الرواتب قبل ٥ أيام" },
  { nameEn: "Mustashar", nameAr: "مستشار", emoji: "🧠", summaryEn: "8 recommendations, 6 acted upon", summaryAr: "٨ توصيات، ٦ تم تنفيذها" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtM(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toLocaleString();
}

function healthColor(h: number): string {
  if (h >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (h >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function healthDot(h: number): string {
  if (h >= 75) return "🟢";
  if (h >= 60) return "🟡";
  return "🔴";
}

function severityConfig(s: Risk["severity"]) {
  if (s === "high") return { dot: "🔴", label: "HIGH", labelAr: "عالي", border: "border-rose-200 dark:border-rose-900/50", bg: "bg-rose-50/50 dark:bg-rose-950/20", text: "text-rose-700 dark:text-rose-400" };
  if (s === "medium") return { dot: "🟡", label: "MEDIUM", labelAr: "متوسط", border: "border-amber-200 dark:border-amber-900/50", bg: "bg-amber-50/50 dark:bg-amber-950/20", text: "text-amber-700 dark:text-amber-400" };
  return { dot: "🟢", label: "LOW", labelAr: "منخفض", border: "border-emerald-200 dark:border-emerald-900/50", bg: "bg-emerald-50/50 dark:bg-emerald-950/20", text: "text-emerald-700 dark:text-emerald-400" };
}

// ── Tooltip Components ───────────────────────────────────────────────────────

function CashTrendTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs">
      <p className="font-semibold mb-0.5">{label}</p>
      <p className="tabular-nums font-medium text-indigo-600 dark:text-indigo-400">
        {currency} {Number(payload[0]?.value).toLocaleString()}
      </p>
    </div>
  );
}

function RevenueExpenseTooltip({ active, payload, label, currency, isAr }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs min-w-[140px]">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="tabular-nums flex justify-between gap-4">
          <span style={{ color: p.color }}>
            {p.dataKey === "revenue" ? (isAr ? "الإيرادات" : "Revenue") : (isAr ? "المصروفات" : "Expenses")}
          </span>
          <span className="font-medium">{currency} {Number(p.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ExecutiveReportPage() {
  const { locale, dir } = useI18n();
  const { profile } = useCompany();
  const curr = profile.currency || "SAR";
  const isAr = locale === "ar";

  const now = new Date();
  const generatedDate = isAr
    ? now.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })
    : now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const generatedTime = now.toLocaleTimeString(isAr ? "ar-SA" : "en-US", { hour: "2-digit", minute: "2-digit" });

  const cashTrendData = CASH_TREND.map((d) => ({ ...d, month: isAr ? d.monthAr : d.month }));
  const revExpData = REVENUE_VS_EXPENSES.map((d) => ({ ...d, month: isAr ? d.monthAr : d.month }));

  const kpis = [
    { labelEn: "Total Cash", labelAr: "إجمالي النقد", value: `${curr} 4,820,000`, change: "+8.3%", positive: true },
    { labelEn: "Monthly Revenue", labelAr: "الإيرادات الشهرية", value: `${curr} 1,230,000`, change: "+12%", positive: true },
    { labelEn: "Monthly Expenses", labelAr: "المصروفات الشهرية", value: `${curr} 980,000`, change: "-3.1%", positive: true },
    { labelEn: "Net Cash Flow", labelAr: "صافي التدفق النقدي", value: `+${curr} 250,000`, change: null, positive: true },
    { labelEn: "Runway", labelAr: "فترة التشغيل", value: isAr ? "٨.٣ أشهر" : "8.3 months", change: isAr ? "مستقر" : "Stable", positive: true },
    { labelEn: "Health Score", labelAr: "مؤشر الصحة المالية", value: "82/100", change: isAr ? "جيد" : "Good", positive: true },
  ];

  return (
    <div dir={dir} className="flex flex-col h-full overflow-y-auto bg-background">
      {/* Print Styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          @page { size: A4; margin: 16mm; }
          * { box-shadow: none !important; }
        }
      `}</style>

      <div className="max-w-5xl w-full mx-auto px-4 py-8 space-y-6">

        {/* ═══ 1. REPORT HEADER ═══ */}
        <div className="space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <Badge variant="outline" className="text-xs font-bold tracking-wider px-3 py-1 border-indigo-300 text-indigo-700 dark:border-indigo-700 dark:text-indigo-400">
                Tadfuq.ai
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                {isAr ? "التقرير التنفيذي للخزينة" : "Executive Treasury Report"}
              </h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                <span>{isAr ? "الفترة: فبراير ٢٠٢٦" : "Period: February 2026"}</span>
                <span className="hidden sm:inline">·</span>
                <span suppressHydrationWarning>
                  {isAr ? "تاريخ الإصدار:" : "Generated:"} {generatedDate}, {generatedTime}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 no-print">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
                <Printer className="h-4 w-4" />
                {isAr ? "طباعة" : "Print"}
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
                <Download className="h-4 w-4" />
                {isAr ? "تحميل PDF" : "Download PDF"}
              </Button>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1.5 text-xs font-medium px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800">
            <Shield className="h-3 w-3" />
            {isAr ? "سري — لاستخدام مجلس الإدارة فقط" : "Confidential — Board Use Only"}
          </Badge>
          <div className="h-px bg-border" />
        </div>

        {/* ═══ 2. EXECUTIVE SUMMARY ═══ */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {isAr ? "الملخص التنفيذي" : "Executive Summary"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/90">
              {isAr
                ? "تبقى السيولة الجماعية قوية عند ٤.٨٢ مليون ر.س، بارتفاع ٨.٣٪ عن يناير. نمت الإيرادات بنسبة ١٢٪ على أساس شهري مدفوعة بمخرجات مشروع ألفا. تبلغ فترة التشغيل النقدي ٨.٣ أشهر. المخاطر الرئيسية: ١٠١,٠٠٠ ر.س رواتب مستحقة خلال ٣ أيام مع ٢٨,٠٠٠ ر.س مستحقات متأخرة من المورد X. توصي أنظمة الذكاء الاصطناعي بطلب دفعة مبكرة من العميل ب ومراقبة تعرض العملات الأجنبية في العقود المقومة بالدولار."
                : "Group liquidity remains strong at SAR 4.82M, up 8.3% from January. Revenue grew 12% MoM driven by Project Alpha deliverables. Cash runway stands at 8.3 months. Key risk: SAR 101K payroll due in 3 days combined with SAR 28K overdue receivable from Supplier X. AI agents recommend requesting early payment from Client B and monitoring FX exposure on USD-denominated contracts."}
            </p>
          </CardContent>
        </Card>

        {/* ═══ 3. KPI SUMMARY GRID ═══ */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {isAr ? "المؤشرات الرئيسية" : "Key Performance Indicators"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {kpis.map((kpi, i) => (
              <Card key={i} className="border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1">
                    {isAr ? kpi.labelAr : kpi.labelEn}
                  </p>
                  <p className="text-lg font-bold tabular-nums tracking-tight">
                    {kpi.value}
                  </p>
                  {kpi.change && (
                    <div className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md mt-1.5",
                      kpi.positive
                        ? "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400"
                        : "text-rose-600 bg-rose-500/10 dark:text-rose-400"
                    )}>
                      {kpi.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {kpi.change}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ═══ 4. CASH TREND CHART ═══ */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              {isAr ? "اتجاه النقد — آخر ٦ أشهر" : "Cash Trend — Last 6 Months"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashTrendData} margin={{ top: 8, right: 16, left: 16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(239 84% 67%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(239 84% 67%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip content={<CashTrendTooltip currency={curr} />} />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="hsl(239 84% 67%)"
                    strokeWidth={2.5}
                    fill="url(#cashGrad)"
                    dot={{ r: 4, fill: "var(--background)", stroke: "hsl(239 84% 67%)", strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ═══ 5. REVENUE VS EXPENSES CHART ═══ */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              {isAr ? "الإيرادات مقابل المصروفات — آخر ٦ أشهر" : "Revenue vs Expenses — Last 6 Months"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revExpData} margin={{ top: 8, right: 16, left: 16, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip content={<RevenueExpenseTooltip currency={curr} isAr={isAr} />} />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs font-medium">
                        {value === "revenue" ? (isAr ? "الإيرادات" : "Revenue") : (isAr ? "المصروفات" : "Expenses")}
                      </span>
                    )}
                  />
                  <Bar dataKey="revenue" fill="hsl(152 69% 41%)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="expenses" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ═══ 6. ENTITY PERFORMANCE TABLE ═══ */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {isAr ? "أداء الكيانات" : "Entity Performance"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{isAr ? "الكيان" : "Entity"}</TableHead>
                  <TableHead className="text-xs text-end">{isAr ? "الرصيد" : "Balance"}</TableHead>
                  <TableHead className="text-xs text-end">{isAr ? "الإيرادات" : "Revenue"}</TableHead>
                  <TableHead className="text-xs text-end">{isAr ? "المصروفات" : "Expenses"}</TableHead>
                  <TableHead className="text-xs text-center">{isAr ? "الصحة" : "Health"}</TableHead>
                  <TableHead className="text-xs text-center">{isAr ? "الاتجاه" : "Trend"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ENTITIES.map((e) => (
                  <TableRow key={e.nameEn}>
                    <TableCell className="font-medium text-sm">{isAr ? e.nameAr : e.nameEn}</TableCell>
                    <TableCell className="text-end tabular-nums text-sm">{curr} {fmtM(e.balance)}</TableCell>
                    <TableCell className="text-end tabular-nums text-sm">{fmtM(e.revenue)}</TableCell>
                    <TableCell className="text-end tabular-nums text-sm">{fmtM(e.expenses)}</TableCell>
                    <TableCell className="text-center">
                      <span className={cn("font-semibold text-sm", healthColor(e.health))}>
                        {e.health} {healthDot(e.health)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {e.trendDir === "up" && <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mx-auto" />}
                      {e.trendDir === "down" && <ArrowDownRight className="h-4 w-4 text-rose-600 dark:text-rose-400 mx-auto" />}
                      {e.trendDir === "flat" && <Minus className="h-4 w-4 text-muted-foreground mx-auto" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ═══ 7. KEY RISKS & RECOMMENDATIONS ═══ */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {isAr ? "المخاطر الرئيسية والتوصيات" : "Key Risks & Recommendations"}
          </h2>
          <div className="space-y-3">
            {RISKS.map((risk, i) => {
              const cfg = severityConfig(risk.severity);
              return (
                <Card key={i} className={cn("border shadow-sm", cfg.border, cfg.bg)}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5">{cfg.dot}</span>
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className={cn("text-[10px] font-bold uppercase mb-1.5", cfg.text, cfg.border)}>
                        {isAr ? cfg.labelAr : cfg.label}
                      </Badge>
                      <p className="text-sm leading-relaxed">
                        {isAr ? risk.ar : risk.en}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ═══ 8. AI AGENTS SUMMARY ═══ */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              {isAr ? "ملخص وكلاء الذكاء الاصطناعي" : "AI Agents Summary"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {AGENTS.map((agent) => (
                <div key={agent.nameEn} className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{agent.emoji}</span>
                    <span className="text-sm font-semibold">{isAr ? agent.nameAr : agent.nameEn}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isAr ? agent.summaryAr : agent.summaryEn}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ═══ 9. REPORT FOOTER ═══ */}
        <div className="border-t border-border pt-6 mt-2 space-y-1 text-center text-xs text-muted-foreground">
          <p className="font-medium">
            {isAr
              ? "تم إنشاء هذا التقرير تلقائيًا بواسطة منصة تدفق للخزينة الذكية"
              : "This report was auto-generated by Tadfuq AI Treasury Platform"}
          </p>
          <p>
            {isAr
              ? "للاستفسارات، تواصل مع treasury@tadfuq.ai"
              : "For questions, contact treasury@tadfuq.ai"}
          </p>
          <p className="text-muted-foreground/60 pt-1">
            {isAr ? "صفحة ١ من ١" : "Page 1 of 1"}
          </p>
        </div>

      </div>
    </div>
  );
}
