"use client";

import { Filter, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Severity, AlertStatus } from "./types";

const SEVERITY_OPTIONS: { value: Severity; labelEn: string; labelAr: string }[] = [
  { value: "high", labelEn: "High", labelAr: "عالي" },
  { value: "medium", labelEn: "Medium", labelAr: "متوسط" },
  { value: "low", labelEn: "Low", labelAr: "منخفض" },
];

const STATUS_OPTIONS: { value: AlertStatus; labelEn: string; labelAr: string }[] = [
  { value: "open", labelEn: "Open", labelAr: "مفتوح" },
  { value: "acknowledged", labelEn: "Acknowledged", labelAr: "مُعترف به" },
  { value: "resolved", labelEn: "Resolved", labelAr: "محلول" },
];

interface AlertsToolbarProps {
  severityFilter: Severity[];
  statusFilter: AlertStatus[];
  onSeverityChange: (v: Severity[]) => void;
  onStatusChange: (v: AlertStatus[]) => void;
  onRefresh: () => void;
  totalCount: number;
  filteredCount: number;
  selectedCount: number;
  onBulkResolve?: () => void;
  isAr: boolean;
}

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export function AlertsToolbar({
  severityFilter,
  statusFilter,
  onSeverityChange,
  onStatusChange,
  onRefresh,
  totalCount,
  filteredCount,
  selectedCount,
  onBulkResolve,
  isAr,
}: AlertsToolbarProps) {
  const hasFilters = severityFilter.length > 0 || statusFilter.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b bg-muted/30 shrink-0">
      <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground me-1">
        {isAr ? "تصفية:" : "Filter:"}
      </span>

      {/* Severity pills */}
      <div className="flex gap-1">
        {SEVERITY_OPTIONS.map((opt) => {
          const active = severityFilter.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => onSeverityChange(toggleItem(severityFilter, opt.value))}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/40"
              )}
            >
              {isAr ? opt.labelAr : opt.labelEn}
            </button>
          );
        })}
      </div>

      <div className="w-px h-4 bg-border mx-0.5" />

      {/* Status pills */}
      <div className="flex gap-1">
        {STATUS_OPTIONS.map((opt) => {
          const active = statusFilter.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => onStatusChange(toggleItem(statusFilter, opt.value))}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/40"
              )}
            >
              {isAr ? opt.labelAr : opt.labelEn}
            </button>
          );
        })}
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => { onSeverityChange([]); onStatusChange([]); }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" />
          {isAr ? "مسح" : "Clear"}
        </button>
      )}

      {/* Right side */}
      <div className="ms-auto flex items-center gap-2">
        {selectedCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={onBulkResolve}
          >
            {isAr ? `حل ${selectedCount} تنبيهات` : `Resolve ${selectedCount} selected`}
          </Button>
        )}
        <span className="text-xs text-muted-foreground tabular">
          {filteredCount === totalCount
            ? `${totalCount} ${isAr ? "تنبيه" : "alerts"}`
            : `${filteredCount} / ${totalCount} ${isAr ? "تنبيه" : "alerts"}`}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={onRefresh}
          aria-label={isAr ? "تحديث" : "Refresh"}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
