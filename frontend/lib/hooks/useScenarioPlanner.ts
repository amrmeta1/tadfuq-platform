"use client";

import { useState, useMemo, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ScenarioAssumptions {
  revenueGrowthPct: number;   // -20 to +50
  costReductionPct: number;   // 0 to +40
  collectionSpeedDays: number; // 15 to 60
}

export interface ScenarioDerived {
  adjustedRevenue: number;
  adjustedBurn: number;
  netMonthlyFlow: number;
  projectedRunwayMonths: number | null; // null = infinite (profitable)
  projectedCashIn12Months: number;
  chartData: { month: string; cashBalance: number }[];
}

export interface ScenarioPreset {
  key: "worst" | "base" | "best";
  label: string;
  emoji: string;
  assumptions: ScenarioAssumptions;
}

export interface UseScenarioPlannerReturn {
  assumptions: ScenarioAssumptions;
  derived: ScenarioDerived;
  setAssumption: <K extends keyof ScenarioAssumptions>(key: K, value: ScenarioAssumptions[K]) => void;
  applyPreset: (preset: ScenarioPreset) => void;
  presets: ScenarioPreset[];
  baselineRevenue: number;
  baselineBurn: number;
  currentCashBalance: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CURRENT_CASH_BALANCE = 1_200_000;
const MONTHLY_REVENUE      = 350_000;
const MONTHLY_BURN_RATE    = 420_000;

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const BASE_ASSUMPTIONS: ScenarioAssumptions = {
  revenueGrowthPct: 0,
  costReductionPct: 0,
  collectionSpeedDays: 30,
};

export const PRESETS: ScenarioPreset[] = [
  {
    key: "worst",
    label: "Worst Case",
    emoji: "📉",
    assumptions: { revenueGrowthPct: -15, costReductionPct: 0, collectionSpeedDays: 55 },
  },
  {
    key: "base",
    label: "Base Case",
    emoji: "📊",
    assumptions: { revenueGrowthPct: 0, costReductionPct: 0, collectionSpeedDays: 30 },
  },
  {
    key: "best",
    label: "Best Case",
    emoji: "🚀",
    assumptions: { revenueGrowthPct: 30, costReductionPct: 15, collectionSpeedDays: 20 },
  },
];

// ── Derived calculation ───────────────────────────────────────────────────────

function calcDerived(assumptions: ScenarioAssumptions): ScenarioDerived {
  const { revenueGrowthPct, costReductionPct } = assumptions;

  const adjustedRevenue = MONTHLY_REVENUE * (1 + revenueGrowthPct / 100);
  const adjustedBurn    = MONTHLY_BURN_RATE * (1 - costReductionPct / 100);
  const netMonthlyFlow  = adjustedRevenue - adjustedBurn;

  const projectedRunwayMonths =
    netMonthlyFlow >= 0
      ? null // infinite / profitable
      : CURRENT_CASH_BALANCE / Math.abs(netMonthlyFlow);

  const projectedCashIn12Months = CURRENT_CASH_BALANCE + netMonthlyFlow * 12;

  // 12-month chart data
  const chartData = MONTH_NAMES.map((month, i) => ({
    month,
    cashBalance: Math.round(CURRENT_CASH_BALANCE + netMonthlyFlow * (i + 1)),
  }));

  return {
    adjustedRevenue,
    adjustedBurn,
    netMonthlyFlow,
    projectedRunwayMonths,
    projectedCashIn12Months,
    chartData,
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useScenarioPlanner(): UseScenarioPlannerReturn {
  const [assumptions, setAssumptions] = useState<ScenarioAssumptions>(BASE_ASSUMPTIONS);

  const derived = useMemo(() => calcDerived(assumptions), [assumptions]);

  const setAssumption = useCallback(
    <K extends keyof ScenarioAssumptions>(key: K, value: ScenarioAssumptions[K]) => {
      setAssumptions((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const applyPreset = useCallback((preset: ScenarioPreset) => {
    setAssumptions(preset.assumptions);
  }, []);

  return {
    assumptions,
    derived,
    setAssumption,
    applyPreset,
    presets: PRESETS,
    baselineRevenue: MONTHLY_REVENUE,
    baselineBurn: MONTHLY_BURN_RATE,
    currentCashBalance: CURRENT_CASH_BALANCE,
  };
}
