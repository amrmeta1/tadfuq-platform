"use client";

import { useState } from "react";
import {
  GitMerge,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Bot,
  Building2,
  Landmark,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { useCompany } from "@/contexts/CompanyContext";
import { cn } from "@/lib/utils";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtSAR(n: number, short = false): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : n > 0 && short ? "+" : "";
  if (abs >= 1_000_000) return `${sign}SAR ${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}SAR ${(abs / 1_000).toFixed(0)}K`;
  return `${sign}SAR ${abs.toLocaleString("en-US")}`;
}

function fmtAxis(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ── Types ────────────────────────────────────────────────────────────────────

interface BankAccount {
  nameEn: string;
  nameAr: string;
  balance: number;
}

interface Transaction {
  descEn: string;
  descAr: string;
  amount: number;
  date: string;
}

interface Entity {
  id: string;
  nameEn: string;
  nameAr: string;
  balance: number;
  inflowMTD: number;
  outflowMTD: number;
  status: "active" | "dormant";
  health: number;
  color: string;
  borderColor: string;
  bankAccounts: BankAccount[];
  sparkline: number[];
  recentTx: Transaction[];
}

// ── Entity Data ──────────────────────────────────────────────────────────────

const ENTITIES: Entity[] = [
  {
    id: "hq",
    nameEn: "Tadfuq HQ (Parent)",
    nameAr: "تدفق المقر الرئيسي (الأم)",
    balance: 2_100_000,
    inflowMTD: 520_000,
    outflowMTD: 380_000,
    status: "active",
    health: 88,
    color: "#10b981",
    borderColor: "border-l-emerald-500",
    bankAccounts: [
      { nameEn: "SNB - Main Corporate", nameAr: "البنك الأهلي - الشركات الرئيسي", balance: 1_200_000 },
      { nameEn: "Riyad Bank - Operations", nameAr: "بنك الرياض - العمليات", balance: 650_000 },
      { nameEn: "Al Rajhi - Reserve", nameAr: "الراجحي - الاحتياطي", balance: 250_000 },
    ],
    sparkline: [1900, 1920, 1950, 1980, 1960, 1990, 2020, 2000, 2030, 2050, 2040, 2060, 2080, 2070, 2100].map(v => v * 1000),
    recentTx: [
      { descEn: "Client payment – Al Faisal Group", descAr: "دفعة عميل – مجموعة الفيصل", amount: 120_000, date: "Feb 22" },
      { descEn: "Salary disbursement", descAr: "صرف رواتب", amount: -85_000, date: "Feb 20" },
      { descEn: "Office lease payment", descAr: "دفعة إيجار مكتب", amount: -45_000, date: "Feb 18" },
    ],
  },
  {
    id: "construction",
    nameEn: "Tadfuq Construction LLC",
    nameAr: "تدفق للمقاولات ذ.م.م",
    balance: 1_450_000,
    inflowMTD: 410_000,
    outflowMTD: 350_000,
    status: "active",
    health: 76,
    color: "#3b82f6",
    borderColor: "border-l-blue-500",
    bankAccounts: [
      { nameEn: "SNB - Project Account", nameAr: "البنك الأهلي - حساب المشاريع", balance: 850_000 },
      { nameEn: "Riyad Bank - Payroll", nameAr: "بنك الرياض - الرواتب", balance: 600_000 },
    ],
    sparkline: [1300, 1320, 1340, 1360, 1350, 1380, 1400, 1390, 1410, 1420, 1430, 1440, 1445, 1448, 1450].map(v => v * 1000),
    recentTx: [
      { descEn: "Progress billing – Phase 2", descAr: "فوترة تقدم – المرحلة ٢", amount: 200_000, date: "Feb 21" },
      { descEn: "Material procurement", descAr: "شراء مواد", amount: -130_000, date: "Feb 19" },
      { descEn: "Subcontractor payment", descAr: "دفعة مقاول من الباطن", amount: -95_000, date: "Feb 17" },
    ],
  },
  {
    id: "trading",
    nameEn: "Tadfuq Trading Co.",
    nameAr: "تدفق للتجارة",
    balance: 680_000,
    inflowMTD: 180_000,
    outflowMTD: 150_000,
    status: "active",
    health: 72,
    color: "#6366f1",
    borderColor: "border-l-indigo-500",
    bankAccounts: [
      { nameEn: "Al Rajhi - Trade Account", nameAr: "الراجحي - حساب التجارة", balance: 420_000 },
      { nameEn: "SNB - Settlement", nameAr: "البنك الأهلي - التسويات", balance: 260_000 },
    ],
    sparkline: [600, 610, 620, 630, 640, 650, 645, 655, 660, 665, 670, 675, 678, 679, 680].map(v => v * 1000),
    recentTx: [
      { descEn: "Inventory sale – Electronics", descAr: "بيع مخزون – إلكترونيات", amount: 75_000, date: "Feb 22" },
      { descEn: "Warehouse rent", descAr: "إيجار مستودع", amount: -28_000, date: "Feb 20" },
      { descEn: "Import duties", descAr: "رسوم استيراد", amount: -42_000, date: "Feb 16" },
    ],
  },
  {
    id: "tech",
    nameEn: "Tadfuq Tech Solutions",
    nameAr: "تدفق للحلول التقنية",
    balance: 420_000,
    inflowMTD: 95_000,
    outflowMTD: 80_000,
    status: "active",
    health: 65,
    color: "#f59e0b",
    borderColor: "border-l-amber-500",
    bankAccounts: [
      { nameEn: "Riyad Bank - Tech Ops", nameAr: "بنك الرياض - العمليات التقنية", balance: 280_000 },
      { nameEn: "SNB - SaaS Revenue", nameAr: "البنك الأهلي - إيرادات SaaS", balance: 140_000 },
    ],
    sparkline: [380, 385, 390, 392, 395, 398, 400, 402, 405, 408, 410, 412, 415, 418, 420].map(v => v * 1000),
    recentTx: [
      { descEn: "SaaS subscription – Q1", descAr: "اشتراك SaaS – الربع الأول", amount: 45_000, date: "Feb 21" },
      { descEn: "Cloud hosting – AWS", descAr: "استضافة سحابية – AWS", amount: -18_000, date: "Feb 19" },
      { descEn: "Developer salaries", descAr: "رواتب المطورين", amount: -35_000, date: "Feb 15" },
    ],
  },
  {
    id: "properties",
    nameEn: "Tadfuq Properties (Dormant)",
    nameAr: "تدفق العقارية (خاملة)",
    balance: 170_000,
    inflowMTD: 25_000,
    outflowMTD: 20_000,
    status: "dormant",
    health: 45,
    color: "#ef4444",
    borderColor: "border-l-red-500",
    bankAccounts: [
      { nameEn: "Al Rajhi - Property Account", nameAr: "الراجحي - حساب العقارات", balance: 120_000 },
      { nameEn: "SNB - Maintenance Fund", nameAr: "البنك الأهلي - صندوق الصيانة", balance: 50_000 },
    ],
    sparkline: [210, 205, 200, 198, 195, 192, 190, 188, 185, 183, 180, 178, 175, 172, 170].map(v => v * 1000),
    recentTx: [
      { descEn: "Rental income – Unit 3", descAr: "دخل إيجار – وحدة ٣", amount: 15_000, date: "Feb 20" },
      { descEn: "Property tax", descAr: "ضريبة عقارية", amount: -8_000, date: "Feb 18" },
      { descEn: "Maintenance fee", descAr: "رسوم صيانة", amount: -5_000, date: "Feb 14" },
    ],
  },
];

// ── Chart Data ───────────────────────────────────────────────────────────────

const STACKED_BAR_DATA = [
  { month: "Sep", monthAr: "سبتمبر", hq: 380_000, construction: 320_000, trading: 140_000, tech: 70_000, properties: 20_000 },
  { month: "Oct", monthAr: "أكتوبر", hq: 400_000, construction: 340_000, trading: 150_000, tech: 75_000, properties: 22_000 },
  { month: "Nov", monthAr: "نوفمبر", hq: 420_000, construction: 350_000, trading: 160_000, tech: 80_000, properties: 18_000 },
  { month: "Dec", monthAr: "ديسمبر", hq: 450_000, construction: 380_000, trading: 155_000, tech: 85_000, properties: 20_000 },
  { month: "Jan", monthAr: "يناير", hq: 490_000, construction: 390_000, trading: 170_000, tech: 90_000, properties: 22_000 },
  { month: "Feb", monthAr: "فبراير", hq: 520_000, construction: 410_000, trading: 180_000, tech: 95_000, properties: 25_000 },
];

const RADAR_DATA = [
  { dimension: "Liquidity", dimensionAr: "السيولة", hq: 90, construction: 80, trading: 70, tech: 65, properties: 40 },
  { dimension: "Collection Speed", dimensionAr: "سرعة التحصيل", hq: 85, construction: 75, trading: 65, tech: 60, properties: 50 },
  { dimension: "Burn Control", dimensionAr: "ضبط الحرق", hq: 88, construction: 72, trading: 74, tech: 68, properties: 55 },
  { dimension: "Growth", dimensionAr: "النمو", hq: 82, construction: 78, trading: 68, tech: 70, properties: 30 },
];

const DONUT_DATA = [
  { name: "HQ", nameAr: "المقر الرئيسي", value: 2_100_000, pct: "43.6%", color: "#10b981" },
  { name: "Construction", nameAr: "المقاولات", value: 1_450_000, pct: "30.1%", color: "#3b82f6" },
  { name: "Trading", nameAr: "التجارة", value: 680_000, pct: "14.1%", color: "#6366f1" },
  { name: "Tech", nameAr: "الحلول التقنية", value: 420_000, pct: "8.7%", color: "#f59e0b" },
  { name: "Properties", nameAr: "العقارية", value: 170_000, pct: "3.5%", color: "#ef4444" },
];

interface IntercompanyTransfer {
  fromId: string;
  fromEn: string;
  fromAr: string;
  fromColor: string;
  toId: string;
  toEn: string;
  toAr: string;
  toColor: string;
  amount: number;
  date: string;
  dateAr: string;
  purposeEn: string;
  purposeAr: string;
}

const INTERCOMPANY_TRANSFERS: IntercompanyTransfer[] = [
  { fromId: "hq", fromEn: "HQ", fromAr: "المقر الرئيسي", fromColor: "#10b981", toId: "construction", toEn: "Construction", toAr: "المقاولات", toColor: "#3b82f6", amount: 150_000, date: "Feb 20", dateAr: "٢٠ فبراير", purposeEn: "Project funding", purposeAr: "تمويل مشروع" },
  { fromId: "trading", fromEn: "Trading", fromAr: "التجارة", fromColor: "#6366f1", toId: "hq", toEn: "HQ", toAr: "المقر الرئيسي", toColor: "#10b981", amount: 80_000, date: "Feb 18", dateAr: "١٨ فبراير", purposeEn: "Dividend distribution", purposeAr: "توزيع أرباح" },
  { fromId: "hq", fromEn: "HQ", fromAr: "المقر الرئيسي", fromColor: "#10b981", toId: "tech", toEn: "Tech", toAr: "الحلول التقنية", toColor: "#f59e0b", amount: 70_000, date: "Feb 15", dateAr: "١٥ فبراير", purposeEn: "Operating capital", purposeAr: "رأس مال تشغيلي" },
  { fromId: "construction", fromEn: "Construction", fromAr: "المقاولات", fromColor: "#3b82f6", toId: "trading", toEn: "Trading", toAr: "التجارة", toColor: "#6366f1", amount: 50_000, date: "Feb 10", dateAr: "١٠ فبراير", purposeEn: "Material procurement", purposeAr: "شراء مواد" },
];

// ── Custom Tooltips ──────────────────────────────────────────────────────────

function StackedBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value || 0), 0);
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs min-w-[160px]">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="tabular-nums font-mono">{fmtAxis(p.value)}</span>
        </div>
      ))}
      <div className="border-t mt-1 pt-1 font-semibold flex justify-between">
        <span>Total</span>
        <span className="tabular-nums font-mono">{fmtAxis(total)}</span>
      </div>
    </div>
  );
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-foreground">{d.name}</p>
      <p className="tabular-nums font-mono">{fmtSAR(d.value)}</p>
    </div>
  );
}

// ── Sparkline Component ──────────────────────────────────────────────────────

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={60}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
        <defs>
          <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${color.replace("#", "")})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Health Badge ─────────────────────────────────────────────────────────────

function HealthBadge({ score }: { score: number }) {
  const variant = score >= 75 ? "emerald" : score >= 60 ? "amber" : "red";
  const colors = {
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  const dot = { emerald: "🟢", amber: "🟡", red: "🔴" };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", colors[variant])}>
      {dot[variant]} {score}/100
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GroupConsolidationPage() {
  const { locale, dir } = useI18n();
  const isAr = locale === "ar";
  const { profile } = useCompany();

  const [filter, setFilter] = useState<"all" | "active" | "dormant">("all");
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedEntities(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredEntities = ENTITIES.filter(e => {
    if (filter === "all") return true;
    return e.status === filter;
  });

  const filterOptions: { key: "all" | "active" | "dormant"; en: string; ar: string }[] = [
    { key: "all", en: "All", ar: "الكل" },
    { key: "active", en: "Active", ar: "نشط" },
    { key: "dormant", en: "Dormant", ar: "خامل" },
  ];

  // ── KPI values ──
  const kpis = [
    { labelEn: "Total Group Balance", labelAr: "إجمالي رصيد المجموعة", value: "SAR 4,820,000", valueAr: "٤٬٨٢٠٬٠٠٠ ر.س", color: "text-foreground", icon: Building2 },
    { labelEn: "Total Inflows (MTD)", labelAr: "إجمالي التدفقات الداخلة (الشهر)", value: "+SAR 1,230,000", valueAr: "+١٬٢٣٠٬٠٠٠ ر.س", color: "text-emerald-600 dark:text-emerald-400", icon: TrendingUp },
    { labelEn: "Total Outflows (MTD)", labelAr: "إجمالي التدفقات الخارجة (الشهر)", value: "-SAR 980,000", valueAr: "-٩٨٠٬٠٠٠ ر.س", color: "text-red-600 dark:text-red-400", icon: TrendingDown },
    { labelEn: "Intercompany Transfers", labelAr: "التحويلات بين الشركات", value: "SAR 350,000", valueAr: "٣٥٠٬٠٠٠ ر.س", color: "text-indigo-600 dark:text-indigo-400", icon: ArrowRightLeft },
    { labelEn: "Group Runway", labelAr: "مدرج المجموعة", value: "18.5 months", valueAr: "١٨.٥ شهر", color: "text-foreground", icon: Landmark },
  ];

  return (
    <div dir={dir} className="flex flex-col h-full overflow-y-auto bg-background">
      <div className="max-w-6xl w-full mx-auto px-4 py-8 space-y-6">

        {/* ── 1. Page Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GitMerge className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl font-bold tracking-tight">
                {isAr ? "التوحيد المجمّع" : "Group Consolidation"}
              </h1>
              <Badge variant="secondary" className="text-xs">
                {isAr ? "٥ كيانات" : "5 Entities"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {isAr
                ? "عرض السيولة الموحدة لجميع الكيانات"
                : "Consolidated cash view across all entities"}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{isAr ? "آخر مزامنة منذ ٢ دقيقة" : "Last synced 2 min ago"}</span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2">
          {filterOptions.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                filter === f.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {isAr ? f.ar : f.en}
            </button>
          ))}
        </div>

        {/* ── 2. KPI Strip ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {kpis.map(kpi => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.labelEn} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">
                      {isAr ? kpi.labelAr : kpi.labelEn}
                    </span>
                  </div>
                  <p className={cn("text-lg font-bold tabular-nums", kpi.color)}>
                    {isAr ? kpi.valueAr : kpi.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── 3. Entity Breakdown Cards ──────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            {isAr ? "تفصيل الكيانات" : "Entity Breakdown"}
          </h2>
          {filteredEntities.map(entity => {
            const expanded = expandedEntities.has(entity.id);
            return (
              <Card
                key={entity.id}
                className={cn("border-l-4 overflow-hidden transition-all", entity.borderColor)}
              >
                <button
                  onClick={() => toggleExpand(entity.id)}
                  className="w-full text-start"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
                      {/* Name + Status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold truncate">
                            {isAr ? entity.nameAr : entity.nameEn}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] uppercase",
                              entity.status === "active"
                                ? "border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400"
                                : "border-red-300 text-red-600 dark:border-red-700 dark:text-red-400"
                            )}
                          >
                            {isAr
                              ? entity.status === "active" ? "نشط" : "خامل"
                              : entity.status === "active" ? "Active" : "Dormant"}
                          </Badge>
                        </div>
                      </div>

                      {/* Metrics row */}
                      <div className="flex items-center gap-4 sm:gap-6 text-sm flex-wrap">
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                            {isAr ? "الرصيد" : "Balance"}
                          </p>
                          <p className="font-bold tabular-nums">{fmtSAR(entity.balance)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                            {isAr ? "الوارد" : "Inflow"}
                          </p>
                          <p className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                            {fmtSAR(entity.inflowMTD, true)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                            {isAr ? "الصادر" : "Outflow"}
                          </p>
                          <p className="font-medium tabular-nums text-red-600 dark:text-red-400">
                            {fmtSAR(-entity.outflowMTD, true)}
                          </p>
                        </div>
                        <HealthBadge score={entity.health} />
                        {expanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </button>

                {/* Expanded Details */}
                {expanded && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-4 bg-muted/20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Bank Accounts */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {isAr ? "الحسابات البنكية" : "Bank Accounts"}
                        </h4>
                        {entity.bankAccounts.map(acc => (
                          <div
                            key={acc.nameEn}
                            className="flex items-center justify-between p-2 rounded-lg bg-background border text-sm"
                          >
                            <span className="truncate text-xs">
                              {isAr ? acc.nameAr : acc.nameEn}
                            </span>
                            <span className="font-mono text-xs font-medium tabular-nums">
                              {fmtSAR(acc.balance)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Sparkline */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {isAr ? "اتجاه آخر ٣٠ يوم" : "30-Day Balance Trend"}
                        </h4>
                        <div className="rounded-lg bg-background border p-2">
                          <MiniSparkline data={entity.sparkline} color={entity.color} />
                        </div>
                      </div>

                      {/* Recent Transactions */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {isAr ? "آخر المعاملات" : "Recent Transactions"}
                        </h4>
                        {entity.recentTx.map((tx, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 rounded-lg bg-background border text-xs"
                          >
                            <div className="truncate">
                              <p className="font-medium truncate">{isAr ? tx.descAr : tx.descEn}</p>
                              <p className="text-muted-foreground">{tx.date}</p>
                            </div>
                            <span
                              className={cn(
                                "font-mono font-medium tabular-nums whitespace-nowrap",
                                tx.amount >= 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-red-600 dark:text-red-400"
                              )}
                            >
                              {tx.amount >= 0 ? "+" : ""}{fmtSAR(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* ── 4 + 8. Group Chart (60%) + Donut (40%) ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Stacked Bar Chart */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {isAr ? "التدفق النقدي للمجموعة (٦ أشهر)" : "Group Cash Flow (6 Months)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={STACKED_BAR_DATA}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey={isAr ? "monthAr" : "month"}
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tickFormatter={fmtAxis}
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <Tooltip content={<StackedBarTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(value: string) => {
                      const labels: Record<string, { en: string; ar: string }> = {
                        hq: { en: "HQ", ar: "المقر الرئيسي" },
                        construction: { en: "Construction", ar: "المقاولات" },
                        trading: { en: "Trading", ar: "التجارة" },
                        tech: { en: "Tech", ar: "الحلول التقنية" },
                        properties: { en: "Properties", ar: "العقارية" },
                      };
                      return isAr ? labels[value]?.ar ?? value : labels[value]?.en ?? value;
                    }}
                  />
                  <Bar dataKey="hq" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="construction" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="trading" stackId="a" fill="#6366f1" />
                  <Bar dataKey="tech" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="properties" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Donut Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {isAr ? "توزيع رصيد المجموعة" : "Group Balance Allocation"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={DONUT_DATA}
                    dataKey="value"
                    nameKey={isAr ? "nameAr" : "name"}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {DONUT_DATA.map(d => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                  <text
                    x="50%"
                    y="47%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-lg font-bold"
                  >
                    SAR 4.82M
                  </text>
                  <text
                    x="50%"
                    y="57%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    {isAr ? "إجمالي المجموعة" : "Group Total"}
                  </text>
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1 text-xs">
                {DONUT_DATA.map(d => (
                  <span key={d.name} className="flex items-center gap-1">
                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{isAr ? d.nameAr : d.name}</span>
                    <span className="font-medium tabular-nums">{d.pct}</span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── 5 + 6. Intercompany (60%) + Radar (40%) ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Intercompany Transfers */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-indigo-500" />
                <CardTitle className="text-base">
                  {isAr ? "التحويلات بين الشركات" : "Intercompany Transfers"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {INTERCOMPANY_TRANSFERS.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border text-sm"
                >
                  {/* From */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.fromColor }} />
                    <span className="font-medium truncate text-xs">
                      {isAr ? t.fromAr : t.fromEn}
                    </span>
                  </div>

                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />

                  {/* To */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.toColor }} />
                    <span className="font-medium truncate text-xs">
                      {isAr ? t.toAr : t.toEn}
                    </span>
                  </div>

                  {/* Amount + details */}
                  <div className="flex items-center gap-3 ms-auto text-xs flex-shrink-0">
                    <span className="font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                      {fmtSAR(t.amount)}
                    </span>
                    <span className="text-muted-foreground hidden sm:inline">
                      {isAr ? t.dateAr : t.date}
                    </span>
                    <Badge variant="outline" className="text-[10px] hidden md:inline-flex">
                      {isAr ? t.purposeAr : t.purposeEn}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {isAr ? "رادار صحة الكيانات" : "Entity Health Radar"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis
                    dataKey={isAr ? "dimensionAr" : "dimension"}
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fontSize: 9 }}
                    className="fill-muted-foreground"
                  />
                  <Radar name={isAr ? "المقر الرئيسي" : "HQ"} dataKey="hq" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  <Radar name={isAr ? "المقاولات" : "Construction"} dataKey="construction" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  <Radar name={isAr ? "التجارة" : "Trading"} dataKey="trading" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                  <Radar name={isAr ? "الحلول التقنية" : "Tech"} dataKey="tech" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                  <Radar name={isAr ? "العقارية" : "Properties"} dataKey="properties" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ── 7. AI Insight Card ──────────────────────────────────────────── */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-2 flex-shrink-0">
                <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-3 min-w-0">
                <div>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                    {isAr ? "رقيب — رؤى المجموعة" : "Raqib — Group Insights"}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {isAr
                      ? "سيولة المجموعة قوية عند ٤.٨٢ مليون ر.س. لكن مؤشر صحة تدفق العقارية انخفض إلى ٤٥/١٠٠ — يُنصح بضخ ١٠٠ ألف ر.س من فائض المقر الرئيسي أو تجميد النشاط لتقليل الحرق. تدفق للمقاولات أداؤها جيد لكن لديها ٢٨٠ ألف ر.س مستحقات متأخرة."
                      : "Group liquidity is strong at SAR 4.82M. However, Tadfuq Properties health score dropped to 45/100 — consider injecting SAR 100K from HQ surplus or initiating dormancy freeze to reduce burn. Construction LLC is performing well but has SAR 280K in overdue receivables."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="default" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                    {isAr ? "تحويل أموال" : "Transfer Funds"}
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    {isAr ? "عرض التفاصيل" : "View Details"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
