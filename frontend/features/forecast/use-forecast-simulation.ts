"use client";

import { useMemo, useState } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

export interface BaseDay {
  date: string;        // ISO "YYYY-MM-DD"
  label: string;       // Short display label e.g. "Feb 20"
  baseInflow: number;
  baseOutflow: number;
  baseBalance: number;
}

export interface SimulatedDay extends BaseDay {
  simulatedInflow: number;
  simulatedOutflow: number;
  simulatedBalance: number;
}

export interface SimulationParams {
  /** Days to shift inflows forward (0–60) */
  collectionDelay: number;
  /** Percentage reduction applied to every inflow (0–50) */
  revenueDrop: number;
  /** Percentage increase applied to every outflow (0–50) */
  expenseSurge: number;
}

// ── Baseline generator ──────────────────────────────────────────────────────

const STARTING_BALANCE = 500_000; // SAR
const DAYS = 60;

/**
 * Generates a deterministic 60-day baseline using a seeded pseudo-random
 * approach so the chart doesn't jump on every render.
 */
function generateBaseline(): BaseDay[] {
  const days: BaseDay[] = [];
  let balance = STARTING_BALANCE;
  const now = new Date();

  // Simple LCG seed so values are stable across renders
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  for (let i = 0; i < DAYS; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);

    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    // Weekday-aware: lower activity on weekends
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const inflow = isWeekend
      ? Math.round(rand() * 15_000 + 5_000)
      : Math.round(rand() * 80_000 + 40_000);
    const outflow = isWeekend
      ? Math.round(rand() * 8_000 + 2_000)
      : Math.round(rand() * 55_000 + 25_000);

    balance = balance + inflow - outflow;

    days.push({ date: dateStr, label, baseInflow: inflow, baseOutflow: outflow, baseBalance: balance });
  }

  return days;
}

// Compute once at module level — stable across re-renders
const BASELINE: BaseDay[] = generateBaseline();

// ── Simulation engine ───────────────────────────────────────────────────────

/**
 * Applies the three scenario variables to the baseline and returns a new
 * array of SimulatedDay objects. Runs synchronously inside useMemo.
 *
 * Rules:
 *  - collectionDelay: inflow on day N is moved to day N+delay.
 *    Days that lose their inflow get 0; days that gain get the shifted value.
 *  - revenueDrop: reduces each (already-shifted) simulatedInflow by revenueDrop%.
 *  - expenseSurge: increases each baseOutflow by expenseSurge%.
 */
function simulate(params: SimulationParams): SimulatedDay[] {
  const { collectionDelay, revenueDrop, expenseSurge } = params;

  // Step 1 — build shifted inflow array
  const shiftedInflows: number[] = new Array(DAYS).fill(0);
  for (let i = 0; i < DAYS; i++) {
    const targetDay = i + collectionDelay;
    if (targetDay < DAYS) {
      shiftedInflows[targetDay] += BASELINE[i].baseInflow;
    }
    // inflows shifted beyond day 60 are simply lost (conservative)
  }

  // Step 2 — apply revenue drop & expense surge, then accumulate balance
  const result: SimulatedDay[] = [];
  let balance = STARTING_BALANCE;

  for (let i = 0; i < DAYS; i++) {
    const base = BASELINE[i];
    const simInflow = Math.round(shiftedInflows[i] * (1 - revenueDrop / 100));
    const simOutflow = Math.round(base.baseOutflow * (1 + expenseSurge / 100));
    balance = balance + simInflow - simOutflow;

    result.push({
      ...base,
      simulatedInflow: simInflow,
      simulatedOutflow: simOutflow,
      simulatedBalance: balance,
    });
  }

  return result;
}

// ── Hook ────────────────────────────────────────────────────────────────────

const DEFAULT_PARAMS: SimulationParams = {
  collectionDelay: 0,
  revenueDrop: 0,
  expenseSurge: 0,
};

export function useForecastSimulation() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);

  /** Lightning-fast: only re-runs when params change */
  const simulated = useMemo(() => simulate(params), [params]);

  /** First day where simulatedBalance <= 0, or null if never */
  const cashZeroDate = useMemo<string | null>(() => {
    const hit = simulated.find((d) => d.simulatedBalance <= 0);
    return hit ? hit.date : null;
  }, [simulated]);

  const reset = () => setParams(DEFAULT_PARAMS);

  const setParam = <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) =>
    setParams((prev) => ({ ...prev, [key]: value }));

  return {
    baseline: BASELINE,
    simulated,
    params,
    setParam,
    reset,
    cashZeroDate,
  };
}
