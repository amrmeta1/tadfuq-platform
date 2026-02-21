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
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EVOLUTION_DATA = [
  { month: "أكتوبر", inflow: 85000,  outflow: 62000,  balance: 110000 },
  { month: "نوفمبر", inflow: 92000,  outflow: 71000,  balance: 131000 },
  { month: "ديسمبر", inflow: 78000,  outflow: 85000,  balance: 124000 },
  { month: "يناير",  inflow: 105000, outflow: 68000,  balance: 161000 },
  { month: "فبراير", inflow: 98000,  outflow: 74000,  balance: 185000 },
  { month: "مارس",   inflow: 112000, outflow: 79000,  balance: 218000 },
];

function ChartTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2.5 shadow-lg text-xs space-y-1 min-w-[160px]">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-medium tabular-nums" style={{ color: p.color }}>
            {currency} {Number(p.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

interface CashFlowChartProps {
  currency: string;
}

export default function CashFlowChart({ currency }: CashFlowChartProps) {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-2 pt-5 px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">تطور السيولة النقدية</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Cash Evolution · آخر 6 أشهر</p>
          </div>
          <Badge variant="outline" className="text-[10px] font-medium" suppressHydrationWarning>
            {currency}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-5">
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={EVOLUTION_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="currentColor" opacity={0.05} vertical={false} />
            <XAxis
              dataKey="month"
              reversed={true}
              tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }}
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            />
            <Tooltip content={<ChartTooltip currency={currency} />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 16 }} />
            <Bar dataKey="inflow"  name="أموال داخلة" fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="outflow" name="أموال خارجة" fill="#fb7185" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Line
              type="monotone"
              dataKey="balance"
              name="إجمالي الرصيد"
              stroke="#818cf8"
              strokeWidth={3}
              dot={{ r: 4, fill: "var(--background)", stroke: "#818cf8", strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
