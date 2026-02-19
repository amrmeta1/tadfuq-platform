import { tenantApi } from "./client";
import { MOCKS_ENABLED, getMockAgentsStatus, getMockDailyBrief } from "./mock-data";

export interface AgentStatus {
  id: string;
  name_en: string;
  name_ar: string;
  role_en: string;
  role_ar: string;
  description_en: string;
  description_ar: string;
  status: "active" | "inactive";
  last_run: string;
  next_run: string | null;
}

export interface BriefItem {
  icon: string;
  text_en: string;
  text_ar: string;
}

export interface DailyBrief {
  date: string;
  greeting_en: string;
  greeting_ar: string;
  items: BriefItem[];
}

export async function getAgentsStatus(
  tenantId: string
): Promise<{ data: AgentStatus[] }> {
  if (MOCKS_ENABLED) return getMockAgentsStatus();
  return tenantApi.get(`/tenants/${tenantId}/agents/status`);
}

export async function getDailyBrief(
  tenantId: string
): Promise<{ data: DailyBrief }> {
  if (MOCKS_ENABLED) return getMockDailyBrief();
  return tenantApi.get(`/tenants/${tenantId}/brief/latest`);
}
