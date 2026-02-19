"use client";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn, formatCurrency } from "@/lib/utils";
import type { SimulatedDay } from "./use-forecast-simulation";

// ── Custom Tooltip ──────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; name: string }>;
  label?: string;
  locale: string;
  isAr: boolean;
}

function ForecastTooltip({ active, payload, label, locale, isAr }: TooltipProps) {
  if (!active || !payload?.length) return null;

  const base = payload.find((p) => p.dataKey === "baseBalance")?.value ?? 0;
  const sim = payload.find((p) => p.dataKey === "simulatedBalance")?.value ?? 0;
  const variance = sim - base;

  return (
    <div className="rounded-md border bg-popover shadow-lg p-3 text-xs min-w-[210px] space-y-2">
      <p className="font-semibold text-foreground border-b pb-1.5 mb-1.5">{label}</p>

      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-4 rounded-full bg-muted-foreground/40" style={{ borderTop: "2px dashed" }} />
          {isAr ? "الأساسي" : "Base"}
        </span>
        <span className="font-medium tabular-nums text-foreground">
          {formatCurrency(base, "SAR", locale)}
        </span>
      </div>

      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-4 rounded-full bg-primary" />
          {isAr ? "المحاكاة" : "Simulated"}
        </span>
        <span className={cn("font-semibold tabular-nums", sim < 0 ? "outflow" : "text-foreground")}>
          {formatCurrency(sim, "SAR", locale)}
        </span>
      </div>

      <div className="border-t pt-1.5 flex justify-between gap-4">
        <span className="text-muted-foreground">{isAr ? "الفارق" : "Variance"}</span>
        <span className={cn("font-semibold tabular-nums", variance >= 0 ? "inflow" : "outflow")}>
          {variance >= 0 ? "+" : ""}{formatCurrency(variance, "SAR", locale)}
        </span>
      </div>
    </div>
  );
}

// ── Chart ───────────────────────────────────────────────────────────────────

interface ForecastChartProps {
  data: SimulatedDay[];
  locale: string;
  isAr: boolean;
}

export function ForecastChart({ data, locale, isAr }: ForecastChartProps) {
  // Sample every 3rd day to keep X-axis readable (60 ticks → 20)
  const tickDays = new Set(data.filter((_, i) => i % 3 === 0).map((d) => d.label));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {/* Simulated area gradient */}
          <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="hsl(243 75% 59%)" stopOpacity={0.18} />
            <stop offset="95%" stopColor="hsl(243 75% 59%)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(240 5.9% 90%)"
          vertical={false}
          className="dark:[stroke:hsl(240_3.7%_15.9%)]"
        />

        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: "hsl(240 3.8% 46.1%)" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          tickFormatter={(v) => (tickDays.has(v) ? v : "")}
        />

        <YAxis
          tick={{ fontSize: 10, fill: "hsl(240 3.8% 46.1%)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          width={42}
          orientation={isAr ? "right" : "left"}
        />

        <ReTooltip
          content={<ForecastTooltip locale={locale} isAr={isAr} />}
          cursor={{ stroke: "hsl(240 5.9% 90%)", strokeWidth: 1 }}
        />

        {/* ── Cash Zero reference line ── */}
        <ReferenceLine
          y={0}
          stroke="hsl(0 72% 51% / 0.6)"
          strokeDasharray="4 3"
          strokeWidth={1.5}
          label={{
            value: isAr ? "صفر" : "Zero",
            position: "insideTopRight",
            fontSize: 9,
            fill: "hsl(0 72% 51%)",
          }}
        />

        {/* ── Base scenario: muted dashed line, no fill ── */}
        <Line
          dataKey="baseBalance"
          stroke="hsl(240 3.8% 46.1% / 0.5)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
          activeDot={false}
          name={isAr ? "الأساسي" : "Base"}
          legendType="line"
        />

        {/* ── Simulated scenario: bold solid line + gradient area ── */}
        <Area
          dataKey="simulatedBalance"
          stroke="hsl(243 75% 59%)"
          strokeWidth={2}
          fill="url(#simGrad)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: "hsl(243 75% 59%)" }}
          name={isAr ? "المحاكاة" : "Simulated"}
          legendType="line"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
