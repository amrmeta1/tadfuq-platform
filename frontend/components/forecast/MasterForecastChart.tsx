"use client";

import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ForecastDataPoint {
  week: string;
  actual: number | null;
  forecast: number | null;
  isAnomaly?: boolean;
  aiNote?: string | null;
}

interface MasterForecastChartProps {
  data: ForecastDataPoint[];
  isAr?: boolean;
}

// ── Chart config ──────────────────────────────────────────────────────────────

const chartConfig: ChartConfig = {
  actual: {
    label: "Actuals",
    color: "hsl(var(--primary))",
  },
  forecast: {
    label: "Forecast",
    color: "hsl(38 92% 50%)",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtSAR(n: number | null | undefined): string {
  if (n == null) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}SAR ${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}SAR ${(abs / 1_000).toFixed(0)}k`;
  return `${sign}SAR ${abs.toLocaleString("en-US")}`;
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const point: ForecastDataPoint | undefined = payload[0]?.payload;
  const actual = payload.find((p: any) => p.dataKey === "actual")?.value as number | null;
  const forecast = payload.find((p: any) => p.dataKey === "forecast")?.value as number | null;

  return (
    <div className="rounded-xl border border-border bg-popover shadow-lg text-xs min-w-[200px] overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b bg-muted/40">
        <p className="font-semibold text-foreground">{label}</p>
      </div>

      {/* Values */}
      <div className="px-3 py-2 space-y-1.5">
        {actual != null && (
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
              Actuals
            </span>
            <span className="tabular-nums font-mono font-semibold text-foreground">
              {fmtSAR(actual)}
            </span>
          </div>
        )}
        {forecast != null && (
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
              Forecast
            </span>
            <span className={cn(
              "tabular-nums font-mono font-semibold",
              forecast < 0 ? "text-destructive" : "text-foreground"
            )}>
              {fmtSAR(forecast)}
            </span>
          </div>
        )}
      </div>

      {/* AI Anomaly callout */}
      {point?.isAnomaly && point.aiNote && (
        <div className="mx-2 mb-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 shadow-[0_0_12px_-4px_hsl(0_72%_51%/0.4)]">
          <p className="text-destructive font-medium leading-snug">{point.aiNote}</p>
        </div>
      )}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MasterForecastChart({ data, isAr = false }: MasterForecastChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[340px] w-full">
      <ComposedChart data={data} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
        <defs>
          {/* Actual gradient — primary color */}
          <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
          </linearGradient>
          {/* Forecast gradient — amber */}
          <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(240 5.9% 90% / 0.4)"
        />

        <XAxis
          dataKey="week"
          tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }}
          axisLine={false}
          tickLine={false}
          width={64}
          tickFormatter={(v: number) => {
            const abs = Math.abs(v);
            const sign = v < 0 ? "-" : "";
            if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
            if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}k`;
            return String(v);
          }}
        />

        <ChartTooltip content={<CustomTooltip />} />

        {/* Today vertical marker */}
        <ReferenceLine
          x="Week 7"
          stroke="hsl(240 3.8% 46.1%)"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{
            value: isAr ? "اليوم" : "Today",
            position: "insideTopRight",
            fontSize: 10,
            fill: "hsl(240 3.8% 46.1%)",
          }}
        />

        {/* Zero cash danger line */}
        <ReferenceLine
          y={0}
          stroke="hsl(0 72% 51%)"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{
            value: isAr ? "خط الصفر" : "Zero Cash",
            position: "insideTopRight",
            fontSize: 10,
            fill: "hsl(0 72% 51%)",
          }}
        />

        {/* Actuals area — solid stroke */}
        <Area
          type="monotone"
          dataKey="actual"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#gradActual)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: "hsl(var(--primary))" }}
          connectNulls={false}
        />

        {/* Forecast area — dashed stroke */}
        <Area
          type="monotone"
          dataKey="forecast"
          stroke="hsl(38 92% 50%)"
          strokeWidth={2}
          strokeDasharray="5 5"
          fill="url(#gradForecast)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: "hsl(38 92% 50%)" }}
          connectNulls={false}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
