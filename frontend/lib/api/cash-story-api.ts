import { tenantApi } from "./client";

export interface CashDriver {
  name: string;
  impact: number;
  type: "inflow" | "outflow";
}

export interface CashStoryData {
  summary: string;
  drivers: CashDriver[];
  risk_level: "low" | "medium" | "high";
  confidence: number;
  generated_at: string;
}

export interface CashStoryResponse {
  data: CashStoryData;
}

export async function getCashStory(tenantId: string): Promise<CashStoryData> {
  const response = await tenantApi.get<CashStoryResponse>(
    `/tenants/${tenantId}/cash-story`
  );
  return response.data;
}
