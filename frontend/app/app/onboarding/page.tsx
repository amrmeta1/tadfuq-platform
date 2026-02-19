"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Globe, Banknote, Plug, CheckCircle2,
  ChevronLeft, ArrowRight, Loader2, Building2,
  TrendingUp, Bell, Bot,
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

// ── Zod schemas ──────────────────────────────────────────────────────────────
const step1Schema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.enum(["contracting", "retail", "services", "healthcare"], {
    required_error: "Please select an industry",
  }),
  country: z.enum(["SA", "QA", "AE"], {
    required_error: "Please select a country",
  }),
});

const step2Schema = z.object({
  currency: z.enum(["SAR", "QAR", "AED"]),
  cashFloor: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Cannot be negative"),
});

const fullSchema = step1Schema.merge(step2Schema);
type FormValues = z.infer<typeof fullSchema>;

// ── Static data ──────────────────────────────────────────────────────────────
const COUNTRIES = [
  { value: "SA", en: "Saudi Arabia (KSA)", ar: "المملكة العربية السعودية" },
  { value: "QA", en: "Qatar", ar: "قطر" },
  { value: "AE", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" },
] as const;

const INDUSTRIES = [
  { value: "contracting", en: "Contracting", ar: "المقاولات" },
  { value: "retail", en: "Retail", ar: "التجزئة" },
  { value: "services", en: "Professional Services", ar: "الخدمات المهنية" },
  { value: "healthcare", en: "Healthcare / Clinic", ar: "الرعاية الصحية" },
] as const;

const CURRENCIES = [
  { value: "SAR", label: "SAR — Saudi Riyal" },
  { value: "QAR", label: "QAR — Qatari Riyal" },
  { value: "AED", label: "AED — UAE Dirham" },
] as const;

const STEPS = [
  { icon: Globe, en: "Business Profile", ar: "الملف التجاري", descEn: "Company details and industry", descAr: "تفاصيل الشركة والقطاع" },
  { icon: Banknote, en: "Financial Setup", ar: "الإعداد المالي", descEn: "Currency and cash thresholds", descAr: "العملة وحدود السيولة" },
  { icon: Plug, en: "Connection", ar: "الاتصال", descEn: "Connect your bank or import data", descAr: "ربط البنك أو استيراد البيانات" },
];

const PREVIEW_FEATURES = [
  { icon: TrendingUp, en: "13-week cash flow forecast", ar: "توقعات التدفق النقدي ١٣ أسبوعًا" },
  { icon: Bell, en: "Proactive cash shortfall alerts", ar: "تنبيهات استباقية لنقص السيولة" },
  { icon: Bot, en: "AI daily morning brief", ar: "الملخص الصباحي اليومي بالذكاء الاصطناعي" },
];

// ── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({ step, isAr }: { step: number; isAr: boolean }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const isDone = i < step;
        const isActive = i === step;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isActive && "border-primary text-primary bg-primary/10",
                  !isDone && !isActive && "border-border text-muted-foreground bg-card"
                )}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span className={cn("text-[10px] font-medium whitespace-nowrap", isActive ? "text-foreground" : "text-muted-foreground")}>
                {isAr ? s.ar : s.en}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("flex-1 h-px mx-2 mb-4 transition-colors", i < step ? "bg-primary/50" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Field error ──────────────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive mt-1">{message}</p>;
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const { locale, dir } = useI18n();
  const { toast } = useToast();
  const isAr = locale === "ar";

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(fullSchema),
    mode: "onChange",
    defaultValues: {
      companyName: "",
      industry: undefined,
      country: undefined,
      currency: "SAR",
      cashFloor: 50000,
    },
  });

  const goNext = async () => {
    let valid = false;
    if (step === 0) valid = await trigger(["companyName", "industry", "country"]);
    if (step === 1) valid = await trigger(["currency", "cashFloor"]);
    if (step === 2) valid = true;
    if (valid) setStep((s) => Math.min(s + 1, 2));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = async (_data: FormValues) => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    toast({ title: isAr ? "تم إعداد حسابك بنجاح" : "Account setup complete!", variant: "success" });
    router.push("/app/dashboard");
  };

  const curStep = STEPS[step];
  const CurIcon = curStep.icon;

  return (
    <div dir={dir} className="flex h-full min-h-[calc(100vh-48px)]">

      {/* ── Left panel (desktop) ── */}
      <div className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col border-e bg-card p-8">
        <div className="flex items-center gap-2 mb-10">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">CF</div>
          <span className="font-semibold text-sm">CashFlow.ai</span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-5">
            {isAr ? "خطوات الإعداد" : "Setup Steps"}
          </p>
          <ol className="space-y-0">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isDone = i < step;
              const isActive = i === step;
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
                      <div className={cn("w-px h-8 mt-0.5", i < step ? "bg-primary/40" : "bg-border")} />
                    )}
                  </div>
                  <div className="pb-8 pt-0.5">
                    <p className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                      {isAr ? s.ar : s.en}
                    </p>
                    {isActive && (
                      <p className="text-xs text-muted-foreground mt-0.5">{isAr ? s.descAr : s.descEn}</p>
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

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-start justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* Mobile progress */}
          <div className="flex items-center gap-1.5 mb-6 lg:hidden">
            {STEPS.map((_, i) => (
              <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-border")} />
            ))}
          </div>

          {/* Horizontal stepper (desktop) */}
          <div className="hidden lg:block">
            <Stepper step={step} isAr={isAr} />
          </div>

          {/* Step header */}
          <div className="mb-6">
            <div className="flex items-center gap-1.5 mb-1">
              <CurIcon className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                {isAr ? `الخطوة ${step + 1} من ${STEPS.length}` : `Step ${step + 1} of ${STEPS.length}`}
              </span>
            </div>
            <h1 className="text-xl font-semibold">{isAr ? curStep.ar : curStep.en}</h1>
            <p className="text-sm text-muted-foreground mt-1">{isAr ? curStep.descAr : curStep.descEn}</p>
          </div>

          {/* ── Step 1: Business Profile ── */}
          {step === 0 && (
            <div className="space-y-4">
              {/* Company Name */}
              <div className="space-y-1.5">
                <Label className="text-sm">{isAr ? "اسم الشركة" : "Company Name"}</Label>
                <Input
                  {...register("companyName")}
                  className="h-9"
                  placeholder={isAr ? "مثال: شركة النور للمقاولات" : "e.g. Al Noor Contracting Co."}
                />
                <FieldError message={errors.companyName?.message} />
              </div>

              {/* Industry */}
              <div className="space-y-1.5">
                <Label className="text-sm">{isAr ? "القطاع" : "Industry"}</Label>
                <Controller
                  name="industry"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={isAr ? "اختر القطاع" : "Select industry"} />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind.value} value={ind.value}>
                            {isAr ? ind.ar : ind.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.industry?.message} />
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <Label className="text-sm">{isAr ? "البلد" : "Country"}</Label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder={isAr ? "اختر البلد" : "Select country"} />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {isAr ? c.ar : c.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.country?.message} />
              </div>

              <div className="pt-2 flex justify-end">
                <Button size="sm" onClick={goNext}>
                  {isAr ? "التالي" : "Next"} <ArrowRight className="ms-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Financial Setup ── */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Currency */}
              <div className="space-y-1.5">
                <Label className="text-sm">{isAr ? "العملة الأساسية" : "Base Currency"}</Label>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.currency?.message} />
              </div>

              {/* Cash Floor */}
              <div className="space-y-1.5">
                <Label className="text-sm">{isAr ? "الحد الأدنى للسيولة" : "Minimum Cash Floor Threshold"}</Label>
                <Input
                  {...register("cashFloor")}
                  type="number"
                  className="h-9 tabular-nums"
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  {isAr ? "الحد الأدنى للرصيد النقدي الذي تريد الحفاظ عليه" : "Minimum cash balance you want to maintain"}
                </p>
                <FieldError message={errors.cashFloor?.message} />
              </div>

              <div className="pt-2 flex justify-between">
                <Button size="sm" variant="ghost" onClick={goBack}>
                  <ChevronLeft className="me-1 h-3.5 w-3.5" />
                  {isAr ? "رجوع" : "Back"}
                </Button>
                <Button size="sm" onClick={goNext}>
                  {isAr ? "التالي" : "Next"} <ArrowRight className="ms-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Connection ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-3">
                {/* Connect Bank (disabled / coming soon) */}
                <div className="rounded-lg border border-dashed p-5 flex flex-col items-center gap-3 text-center bg-muted/20">
                  <Building2 className="h-8 w-8 text-muted-foreground/50" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {isAr ? "ربط API البنك" : "Connect Bank API"}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {isAr ? "قريبًا — سيتوفر قريبًا" : "Coming Soon — available in next release"}
                    </p>
                  </div>
                  <Button type="button" size="sm" variant="outline" disabled className="opacity-50">
                    <Plug className="me-1.5 h-3.5 w-3.5" />
                    {isAr ? "ربط البنك (قريبًا)" : "Connect Bank (Coming Soon)"}
                  </Button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t" />
                  <span className="text-xs text-muted-foreground">{isAr ? "أو" : "or"}</span>
                  <div className="flex-1 border-t" />
                </div>

                {/* Skip & Import CSV */}
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => router.push("/app/import")}
                >
                  {isAr ? "تخطي واستيراد CSV" : "Skip & Import CSV"}
                  <ArrowRight className="ms-1.5 h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="pt-4 flex justify-between">
                <Button type="button" size="sm" variant="ghost" onClick={goBack}>
                  <ChevronLeft className="me-1 h-3.5 w-3.5" />
                  {isAr ? "رجوع" : "Back"}
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
                      {isAr ? "جارٍ الحفظ..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      {isAr ? "إنهاء الإعداد" : "Finish Setup"}
                      <CheckCircle2 className="ms-1.5 h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
