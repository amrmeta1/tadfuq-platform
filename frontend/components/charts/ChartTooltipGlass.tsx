"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
  dataKey?: string;
}

interface ChartTooltipGlassProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  fmt: (n: number) => string;
  pctChange?: number;
  className?: string;
  /** Premium layout: single main value in big bold + optional sub line (e.g. الوارد | الصادر) */
  mainValue?: number;
  subLine?: string;
  /** When true, label is shown as month + year (e.g. مارس 2026); use with mainValue for premium layout */
  isPremium?: boolean;
}

/** Premium dark glassmorphism tooltip: month in Arabic, main value bold, % change, sub line */
export function ChartTooltipGlass({
  active,
  payload,
  label,
  fmt,
  pctChange,
  className,
  mainValue,
  subLine,
  isPremium = false,
}: ChartTooltipGlassProps) {
  if (!active) return null;
  const displayMainValue = mainValue != null ? mainValue : (payload?.length ? Number(payload[0]?.value) : undefined);
  const showPremiumLayout = Boolean(isPremium && label && displayMainValue != null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "rounded-xl border border-emerald-500/40 bg-black/90 backdrop-blur-md shadow-xl min-w-[200px] max-w-[280px]",
        "ring-1 ring-white/5",
        "[box-shadow:0_0_0_1px_rgba(16,185,129,0.2),0_12px_40px_-12px_rgba(0,0,0,0.6),0_0_32px_-8px_rgba(16,185,129,0.15)]",
        showPremiumLayout ? "px-4 py-3" : "px-3.5 py-2.5 text-xs",
        className
      )}
    >
      {/* Line 1: Month name in Arabic (e.g. مارس 2026) */}
      {label && (
        <p className="font-semibold text-white/95 mb-2 border-b border-white/10 pb-2 text-sm">
          {label}
        </p>
      )}

      {showPremiumLayout ? (
        <>
          {/* Line 2: Main value – big bold, neon green */}
          <p className="text-lg font-bold tabular-nums text-emerald-400 tracking-tight mb-1.5">
            {fmt(displayMainValue)}
          </p>
          {/* Line 3: Percentage change – green / red */}
          {pctChange != null && (
            <p
              className={cn(
                "text-sm font-semibold tabular-nums mb-1",
                pctChange >= 0 ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(1)}%
            </p>
          )}
          {/* Line 4: Small second line – الوارد | الصادر */}
          {subLine && (
            <p className="text-[11px] text-white/70 border-t border-white/10 pt-2 mt-1 leading-relaxed">
              {subLine}
            </p>
          )}
        </>
      ) : (
        <>
          <div className="space-y-1 text-xs">
            {payload?.map((p) => (
              <div key={p.dataKey ?? p.name} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-white/80">
                  {p.color != null && (
                    <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                  )}
                  {p.name}
                </span>
                <span className="font-semibold tabular-nums text-emerald-400">{fmt(Number(p.value))}</span>
              </div>
            ))}
          </div>
          {pctChange != null && (
            <div
              className={cn(
                "mt-1.5 pt-1.5 border-t border-white/10 font-medium tabular-nums text-xs",
                pctChange >= 0 ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {pctChange >= 0 ? "+" : ""}{pctChange.toFixed(1)}%
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

/** Recharts Tooltip – supports premium layout via mainValue, subLine, isPremium */
export function RechartsTooltipGlass({
  active,
  payload,
  label,
  fmt,
  pctChange,
  mainValue,
  subLine,
  isPremium,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color?: string; dataKey?: string }[];
  label?: string;
  fmt: (n: number) => string;
  pctChange?: number;
  mainValue?: number;
  subLine?: string;
  isPremium?: boolean;
}) {
  return (
    <ChartTooltipGlass
      active={active}
      payload={payload}
      label={label}
      fmt={fmt}
      pctChange={pctChange}
      mainValue={mainValue}
      subLine={subLine}
      isPremium={isPremium}
    />
  );
}
