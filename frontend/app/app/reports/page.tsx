"use client";

import { useState, useMemo } from "react";
import { Plus, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useI18n } from "@/lib/i18n/context";
import { useTenant } from "@/lib/hooks/use-tenant";
import { useToast } from "@/components/ui/toast";
import { useReports, useGenerateReport } from "@/features/reports/hooks";
import { buildReportColumns } from "@/features/reports/report-columns";
import { GenerateDialog } from "@/features/reports/generate-dialog";
import { ReportPreview } from "@/features/reports/report-preview";
import type { Report, GenerateFormValues } from "@/features/reports/types";

export default function ReportsPage() {
  const { locale, dir } = useI18n();
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const isAr = locale === "ar";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState<Report | null>(null);

  const { data: reports = [], isLoading } = useReports(currentTenant?.id);
  const { mutate: generate, isPending } = useGenerateReport(currentTenant?.id);

  const handleGenerate = (values: GenerateFormValues) => {
    generate(values, {
      onSuccess: (report) => {
        setDialogOpen(false);
        setPreviewReport(report);
        toast({
          title: isAr ? "تم إنشاء التقرير" : "Report generated",
          variant: "success",
        });
      },
    });
  };

  const columns = useMemo(
    () => buildReportColumns(isAr, locale, setPreviewReport),
    [isAr, locale]
  );

  return (
    <div dir={dir} className="flex h-full" data-page-full>
      {/* ── Left: report list ── */}
      <div className={`flex flex-col border-e bg-card ${previewReport ? "w-[420px] shrink-0" : "flex-1"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h1 className="text-sm font-semibold">
              {isAr ? "التقارير" : "Reports"}
            </h1>
          </div>
          <Button
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            {isAr ? "إنشاء تقرير" : "Generate"}
          </Button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <DataTable<Report>
            columns={columns}
            data={reports}
            isLoading={isLoading}
            skeletonRows={5}
            getRowId={(r) => r.id}
            onRowClick={(r) => r.status !== "generating" && setPreviewReport(r)}
            selectedRowId={previewReport?.id ?? null}
            emptyState={
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 opacity-30" />
                <p className="text-sm">
                  {isAr ? "لا توجد تقارير بعد" : "No reports yet"}
                </p>
              </div>
            }
          />
        </div>
      </div>

      {/* ── Right: A4 preview ── */}
      {previewReport && (
        <ReportPreview
          report={previewReport}
          onClose={() => setPreviewReport(null)}
          isAr={isAr}
          locale={locale}
        />
      )}

      {/* ── Generate dialog ── */}
      <GenerateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleGenerate}
        isPending={isPending}
        isAr={isAr}
      />
    </div>
  );
}
