export type Severity = "high" | "medium" | "low";
export type AlertStatus = "open" | "acknowledged" | "resolved";

export interface Alert {
  id: string;
  severity: Severity;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  why_en: string;
  why_ar: string;
  status: AlertStatus;
  created_at: string;
  related_amount?: number;
}

export type AlertAction = "acknowledge" | "resolve" | "snooze";
