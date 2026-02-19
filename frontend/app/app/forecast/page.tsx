"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  TrendingUp, Settings2, Save, ChevronDown, ChevronUp,
  AlertTriangle, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/lib/i18n/context";
import { useTenant } from "@/lib/hooks/use-tenant";
import { useToast } from "@/components/ui/toast";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

// ── Mock data ──────────────────────────────────────────────────────────────
function generateForecast(weeks: number, scenario: string) {
  const base = 820000;
  const multiplier = scenario === "optimistic" ? 1.18 : scenario === "pessimistic" ? 0.78 : 1;
  const rows = [];
  let balance = base;
  const now = new Date();
  for (let w = 0; w < weeks; w++) {
    const d = new Date(now);
    d.setDate(d.getDate() + w * 7);
    const inflow = (Math.random() * 120000 + 80000) * multiplier;
    const outflow = Math.random() * 95000 + 60000;
    balance = balance + inflow - outflow;
    rows.push({
      week: `W${w + 1}`,
      date: d.toISOString().slice(0, 10),
      inflow: Math.round(inflow),
      outflow: Math.round(outflow),
      balance: Math.round(balance),
      low: Math.round(balance * 0.88),
      high: Math.round(balance * 1.12),
    });
  }
  return rows;
}

// ── Custom tooltip ─────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, locale, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover shadow-lg p-3 text-xs min-w-[180px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4 mb-1">
          <span className="text-muted-foreground">{p.name}</span>
          <span className={cn("font-medium tabular", p.dataKey === "outflow" ? "outflow" : "text-foreground")}>
            {formatCurrency(p.value, currency, locale)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ForecastPage() {
  const { t, locale, dir } = useI18n();
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const isAr = locale === "ar";

  const [range, setRange] = useState<"13w" | "30d">("13w");
  const [scenario, setScenario] = useState<"base" | "optimistic" | "pessimistic">("base");
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);
  const [assumptions, setAssumptions] = useState({
    collectionDelay: 14,
    cashFloor: 50000,
    fixedExpenses: 180000,
  });
  const [draft, setDraft] = useState(assumptions);

  const weeks = range === "13w" ? 13 : 5;
  const currency = "SAR";

  const { data: rows, isLoading } = useQuery({
    queryKey: ["forecast", range, scenario, currentTenant?.id],
    queryFn: () => Promise.resolve(generateForecast(weeks, scenario)),
  });

  const saveMutation = useMutation({
    mutationFn: async (vals: typeof assumptions) => {
      await new Promise((r) => setTimeout(r, 600));
      return vals;
    },
    onSuccess: (vals) => {
      setAssumptions(vals);
      toast({ title: isAr ? "تم حفظ الافتراضات" : "Assumptions saved", variant: "success" });
    },
  });

  const minBalance = rows ? Math.min(...rows.map((r) => r.balance)) : 0;
  const belowFloor = minBalance < assumptions.cashFloor;

  const SCENARIO_LABELS = {
    base: isAr ? "السيناريو الأساسي" : "Base",
    optimistic: isAr ? "متفائل" : "Optimistic",
    pessimistic: isAr ? "متشائم" : "Pessimistic",
  };

  return (
    <div dir={dir} className="flex flex-col gap-0 h-full" data-page-full>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold">{t.nav.forecast}</h1>
          {belowFloor && (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertTriangle className="h-3 w-3" />
              {isAr ? "أقل من الحد الأدنى" : "Below cash floor"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Range segmented control */}
          <div className="flex rounded-md border overflow-hidden text-xs">
            {(["13w", "30d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-3 py-1.5 font-medium transition-colors",
                  range === r ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
                )}
              >
                {r === "13w" ? (isAr ? "١٣ أسبوعًا" : "13-Week") : (isAr ? "٣٠ يومًا" : "30-Day")}
              </button>
            ))}
          </div>
          {/* Scenario */}
          <Select value={scenario} onValueChange={(v) => setScenario(v as typeof scenario)}>
            <SelectTrigger className="h-7 w-[130px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["base", "optimistic", "pessimistic"] as const).map((s) => (
                <SelectItem key={s} value={s} className="text-xs">{SCENARIO_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
            <Download className="h-3.5 w-3.5" />
            {isAr ? "تصدير" : "Export"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => setAssumptionsOpen((o) => !o)}
          >
            <Settings2 className="h-3.5 w-3.5" />
            {isAr ? "الافتراضات" : "Assumptions"}
            {assumptionsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* ── Assumptions panel (collapsible) ── */}
      {assumptionsOpen && (
        <div className="border-b bg-muted/30 px-6 py-4 shrink-0">
          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "تأخير التحصيل (أيام)" : "Collection delay (days)"}</Label>
              <Input type="number" className="h-7 w-24 text-xs tabular"
                value={draft.collectionDelay}
                onChange={(e) => setDraft((d) => ({ ...d, collectionDelay: +e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "الحد الأدنى للنقد" : "Cash floor"}</Label>
              <Input type="number" className="h-7 w-32 text-xs tabular"
                value={draft.cashFloor}
                onChange={(e) => setDraft((d) => ({ ...d, cashFloor: +e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "المصاريف الثابتة الشهرية" : "Monthly fixed expenses"}</Label>
              <Input type="number" className="h-7 w-36 text-xs tabular"
                value={draft.fixedExpenses}
                onChange={(e) => setDraft((d) => ({ ...d, fixedExpenses: +e.target.value }))} />
            </div>
            <Button size="sm" className="h-7 text-xs gap-1"
              onClick={() => saveMutation.mutate(draft)}
              disabled={saveMutation.isPending}>
              <Save className="h-3.5 w-3.5" />
              {saveMutation.isPending ? (isAr ? "جارٍ الحفظ..." : "Saving…") : (isAr ? "حفظ" : "Save")}
            </Button>
          </div>
        </div>
      )}

      {/* ── KPI strip ── */}
      {isLoading ? (
        <div className="flex gap-px border-b shrink-0">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 flex-1 rounded-none" />)}
        </div>
      ) : rows && (
        <div className="grid grid-cols-2 md:grid-cols-4 border-b shrink-0">
          {[
            { label: isAr ? "الرصيد الحالي" : "Current Balance", value: rows[0]?.balance, color: "text-foreground" },
            { label: isAr ? "أدنى رصيد متوقع" : "Projected Low", value: minBalance, color: belowFloor ? "outflow" : "inflow" },
            { label: isAr ? "إجمالي التدفقات" : "Total Inflows", value: rows.reduce((s, r) => s + r.inflow, 0), color: "inflow" },
            { label: isAr ? "إجمالي المدفوعات" : "Total Outflows", value: rows.reduce((s, r) => s + r.outflow, 0), color: "outflow" },
          ].map((kpi, i) => (
            <div key={i} className={cn("px-5 py-3.5 border-e last:border-e-0", i > 0 && "border-s-0")}>
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className={cn("text-lg font-semibold tabular", kpi.color)}>
                {formatCurrency(kpi.value, currency, locale)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Chart ── */}
      <div className="px-6 pt-5 pb-2 shrink-0">
        {isLoading ? (
          <Skeleton className="h-56 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={rows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(243 75% 59%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(243 75% 59%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(243 75% 59%)" stopOpacity={0.06} />
                  <stop offset="95%" stopColor="hsl(243 75% 59%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5.9% 90%)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(240 3.8% 46.1%)" }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                width={45}
              />
              <ReTooltip content={<ChartTooltip locale={locale} currency={currency} />} />
              {/* Confidence band */}
              <Area dataKey="high" stroke="none" fill="url(#bandGrad)" legendType="none" name="" />
              <Area dataKey="low" stroke="none" fill="white" legendType="none" name="" />
              {/* Balance line */}
              <Area
                dataKey="balance"
                stroke="hsl(243 75% 59%)"
                strokeWidth={2}
                fill="url(#balGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                name={isAr ? "الرصيد" : "Balance"}
              />
              {/* Cash floor reference */}
              <ReferenceLine
                y={assumptions.cashFloor}
                stroke="hsl(0 72% 51%)"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{ value: isAr ? "الحد الأدنى" : "Floor", position: "insideTopRight", fontSize: 10, fill: "hsl(0 72% 51%)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Data table ── */}
      <div className="flex-1 overflow-auto border-t">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted/60 backdrop-blur border-b">
              <tr>
                {[
                  isAr ? "الأسبوع" : "Week",
                  isAr ? "التاريخ" : "Date",
                  isAr ? "التدفقات" : "Inflows",
                  isAr ? "المدفوعات" : "Outflows",
                  isAr ? "صافي" : "Net",
                  isAr ? "الرصيد" : "Balance",
                ].map((h) => (
                  <th key={h} className="px-4 py-2 text-start font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows?.map((row, i) => {
                const net = row.inflow - row.outflow;
                const isBelowFloor = row.balance < assumptions.cashFloor;
                return (
                  <tr key={i} className={cn("hover:bg-muted/30 transition-colors", isBelowFloor && "bg-red-50/50 dark:bg-red-950/20")}>
                    <td className="px-4 py-2 font-medium tabular">{row.week}</td>
                    <td className="px-4 py-2 text-muted-foreground tabular">{formatDate(row.date, locale)}</td>
                    <td className="px-4 py-2 inflow tabular">{formatCurrency(row.inflow, currency, locale)}</td>
                    <td className="px-4 py-2 outflow tabular">{formatCurrency(row.outflow, currency, locale)}</td>
                    <td className={cn("px-4 py-2 tabular font-medium", net >= 0 ? "inflow" : "outflow")}>
                      {net >= 0 ? "+" : ""}{formatCurrency(net, currency, locale)}
                    </td>
                    <td className={cn("px-4 py-2 tabular font-semibold", isBelowFloor ? "outflow" : "text-foreground")}>
                      {formatCurrency(row.balance, currency, locale)}
                      {isBelowFloor && <AlertTriangle className="inline ms-1 h-3 w-3" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
