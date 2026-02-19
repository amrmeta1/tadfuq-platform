"use client";

import { TrendingUp, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { useForecastSimulation } from "@/features/forecast/use-forecast-simulation";
import { ForecastChart } from "@/features/forecast/forecast-chart";
import { ScenarioSandbox } from "@/features/forecast/scenario-sandbox";

const CURRENCY = "SAR";

// ── Main page ──────────────────────────────────────────────────────────────
export default function ForecastPage() {
  const { t, locale, dir } = useI18n();
  const isAr = locale === "ar";

  const { baseline, simulated, params, setParam, reset, cashZeroDate } =
    useForecastSimulation();

  // KPI calculations from simulated data
  const simMinBalance = Math.min(...simulated.map((d) => d.simulatedBalance));
  const simTotalInflow = simulated.reduce((s, d) => s + d.simulatedInflow, 0);
  const simTotalOutflow = simulated.reduce((s, d) => s + d.simulatedOutflow, 0);
  const baseMinBalance = Math.min(...baseline.map((d) => d.baseBalance));

  const kpis = [
    {
      label: isAr ? "الرصيد الابتدائي" : "Starting Balance",
      value: 500_000,
      color: "text-foreground",
    },
    {
      label: isAr ? "أدنى رصيد (محاكاة)" : "Projected Low (Sim)",
      value: simMinBalance,
      color: simMinBalance < 0 ? "outflow" : simMinBalance < 50_000 ? "text-amber-600" : "inflow",
    },
    {
      label: isAr ? "إجمالي التدفقات (محاكاة)" : "Total Inflows (Sim)",
      value: simTotalInflow,
      color: "inflow",
    },
    {
      label: isAr ? "إجمالي المدفوعات (محاكاة)" : "Total Outflows (Sim)",
      value: simTotalOutflow,
      color: "outflow",
    },
  ];

  return (
    <div dir={dir} className="flex flex-col h-full" data-page-full>
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-card shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold">{t.nav.forecast}</h1>
          {cashZeroDate && (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertTriangle className="h-3 w-3" />
              {isAr ? "تحذير: نقص السيولة" : "Cash shortfall detected"}
            </Badge>
          )}
        </div>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
          <Download className="h-3.5 w-3.5" />
          {isAr ? "تصدير" : "Export"}
        </Button>
      </div>

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b shrink-0">
        {kpis.map((kpi, i) => (
          <div key={i} className="px-5 py-3 border-e last:border-e-0">
            <p className="text-xs text-muted-foreground mb-0.5">{kpi.label}</p>
            <p className={cn("text-base font-semibold tabular-nums", kpi.color)}>
              {formatCurrency(kpi.value, CURRENCY, locale)}
            </p>
          </div>
        ))}
      </div>

      {/* ── Two-column body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Main column: chart + table ── */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Chart */}
          <div className="px-5 pt-4 pb-2 shrink-0">
            {/* Legend */}
            <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-6 border-t-2 border-dashed border-muted-foreground/50" />
                {isAr ? "الأساسي" : "Base"}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-6 border-t-2 border-primary" />
                {isAr ? "المحاكاة" : "Simulated"}
              </span>
            </div>
            <ForecastChart data={simulated} locale={locale} isAr={isAr} />
          </div>

          {/* Data table */}
          <div className="flex-1 overflow-auto border-t">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/60 backdrop-blur border-b">
                <tr>
                  {[
                    isAr ? "التاريخ" : "Date",
                    isAr ? "التدفق (أساسي)" : "Inflow (Base)",
                    isAr ? "التدفق (محاكاة)" : "Inflow (Sim)",
                    isAr ? "المدفوعات (محاكاة)" : "Outflow (Sim)",
                    isAr ? "الرصيد (أساسي)" : "Balance (Base)",
                    isAr ? "الرصيد (محاكاة)" : "Balance (Sim)",
                    isAr ? "الفارق" : "Variance",
                  ].map((h) => (
                    <th key={h} className="px-4 py-2 text-start font-medium text-muted-foreground whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {simulated.map((row, i) => {
                  const variance = row.simulatedBalance - row.baseBalance;
                  const isNegSim = row.simulatedBalance <= 0;
                  return (
                    <tr
                      key={i}
                      className={cn(
                        "hover:bg-muted/30 transition-colors",
                        isNegSim && "bg-red-50/50 dark:bg-red-950/20"
                      )}
                    >
                      <td className="px-4 py-1.5 text-muted-foreground tabular-nums whitespace-nowrap">
                        {formatDate(row.date, locale)}
                      </td>
                      <td className="px-4 py-1.5 inflow tabular-nums">
                        {formatCurrency(row.baseInflow, CURRENCY, locale)}
                      </td>
                      <td className="px-4 py-1.5 inflow tabular-nums">
                        {formatCurrency(row.simulatedInflow, CURRENCY, locale)}
                      </td>
                      <td className="px-4 py-1.5 outflow tabular-nums">
                        {formatCurrency(row.simulatedOutflow, CURRENCY, locale)}
                      </td>
                      <td className="px-4 py-1.5 tabular-nums text-muted-foreground">
                        {formatCurrency(row.baseBalance, CURRENCY, locale)}
                      </td>
                      <td className={cn("px-4 py-1.5 tabular-nums font-semibold", isNegSim ? "outflow" : "text-foreground")}>
                        {formatCurrency(row.simulatedBalance, CURRENCY, locale)}
                        {isNegSim && <AlertTriangle className="inline ms-1 h-3 w-3 text-destructive" />}
                      </td>
                      <td className={cn("px-4 py-1.5 tabular-nums font-medium", variance >= 0 ? "inflow" : "outflow")}>
                        {variance >= 0 ? "+" : ""}{formatCurrency(variance, CURRENCY, locale)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Side panel: Scenario Sandbox ── */}
        <div className="hidden lg:flex flex-col w-80 shrink-0 border-s overflow-y-auto p-4 bg-muted/20">
          <ScenarioSandbox
            params={params}
            setParam={setParam}
            reset={reset}
            cashZeroDate={cashZeroDate}
            isAr={isAr}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}
