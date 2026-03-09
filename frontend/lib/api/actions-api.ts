import { tenantApi } from "./client";

export interface TreasuryAction {
  type: string;
  category: string;
  title: string;
  description: string;
  impact: number;
  confidence: number;
  currency: string;
}

export interface ActionsData {
  actions: TreasuryAction[];
}

export interface ActionsResponse {
  data: ActionsData;
}

export async function fetchRecommendedActions(
  tenantId: string
): Promise<ActionsData> {
  const response = await tenantApi.get<ActionsResponse>(
    `/tenants/${tenantId}/ai/actions`
  );
  return response.data;
}
