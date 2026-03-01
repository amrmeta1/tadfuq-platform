"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { DriversPopover } from "./DriversPopover";

const MOCK_BRIEF = {
  risks: [
    { id: "r1", textAr: "فاتورة #INV-2847 متأخرة ٧ أيام — ٢٨,٠٠٠ ر.س", textEn: "Invoice #INV-2847 overdue 7 days — 28,000 SAR" },
    { id: "r2", textAr: "مصروف المرافق أعلى ٤٠٪ من المتوسط", textEn: "Utility spend 40% above 3-month average" },
  ],
  opportunities: [
    { id: "o1", textAr: "تحويل ٢٠٠,٠٠٠ ر.س إلى وديعة عالية العائد", textEn: "Move 200,000 to high-yield deposit" },
    { id: "o2", textAr: "إيرادات خدمات متوقعة اليوم ٢٣,٠٠٠ ر.س", textEn: "Expected service revenue today 23,000 SAR" },
  ],
  recommendations: [
    { id: "rec1", textAr: "متابعة الفاتورة المتأخرة وإرسال تذكير واتساب", textEn: "Follow up on overdue invoice and send WhatsApp reminder" },
    { id: "rec2", textAr: "محاكاة تحويل جزء من الرصيد إلى وديعة", textEn: "Simulate moving part of balance to deposit" },
    { id: "rec3", textAr: "إقرار ضريبة القيمة المضافة مستحق خلال ١٢ يوماً", textEn: "VAT filing due in 12 days — documents ready" },
  ],
  confidence: 82,
  dataQuality: 91,
  lastUpdated: "2026-02-24T08:00:00",
};

interface AIDailyBriefProps {
  onOpenCases?: () => void;
  onOpenSimulation?: () => void;
}

export function AIDailyBrief({ onOpenCases, onOpenSimulation }: AIDailyBriefProps) {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const lastUpdatedFormatted = new Date(MOCK_BRIEF.lastUpdated).toLocaleString(
    isAr ? "ar-SA" : "en-GB",
    { dateStyle: "short", timeStyle: "short" }
  );

  return (
    <Card className="border-s-4 border-s-indigo-500 shadow-sm">
      <CardHeader className="pb-3 pt-5 px-5">
        <CardTitle className="text-lg font-semibold">
          {isAr ? "ملخص الخزينة اليومي" : "Daily Treasury Brief"}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">
            {isAr ? "الثقة" : "Confidence"}: {MOCK_BRIEF.confidence}%
          </Badge>
          <Badge variant="outline" className="text-xs">
            {isAr ? "جودة البيانات" : "Data Quality"}: {MOCK_BRIEF.dataQuality}%
          </Badge>
          <span className="text-xs text-muted-foreground">
            {isAr ? "آخر تحديث:" : "Last updated:"} {lastUpdatedFormatted}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-5">
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {isAr ? "المخاطر" : "Risks"}
          </h3>
          <ul className="space-y-1.5 text-sm">
            {MOCK_BRIEF.risks.map((r) => (
              <li key={r.id} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                {isAr ? r.textAr : r.textEn}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {isAr ? "الفرص" : "Opportunities"}
          </h3>
          <ul className="space-y-1.5 text-sm">
            {MOCK_BRIEF.opportunities.map((o) => (
              <li key={o.id} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                {isAr ? o.textAr : o.textEn}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {isAr ? "التوصيات" : "Recommendations"}
          </h3>
          <ul className="space-y-2 text-sm">
            {MOCK_BRIEF.recommendations.map((rec) => (
              <li key={rec.id} className="flex items-start justify-between gap-2">
                <span>{isAr ? rec.textAr : rec.textEn}</span>
                <DriversPopover>
                  <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0">
                    {isAr ? "لماذا؟" : "Why?"}
                  </Button>
                </DriversPopover>
              </li>
            ))}
          </ul>
        </section>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <Button size="sm" variant="outline" className="text-xs" onClick={onOpenCases}>
            {isAr ? "عرض الحالات" : "View Cases"}
          </Button>
          <Button size="sm" variant="outline" className="text-xs" onClick={onOpenSimulation}>
            {isAr ? "تشغيل محاكاة" : "Run Simulation"}
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            {isAr ? "تصدير التقرير الأسبوعي" : "Export Weekly Report"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
