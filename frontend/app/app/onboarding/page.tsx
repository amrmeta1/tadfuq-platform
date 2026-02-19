"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe, Building2, Banknote, Upload, CheckCircle2,
  ChevronLeft, TrendingUp, Bell, Bot, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "cashflow_onboarding_v2";

interface OnboardingState {
  step: number;
  country: string;
  industry: string;
  currency: string;
  cashFloor: number;
  bankAccountName: string;
  completed: boolean;
}

const defaultState: OnboardingState = {
  step: 0, country: "", industry: "", currency: "SAR",
  cashFloor: 50000, bankAccountName: "", completed: false,
};

const COUNTRIES = [
  { value: "SA", en: "Saudi Arabia (KSA)", ar: "المملكة العربية السعودية" },
  { value: "QA", en: "Qatar", ar: "قطر" },
  { value: "AE", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
];
const INDUSTRIES = [
  { value: "contracting", en: "Contracting", ar: "المقاولات" },
  { value: "clinic", en: "Healthcare / Clinic", ar: "الرعاية الصحية / العيادات" },
  { value: "retail", en: "Retail", ar: "التجزئة" },
  { value: "services", en: "Professional Services", ar: "الخدمات المهنية" },
];
const CURRENCIES = [
  { value: "SAR", label: "SAR — Saudi Riyal" },
  { value: "QAR", label: "QAR — Qatari Riyal" },
  { value: "AED", label: "AED — UAE Dirham" },
];
const STEPS = [
  { icon: Globe, titleKey: "step1Title" as const, descKey: "step1Desc" as const },
  { icon: Banknote, titleKey: "step2Title" as const, descKey: "step2Desc" as const },
  { icon: Building2, titleKey: "step3Title" as const, descKey: "step3Desc" as const },
  { icon: Upload, titleKey: "step4Title" as const, descKey: "step4Desc" as const },
  { icon: CheckCircle2, titleKey: "step5Title" as const, descKey: "step5Desc" as const },
];
const PREVIEW_FEATURES = [
  { icon: TrendingUp, en: "13-week cash flow forecast", ar: "توقعات التدفق النقدي ١٣ أسبوعًا" },
  { icon: Bell, en: "Proactive cash shortfall alerts", ar: "تنبيهات استباقية لنقص السيولة" },
  { icon: Bot, en: "AI daily morning brief", ar: "الملخص الصباحي اليومي بالذكاء الاصطناعي" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { t, locale, dir } = useI18n();
  const { toast } = useToast();
  const isAr = locale === "ar";

  const [state, setState] = useState<OnboardingState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { try { return JSON.parse(saved); } catch { /* ignore */ } }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const update = (p: Partial<OnboardingState>) => setState((prev) => ({ ...prev, ...p }));
  const next = () => update({ step: Math.min(state.step + 1, 4) });
  const back = () => update({ step: Math.max(state.step - 1, 0) });
  const finish = () => {
    update({ completed: true });
    toast({ title: t.onboarding.forecastReady, variant: "success" });
    setTimeout(() => router.push("/app/dashboard"), 1200);
  };

  const cur = STEPS[state.step];
  const CurIcon = cur.icon;

  return (
    <div dir={dir} className="flex h-full min-h-[calc(100vh-48px)]">
      {/* Left panel */}
      <div className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col border-e bg-card p-8">
        <div className="flex items-center gap-2 mb-10">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">CF</div>
          <span className="font-semibold text-sm">{t.common.appName}</span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-5">
            {isAr ? "خطوات الإعداد" : "Setup Steps"}
          </p>
          <ol className="space-y-0">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isDone = i < state.step;
              const isActive = i === state.step;
              return (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                      isDone && "border-primary bg-primary text-primary-foreground",
                      isActive && "border-primary text-primary bg-primary/10",
                      !isDone && !isActive && "border-border text-muted-foreground"
                    )}>
                      {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3 w-3" />}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn("w-px h-7 mt-0.5", i < state.step ? "bg-primary/40" : "bg-border")} />
                    )}
                  </div>
                  <div className="pb-7 pt-0.5">
                    <p className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                      {t.onboarding[step.titleKey]}
                    </p>
                    {isActive && (
                      <p className="text-xs text-muted-foreground mt-0.5">{t.onboarding[step.descKey]}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="border-t pt-5 space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground">{isAr ? "ما ستحصل عليه" : "What you'll get"}</p>
          {PREVIEW_FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                {isAr ? f.ar : f.en}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-start justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile progress */}
          <div className="flex items-center gap-1.5 mb-6 lg:hidden">
            {STEPS.map((_, i) => (
              <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= state.step ? "bg-primary" : "bg-border")} />
            ))}
          </div>

          {/* Step header */}
          <div className="mb-6">
            <div className="flex items-center gap-1.5 mb-1">
              <CurIcon className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                {isAr ? `الخطوة ${state.step + 1} من ${STEPS.length}` : `Step ${state.step + 1} of ${STEPS.length}`}
              </span>
            </div>
            <h1 className="text-xl font-semibold">{t.onboarding[cur.titleKey]}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t.onboarding[cur.descKey]}</p>
          </div>

          {/* Step 1 */}
          {state.step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">{t.onboarding.country}</Label>
                <Select value={state.country} onValueChange={(v) => update({ country: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder={isAr ? "اختر البلد" : "Select country"} /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => <SelectItem key={c.value} value={c.value}>{isAr ? c.ar : c.en}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">{t.onboarding.industry}</Label>
                <Select value={state.industry} onValueChange={(v) => update({ industry: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder={isAr ? "اختر الصناعة" : "Select industry"} /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => <SelectItem key={ind.value} value={ind.value}>{isAr ? ind.ar : ind.en}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2 flex justify-end">
                <Button size="sm" onClick={next} disabled={!state.country || !state.industry}>
                  {t.common.next} <ArrowRight className="ms-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {state.step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">{t.onboarding.currency}</Label>
                <Select value={state.currency} onValueChange={(v) => update({ currency: v })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">{t.onboarding.cashFloor}</Label>
                <Input type="number" className="h-9 tabular" value={state.cashFloor}
                  onChange={(e) => update({ cashFloor: Number(e.target.value) })} />
                <p className="text-xs text-muted-foreground">{t.onboarding.cashFloorHelp}</p>
              </div>
              <div className="pt-2 flex justify-between">
                <Button size="sm" variant="ghost" onClick={back}><ChevronLeft className="me-1 h-3.5 w-3.5" />{t.common.back}</Button>
                <Button size="sm" onClick={next}>{t.common.next} <ArrowRight className="ms-1.5 h-3.5 w-3.5" /></Button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {state.step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm">{t.import.accountNickname}</Label>
                <Input className="h-9" placeholder={isAr ? "مثال: حساب الراجحي الرئيسي" : "e.g. Al Rajhi Main Account"}
                  value={state.bankAccountName} onChange={(e) => update({ bankAccountName: e.target.value })} />
              </div>
              <div className="pt-2 flex justify-between">
                <Button size="sm" variant="ghost" onClick={back}><ChevronLeft className="me-1 h-3.5 w-3.5" />{t.common.back}</Button>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={next}>{t.onboarding.skipForNow}</Button>
                  <Button size="sm" onClick={next} disabled={!state.bankAccountName}>
                    {t.common.next} <ArrowRight className="ms-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {state.step === 3 && (
            <div className="space-y-4">
              <div
                className="flex flex-col items-center justify-center rounded-md border border-dashed p-10 text-center cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => router.push("/app/import")}
              >
                <Upload className="h-7 w-7 text-muted-foreground mb-3" />
                <p className="text-sm font-medium">{t.onboarding.importNow}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.import.dragDrop}</p>
              </div>
              <div className="pt-2 flex justify-between">
                <Button size="sm" variant="ghost" onClick={back}><ChevronLeft className="me-1 h-3.5 w-3.5" />{t.common.back}</Button>
                <Button size="sm" variant="outline" onClick={next}>{t.onboarding.skipForNow}</Button>
              </div>
            </div>
          )}

          {/* Step 5 */}
          {state.step === 4 && (
            <div className="space-y-5">
              <div className="flex items-start gap-3 rounded-md border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{t.onboarding.step5Title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.onboarding.forecastReady}</p>
                </div>
              </div>
              {/* Brief preview */}
              <div className="rounded-md border bg-card">
                <div className="px-4 py-2.5 border-b">
                  <p className="text-xs font-medium text-muted-foreground">{t.onboarding.briefPreview}</p>
                </div>
                <div className="divide-y">
                  {[
                    { icon: "💰", en: "Current balance: —", ar: "الرصيد الحالي: —" },
                    { icon: "📈", en: "Expected inflows today: —", ar: "التدفقات المتوقعة اليوم: —" },
                    { icon: "⚠️", en: "Action needed: —", ar: "إجراء مطلوب: —" },
                    { icon: "🔮", en: "13-week outlook: —", ar: "توقعات ١٣ أسبوعًا: —" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      <span className="text-base shrink-0">{item.icon}</span>
                      <span className="text-muted-foreground">{isAr ? item.ar : item.en}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-2 flex justify-between">
                <Button size="sm" variant="ghost" onClick={back}><ChevronLeft className="me-1 h-3.5 w-3.5" />{t.common.back}</Button>
                <Button size="sm" onClick={finish}>
                  {t.onboarding.finishSetup} <CheckCircle2 className="ms-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
