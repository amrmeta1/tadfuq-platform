import { tenantApi } from "./client";
import { mockInsights, type InsightsData } from "@/lib/mocks/insights";

export type { Insight, InsightsData } from "@/lib/mocks/insights";

interface InsightsResponse {
  data: InsightsData;
}

export async function getInsights(tenantId: string): Promise<InsightsData> {
  try {
    const response = await tenantApi.get<InsightsResponse>(
      `/tenants/${tenantId}/insights`
    );
    return response.data;
  } catch (error) {
    console.warn("Failed to fetch insights, using mock data:", error);
    return mockInsights;
  }
}
