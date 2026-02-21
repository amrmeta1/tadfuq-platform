"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Legend,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ForecastDataPoint {
  week: string;
  actual: number | null;
  forecast: number | null;
  isAnomaly?: boolean;
  aiNote?: string | null;
}

export interface CashflowMonthPoint {
  month: string;
  isCurrent?: boolean;
  inflow?: number;
  outflow?: number;
  inflowFuture?: number;
  outflowFuture?: number;
  balance?: number;
  balanceForecast?: number;
}

interface MasterForecastChartProps {
  data: CashflowMonthPoint[];
  currency: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number | null | undefined, currency: string): string {
  if (n == null) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${currency} ${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${currency} ${(abs / 1_000).toFixed(0)}k`;
  return `${sign}${currency} ${abs.toLocaleString()}`;
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function fmtValue(n: number | null | undefined): string {
  if (n == null) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}k`;
  return `${sign}${abs.toLocaleString()}`;
}

function ChartTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p: any) => p.value != null && p.value !== 0);
  return (
    <div dir="rtl" className="bg-popover text-popover-foreground border border-border shadow-sm rounded-lg p-3 min-w-[210px]">
      <p className="font-semibold text-sm mb-2 pb-1.5 border-b border-border">{label}</p>
      <div className="space-y-1.5">
        {rows.map((p: any) => (
          <div key={p.dataKey} className="flex justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-xs text-muted-foreground">{p.name}</span>
            </div>
            <span dir="ltr" className="font-mono text-xs font-medium tabular-nums" style={{ color: p.color }} suppressHydrationWarning>
              {fmtValue(p.value)} {currency}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MasterForecastChart({ data, currency }: MasterForecastChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data} margin={{ top: 8, right: 0, left: 16, bottom: 0 }} barGap={2}>
        <defs>
          {/* Diagonal stripe — green (future inflow) */}
          <pattern id="stripeGreen" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#34d39922" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#34d399" strokeWidth="2.5" />
          </pattern>
          {/* Diagonal stripe — rose (future outflow) */}
          <pattern id="stripeRed" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#fb718522" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#fb7185" strokeWidth="2.5" />
          </pattern>
        </defs>

        {/* Current month highlight */}
        <ReferenceArea x1="أبريل" x2="أبريل" fill="#3b82f6" fillOpacity={0.07} />

        <CartesianGrid stroke="currentColor" opacity={0.05} vertical={false} />

        <XAxis
          dataKey="month"
          reversed={true}
          tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          orientation="right"
          width={120}
          tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => {
            const abs = Math.abs(v);
            const sign = v < 0 ? "-" : "";
            if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
            if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}k`;
            return String(v);
          }}
        />

        <Tooltip content={<ChartTooltip currency={currency} />} />

        <Legend
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
        />

        {/* Past bars — solid */}
        <Bar dataKey="inflow"  name="إيرادات فعلية"  fill="#34d399" radius={[3, 3, 0, 0]} maxBarSize={32} />
        <Bar dataKey="outflow" name="مصروفات فعلية" fill="#fb7185" radius={[3, 3, 0, 0]} maxBarSize={32} />

        {/* Future bars — striped */}
        <Bar dataKey="inflowFuture"  name="إيرادات متوقعة"  fill="url(#stripeGreen)" radius={[3, 3, 0, 0]} maxBarSize={32} />
        <Bar dataKey="outflowFuture" name="مصروفات متوقعة" fill="url(#stripeRed)"   radius={[3, 3, 0, 0]} maxBarSize={32} />

        {/* Past balance — solid blue */}
        <Line
          type="monotone"
          dataKey="balance"
          name="الرصيد الفعلي"
          stroke="#818cf8"
          strokeWidth={2.5}
          dot={{ r: 3.5, fill: "var(--background)", stroke: "#818cf8", strokeWidth: 2 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
          connectNulls={false}
        />

        {/* Future balance — dashed indigo */}
        <Line
          type="monotone"
          dataKey="balanceForecast"
          name="الرصيد المتوقع"
          stroke="#818cf8"
          strokeWidth={2.5}
          strokeDasharray="5 5"
          dot={{ r: 3.5, fill: "var(--background)", stroke: "#818cf8", strokeWidth: 2 }}
          activeDot={{ r: 5, strokeWidth: 0 }}
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
