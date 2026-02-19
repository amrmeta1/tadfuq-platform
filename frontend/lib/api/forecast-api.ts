import { tenantApi } from "./client";
import { MOCKS_ENABLED, getMockForecast } from "./mock-data";

export interface ForecastPoint {
  date: string;
  projected: number;
  upper: number;
  lower: number;
}

export interface ForecastData {
  range: string;
  scenario: string;
  currency: string;
  points: ForecastPoint[];
}

export interface ForecastResponse {
  data: ForecastData;
}

export interface ForecastAssumptions {
  collection_delay_days: number;
  cash_floor_threshold: number;
  monthly_fixed_expenses: number;
}

export async function getForecast(
  tenantId: string,
  range: string = "13w",
  scenario: string = "base"
): Promise<ForecastResponse> {
  if (MOCKS_ENABLED) return getMockForecast(range, scenario) as ForecastResponse;
  return tenantApi.get(`/tenants/${tenantId}/forecast`, { range, scenario });
}

export async function saveForecastAssumptions(
  tenantId: string,
  assumptions: ForecastAssumptions
): Promise<void> {
  if (MOCKS_ENABLED) return;
  return tenantApi.post(`/tenants/${tenantId}/forecast/assumptions`, assumptions);
}
