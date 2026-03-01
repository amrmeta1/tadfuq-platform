/**
 * Helpers for comparing scenario vs base values (used in Scenario Planner KPI cards).
 * Kept in lib to avoid exporting non-page symbols from Next.js page files.
 */

export type TrendType = "better" | "worse" | "same";

export function getScenarioVsBaseDiff(
  baseValue: number,
  scenarioValue: number,
  higherIsBetter: boolean
): { diff: number; diffPercent: number; trend: TrendType } {
  const diff = scenarioValue - baseValue;
  const diffPercent =
    baseValue !== 0 ? (diff / Math.abs(baseValue)) * 100 : 0;
  let trend: TrendType = "same";
  if (diff !== 0) {
    trend = higherIsBetter ? (diff > 0 ? "better" : "worse") : (diff < 0 ? "better" : "worse");
  }
  return { diff, diffPercent, trend };
}

const RUNWAY_INFINITE = 999;

export function getScenarioVsBaseDiffRunway(
  baseRunwayMonths: number | null,
  scenarioRunwayMonths: number | null
): { trend: TrendType; labelKey: "same" | "better" | "worse" } {
  const base = baseRunwayMonths ?? RUNWAY_INFINITE;
  const scenario = scenarioRunwayMonths ?? RUNWAY_INFINITE;
  if (base === scenario) return { trend: "same", labelKey: "same" };
  return scenario > base
    ? { trend: "better", labelKey: "better" }
    : { trend: "worse", labelKey: "worse" };
}
