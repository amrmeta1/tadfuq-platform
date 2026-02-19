"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Upload, CheckCircle2, FileText, X, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/ui/toast";
import { cn, formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────
interface PreviewRow {
  date: string;
  description: string;
  counterparty: string;
  amount: number;
  currency: string;
}

type ImportStage = "idle" | "dragging" | "parsing" | "preview" | "success";

// ── Mock preview data generator ───────────────────────────────────────────────
function generatePreviewRows(): PreviewRow[] {
  return [
    { date: "2024-01-15", description: "Payroll — January 2024", counterparty: "WPS Transfer", amount: -320000, currency: "SAR" },
    { date: "2024-01-16", description: "Client Payment — INV-2024-089", counterparty: "Al-Noor Contracting", amount: 280000, currency: "SAR" },
    { date: "2024-01-17", description: "Office Rent — Q1", counterparty: "Al Rajhi Real Estate", amount: -42000, currency: "SAR" },
    { date: "2024-01-18", description: "Software Subscriptions", counterparty: "Various SaaS", amount: -9500, currency: "SAR" },
    { date: "2024-01-19", description: "Revenue — Project Milestone 3", counterparty: "NEOM Development", amount: 180000, currency: "SAR" },
  ];
}

// ── Preview table ─────────────────────────────────────────────────────────────
function PreviewTable({ rows, locale, isAr }: { rows: PreviewRow[]; locale: string; isAr: boolean }) {
  const columns: ColumnDef<PreviewRow>[] = [
    {
      accessorKey: "date",
      header: isAr ? "التاريخ" : "Date",
      cell: ({ getValue }) => (
        <span className="tabular-nums text-xs text-muted-foreground">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "description",
      header: isAr ? "الوصف" : "Description",
      cell: ({ getValue, row }) => (
        <div>
          <p className="text-sm font-medium truncate max-w-[200px]">{getValue() as string}</p>
          <p className="text-xs text-muted-foreground">{row.original.counterparty}</p>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: isAr ? "المبلغ" : "Amount",
      cell: ({ getValue, row }) => {
        const v = getValue() as number;
        return (
          <div className="text-end">
            <span className={cn("tabular-nums text-sm font-semibold", v >= 0 ? "text-emerald-600" : "text-rose-600")}>
              {v < 0 ? "-" : "+"}{formatCurrency(Math.abs(v), row.original.currency, locale)}
            </span>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="px-4 py-2.5 text-start text-xs font-medium text-muted-foreground">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-muted/20 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2.5">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ImportPage() {
  const { locale, dir } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const isAr = locale === "ar";

  const [stage, setStage] = useState<ImportStage>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);

  const simulateParse = useCallback((file: File) => {
    setFileName(file.name);
    setStage("parsing");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setPreviewRows(generatePreviewRows());
          setStage("preview");
          return 100;
        }
        return p + Math.random() * 18 + 8;
      });
    }, 120);
  }, []);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) simulateParse(accepted[0]);
  }, [simulateParse]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/vnd.ms-excel": [".xls", ".xlsx"] },
    multiple: false,
    disabled: stage === "parsing" || stage === "success",
  });

  const handleConfirm = async () => {
    setStage("parsing");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 20;
      });
    }, 150);
    await new Promise((r) => setTimeout(r, 900));
    setStage("success");
    toast({
      title: isAr ? "تم استيراد البيانات بنجاح" : "Import successful",
      description: isAr ? "تم حفظ ٥ معاملات" : "5 transactions saved",
      variant: "success",
    });
  };

  const handleReset = () => {
    setStage("idle");
    setProgress(0);
    setFileName("");
    setPreviewRows([]);
  };

  return (
    <div dir={dir} className="flex flex-col gap-5 p-5 md:p-6 max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <Upload className="h-4 w-4 text-muted-foreground" />
        <h1 className="text-sm font-semibold">
          {isAr ? "استيراد كشف الحساب" : "Import Bank Statement"}
        </h1>
      </div>

      {/* ── Success state ── */}
      {stage === "success" && (
        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="flex items-start gap-4 p-5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                {isAr ? "تم الاستيراد بنجاح" : "Import Complete"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAr ? "تم حفظ ٥ معاملات في دفتر الأستاذ" : "5 transactions saved to your ledger"}
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => router.push("/app/transactions")}>
                  {isAr ? "عرض المعاملات" : "View Transactions"}
                  <ArrowRight className="ms-1.5 h-3.5 w-3.5" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleReset}>
                  {isAr ? "استيراد ملف آخر" : "Import Another"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Dropzone ── */}
      {stage !== "success" && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">
              {isAr ? "رفع الملف" : "Upload File"}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {isAr ? "يدعم ملفات CSV وExcel" : "Supports CSV and Excel files"}
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {/* Drop zone */}
            <div
              {...getRootProps()}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition-all cursor-pointer select-none",
                isDragActive
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30",
                (stage === "parsing") && "pointer-events-none opacity-60"
              )}
            >
              <input {...getInputProps()} />
              {fileName && stage !== "idle" ? (
                <div className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium">{fileName}</span>
                  {stage === "preview" && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleReset(); }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium">
                    {isDragActive
                      ? (isAr ? "أفلت الملف هنا" : "Drop the file here")
                      : (isAr ? "اسحب وأفلت ملف CSV هنا" : "Drag & drop a CSV file here")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAr ? "أو انقر للاختيار من جهازك" : "or click to browse your files"}
                  </p>
                  <div className="flex gap-1.5 mt-3">
                    {[".csv", ".xls", ".xlsx"].map((ext) => (
                      <Badge key={ext} variant="outline" className="text-[10px] font-mono">{ext}</Badge>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Progress bar */}
            {stage === "parsing" && (
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{isAr ? "جارٍ التحليل..." : "Parsing file..."}</span>
                  <span className="tabular-nums">{Math.min(Math.round(progress), 100)}%</span>
                </div>
                <Progress value={Math.min(progress, 100)} className="h-1.5" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Preview table ── */}
      {stage === "preview" && previewRows.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  {isAr ? "معاينة البيانات" : "Data Preview"}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAr ? `عرض أول ${previewRows.length} صفوف` : `Showing first ${previewRows.length} rows`}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {previewRows.length} {isAr ? "صفوف" : "rows"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <PreviewTable rows={previewRows} locale={locale} isAr={isAr} />

            {/* CTA */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-muted-foreground">
                {isAr ? "تحقق من البيانات قبل الحفظ" : "Review the data before saving"}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleReset}>
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button size="sm" onClick={handleConfirm}>
                  {isAr ? "تأكيد وحفظ" : "Confirm & Save"}
                  <CheckCircle2 className="ms-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Tips ── */}
      {stage === "idle" && (
        <Card className="bg-muted/30">
          <CardContent className="px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {isAr ? "تلميحات للاستيراد" : "Import Tips"}
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
              <li>{isAr ? "يجب أن يحتوي الملف على أعمدة: التاريخ، الوصف، المبلغ" : "File must include columns: Date, Description, Amount"}</li>
              <li>{isAr ? "تنسيق التاريخ المقبول: YYYY-MM-DD أو DD/MM/YYYY" : "Accepted date formats: YYYY-MM-DD or DD/MM/YYYY"}</li>
              <li>{isAr ? "المبالغ السالبة تمثل المدفوعات، والموجبة تمثل الإيرادات" : "Negative amounts = outflows, positive = inflows"}</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
