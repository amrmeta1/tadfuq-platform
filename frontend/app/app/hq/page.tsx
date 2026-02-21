"use client";

import { useState } from "react";
import { ArrowRightLeft, Building2, ChevronDown, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/context";
import { useCompany } from "@/contexts/CompanyContext";

// ── Types & mock data ──────────────────────────────────────────────────────────

type EntityStatus = "risk" | "watch" | "stable";

interface Subsidiary {
  id: string;
  sector: string;
  status: EntityStatus;
  runway: string;
  balance: number;
}

const STATUS_META: Record<EntityStatus, {
  dot: string; label: string; selectedCls: string; badgeCls: string;
}> = {
  risk:   { dot: "🔴", label: "عجز وشيك",  selectedCls: "bg-red-500/5 border-s-4 border-s-red-500",          badgeCls: "border-destructive/40 bg-destructive/5 text-destructive" },
  watch:  { dot: "🟡", label: "انتباه",     selectedCls: "bg-orange-500/5 border-s-4 border-s-orange-400",    badgeCls: "border-orange-400/40 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400" },
  stable: { dot: "🟢", label: "مستقر",      selectedCls: "hover:bg-muted/50 border-s-4 border-s-transparent", badgeCls: "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400" },
};

function buildEntities(name: string): Subsidiary[] {
  return [
    { id: "1", sector: `${name} - قطاع المقاولات`,   status: "risk",   runway: "يكفي لـ 14 يوم فقط", balance: -45_000    },
    { id: "2", sector: `${name} - قطاع التجزئة`,     status: "stable", runway: "يكفي لـ 8 أشهر",     balance: 3_400_000  },
    { id: "3", sector: `${name} - قطاع التقنية`,     status: "stable", runway: "يكفي لـ 14 شهر",     balance: 5_200_000  },
    { id: "4", sector: `${name} - قطاع العقارات`,    status: "watch",  runway: "يكفي لـ 6 أسابيع",   balance: 820_000    },
    { id: "5", sector: `${name} - قطاع اللوجستيات`, status: "stable", runway: "يكفي لـ 11 شهر",     balance: 2_180_000  },
  ];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number, curr: string): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "+";
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M ${curr}`;
  if (abs >= 1_000)     return `${sign}${(abs / 1_000).toFixed(0)}k ${curr}`;
  return `${sign}${abs.toLocaleString("en-US")} ${curr}`;
}

function fmtFull(n: number, curr: string): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  return `${sign}${abs.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${curr}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HQHubPage() {
  const { dir } = useI18n();
  const { profile } = useCompany();
  const curr = profile.currency || "SAR";
  const companyName = profile.companyName || "المجموعة";

  const ENTITIES = buildEntities(companyName);
  const [selectedId, setSelectedId] = useState<string>("1");
  const selected = ENTITIES.find((e) => e.id === selectedId) ?? ENTITIES[0];
  const selMeta = STATUS_META[selected.status];
  const topBorderCls =
    selected.status === "risk"  ? "border-t-red-500" :
    selected.status === "watch" ? "border-t-orange-400" :
                                  "border-t-emerald-500";

  return (
    <div dir={dir} className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6 w-full max-w-[1800px] mx-auto overflow-hidden p-5 md:p-6">

      {/* ══ RIGHT PANE — Master Subsidiaries List ══ */}
      <div className="flex-[3] flex flex-col gap-4 overflow-y-auto min-w-0 pb-4 pe-2">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-500 shrink-0" />
            <h1 className="text-2xl font-bold tracking-tight">
              المركز الرئيسي للمجموعة{" "}
              <span className="text-muted-foreground font-normal text-lg">(Group HQ)</span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1" suppressHydrationWarning>
            مجموعة {companyName} القابضة
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="rounded-lg border bg-card p-3 min-w-[170px]">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">السيولة المجمعة</p>
              <p className="text-lg font-bold tabular-nums text-foreground" suppressHydrationWarning>18,450,000 {curr}</p>
              <div className="text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md text-xs font-medium w-fit mt-1.5">موزعة على 5 فروع</div>
            </div>
            <div className="rounded-lg border bg-card p-3 min-w-[150px]">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">شركات في خطر</p>
              <p className="text-lg font-bold tabular-nums text-destructive flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive animate-pulse shrink-0" />1 فرع
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3 min-w-[170px]">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">فائض متاح</p>
              <p className="text-lg font-bold tabular-nums text-foreground" suppressHydrationWarning>2,100,000 {curr}</p>
              <div className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md text-xs font-medium w-fit mt-1.5 flex items-center gap-1">↗ متاح للتحويل</div>
            </div>
          </div>
        </div>

        {/* Subsidiaries list card */}
        <Card className="flex-1 overflow-hidden flex flex-col shadow-sm border-border/50">
          <div className="flex items-center gap-2 p-3 border-b shrink-0">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 shrink-0">
              حالة السيولة <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1 shrink-0">
              ترتيب حسب الرصيد <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {ENTITIES.map((entity) => {
              const isSelected = entity.id === selectedId;
              const meta = STATUS_META[entity.status];
              const isNeg = entity.balance < 0;
              return (
                <div
                  key={entity.id}
                  onClick={() => setSelectedId(entity.id)}
                  className={`p-4 border-b cursor-pointer flex justify-between items-center transition-colors gap-4 ${
                    isSelected ? meta.selectedCls : "hover:bg-muted/50 border-s-4 border-s-transparent"
                  }`}
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border w-fit ${meta.badgeCls}`}>
                      {meta.dot} {meta.label}
                    </span>
                    <p className="text-sm font-semibold truncate" suppressHydrationWarning>{entity.sector}</p>
                    <p className="text-[11px] text-muted-foreground">{entity.runway}</p>
                  </div>
                  <p className={`text-sm font-bold tabular-nums shrink-0 ${isNeg ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`} suppressHydrationWarning>
                    <span dir="ltr">{fmt(entity.balance, curr)}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ══ LEFT PANE — Subsidiary Detail + AI Copilot ══ */}
      <div className="flex-[2] flex flex-col gap-4 border-s border-border/50 ps-6 overflow-y-auto min-w-0 pb-4">

        {/* Subsidiary context card */}
        <Card className={`p-5 shadow-sm border-border/50 shrink-0 border-t-4 ${topBorderCls}`}>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold" suppressHydrationWarning>
            فرع: {selected.sector}
          </p>
          <p className={`text-3xl font-bold tabular-nums mt-2 ${selected.balance < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`} suppressHydrationWarning>
            <span dir="ltr">{fmtFull(selected.balance, curr)}</span>
          </p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${selMeta.badgeCls}`}>
              {selMeta.dot} {selMeta.label} — {selected.runway}
            </span>
          </div>
          {selected.status === "risk" && (
            <p className="text-xs text-destructive mt-2 font-medium">
              🔴 عجز متوقع بعد 14 يوم لسداد الرواتب (Expected Payroll Shortfall)
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div><p className="font-medium text-foreground">القطاع</p><p>المقاولات والبنية التحتية</p></div>
            <div><p className="font-medium text-foreground">البنك</p><p>QNB — الجاري</p></div>
            <div><p className="font-medium text-foreground">آخر تحديث</p><p>اليوم، 02:14 ص</p></div>
            <div><p className="font-medium text-foreground">العملة</p><p suppressHydrationWarning>{curr}</p></div>
          </div>
        </Card>

        {/* AI Inter-Company Transfer Copilot */}
        <Card className="flex-1 p-6 bg-indigo-900/10 border-indigo-500/20 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <div>
              <p className="text-sm font-bold">خطة الإنقاذ من الوكيل مُستشار</p>
              <p className="text-[10px] text-muted-foreground">Inter-Company Rescue Plan</p>
            </div>
            <span className="ms-auto inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold px-2 py-0.5">
              <Sparkles className="h-2.5 w-2.5" />AI
            </span>
          </div>

          <div className="rounded-lg bg-white/60 dark:bg-white/5 border border-indigo-100 dark:border-indigo-900/50 p-4">
            <p className="text-sm text-foreground leading-relaxed" suppressHydrationWarning>
              قطاع المقاولات سيواجه عجزاً بقيمة <strong>45,000 {curr}</strong> لسداد الرواتب.
              في المقابل، يمتلك <strong>(قطاع التجزئة)</strong> فائضاً نقدياً غير مستغل بقيمة{" "}
              <strong>2.1 مليون {curr}</strong> في بنك QNB. أنصح بتنفيذ تحويل داخلي
              (Inter-company Loan) لتجنب السحب على المكشوف وتوفير 7% فوائد بنكية.
            </p>
          </div>

          {/* Visual transfer schema */}
          <div className="flex items-center justify-center gap-3 rounded-lg bg-white/60 dark:bg-white/5 border border-indigo-100 dark:border-indigo-900/50 p-3 flex-wrap">
            <span className="rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1.5 border border-emerald-300 dark:border-emerald-800">
              فرع التجزئة
            </span>
            <ArrowRightLeft className="h-4 w-4 text-indigo-500 shrink-0" />
            <span className="rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs font-bold px-2.5 py-1.5 border border-indigo-300 dark:border-indigo-800 tabular-nums" suppressHydrationWarning>
              45,000 {curr}
            </span>
            <ArrowRightLeft className="h-4 w-4 text-indigo-500 shrink-0" />
            <span className="rounded-md bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-semibold px-2.5 py-1.5 border border-red-300 dark:border-red-800">
              فرع المقاولات
            </span>
          </div>

          {selected.status === "risk" && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/5 border border-destructive/20 p-3">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive leading-relaxed" suppressHydrationWarning>
                تحذير: بدون تدخل فوري، سيتجاوز الرصيد حد السحب على المكشوف المصرح به (100,000 {curr}) خلال 14 يوماً.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-auto">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2" size="sm" suppressHydrationWarning>
              ⚡ تنفيذ تحويل داخلي بقيمة 50,000 {curr} (Execute Transfer)
            </Button>
            <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive/5 gap-2" size="sm">
              طلب تسهيلات ائتمانية من البنك (Request Overdraft)
            </Button>
            <Button variant="outline" className="w-full gap-2" size="sm">
              عرض التفاصيل المالية للفرع (View Branch Details)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
