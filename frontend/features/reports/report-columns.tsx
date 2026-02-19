"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import type { Report } from "./types";

export function buildReportColumns(
  isAr: boolean,
  locale: string,
  onPreview: (report: Report) => void
): ColumnDef<Report, any>[] {
  return [
    {
      id: "title",
      accessorFn: (row) => (isAr ? row.title_ar : row.title_en),
      header: () => <span>{isAr ? "التقرير" : "Report"}</span>,
      cell: ({ row }) => {
        const r = row.original;
        const isGenerating = r.status === "generating";
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted">
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className={cn("font-medium leading-snug", isGenerating && "text-muted-foreground italic")}>
                {isAr ? r.title_ar : r.title_en}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isGenerating
                  ? (isAr ? "جارٍ الإنشاء..." : "Generating…")
                  : `${formatDate(r.generated_at, locale)} · ${r.size_kb} KB`}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      id: "type",
      accessorKey: "type",
      size: 90,
      header: () => <span>{isAr ? "النوع" : "Type"}</span>,
      cell: ({ getValue }) => {
        const type = getValue<string>();
        return (
          <Badge variant="outline" className="text-xs">
            {type === "quarterly"
              ? (isAr ? "ربعي" : "Quarterly")
              : (isAr ? "شهري" : "Monthly")}
          </Badge>
        );
      },
    },
    {
      id: "net_cash_flow",
      accessorFn: (row) => row.summary.net_cash_flow,
      size: 130,
      header: () => <span>{isAr ? "صافي التدفق" : "Net Cash Flow"}</span>,
      cell: ({ row }) => {
        const net = row.original.summary.net_cash_flow;
        if (row.original.status === "generating") return <span className="text-muted-foreground">—</span>;
        const isPos = net >= 0;
        return (
          <span className={cn("tabular font-semibold", isPos ? "inflow" : "outflow")}>
            {isPos ? "+" : ""}
            {formatCurrency(net, "SAR", locale)}
          </span>
        );
      },
    },
    {
      id: "include_ai",
      accessorKey: "include_ai",
      size: 80,
      header: () => <span>{isAr ? "AI" : "AI"}</span>,
      cell: ({ getValue }) =>
        getValue<boolean>() ? (
          <Badge className="text-xs bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400 border-0">
            {isAr ? "مُضمَّن" : "Included"}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      id: "actions",
      size: 80,
      header: () => null,
      cell: ({ row }) => {
        const r = row.original;
        if (r.status === "generating") return null;
        return (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={(e) => { e.stopPropagation(); onPreview(r); }}
            >
              {isAr ? "عرض" : "View"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={(e) => e.stopPropagation()}
              aria-label={isAr ? "تنزيل" : "Download"}
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];
}
