import type { LucideIcon } from "lucide-react";

export type AgentStatus = "active" | "idle" | "error" | "disabled";

export type BriefItemType = "insight" | "alert" | "forecast" | "action";

export interface Agent {
  id: string;
  name_en: string;
  name_ar: string;
  role_en: string;
  role_ar: string;
  description_en: string;
  description_ar: string;
  status: AgentStatus;
  enabled: boolean;
  last_run_at: string;
  next_run_at: string;
  run_count: number;
  /** Icon key — resolved in the component layer, not stored here */
  icon_key: "activity" | "trending-up" | "zap";
  accent: "blue" | "violet" | "amber";
}

export interface BriefItem {
  id: string;
  time: string;           // "07:02"
  agent_id: string;
  agent_name_en: string;
  agent_name_ar: string;
  type: BriefItemType;
  message_en: string;
  message_ar: string;
}
