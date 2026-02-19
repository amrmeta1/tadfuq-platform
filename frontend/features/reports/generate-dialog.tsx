"use client";

import { useForm, Controller } from "react-hook-form";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GenerateFormValues, ReportType } from "./types";

const PERIODS = [
  { value: "2025-01", en: "January 2025",   ar: "يناير ٢٠٢٥" },
  { value: "2024-12", en: "December 2024",  ar: "ديسمبر ٢٠٢٤" },
  { value: "2024-11", en: "November 2024",  ar: "نوفمبر ٢٠٢٤" },
  { value: "2024-10", en: "October 2024",   ar: "أكتوبر ٢٠٢٤" },
  { value: "2024-Q4", en: "Q4 2024",        ar: "الربع الرابع ٢٠٢٤" },
  { value: "2024-Q3", en: "Q3 2024",        ar: "الربع الثالث ٢٠٢٤" },
];

interface GenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GenerateFormValues) => void;
  isPending: boolean;
  isAr: boolean;
}

export function GenerateDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  isAr,
}: GenerateDialogProps) {
  const { control, handleSubmit, watch, reset } = useForm<GenerateFormValues>({
    defaultValues: {
      period: "2025-01",
      type: "monthly",
      include_ai: true,
    },
  });

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isAr ? "إنشاء تقرير جديد" : "Generate Report"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">
          {/* Report type */}
          <div className="space-y-1.5">
            <Label className="text-sm">
              {isAr ? "نوع التقرير" : "Report type"}
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v as ReportType)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">
                      {isAr ? "شهري" : "Monthly"}
                    </SelectItem>
                    <SelectItem value="quarterly">
                      {isAr ? "ربع سنوي" : "Quarterly"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Period */}
          <div className="space-y-1.5">
            <Label className="text-sm">
              {isAr ? "الفترة" : "Period"}
            </Label>
            <Controller
              name="period"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {isAr ? p.ar : p.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Include AI insights toggle */}
          <Controller
            name="include_ai"
            control={control}
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-md border bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {isAr ? "تضمين رؤى الذكاء الاصطناعي" : "Include AI Insights"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isAr
                        ? "تحليل مستشار وتوصياته"
                        : "Mustashar analysis & recommendations"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            )}
          />

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleClose(false)}
              disabled={isPending}
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" />
                  {isAr ? "جارٍ الإنشاء..." : "Generating…"}
                </>
              ) : (
                isAr ? "إنشاء" : "Generate"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
