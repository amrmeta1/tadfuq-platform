export type Severity = "high" | "medium" | "low";
export type AlertStatus = "open" | "acknowledged" | "resolved";
export type AlertType = "overdue_payment" | "cash_floor" | "unusual_outflow" | "sync_failure" | "payroll" | "fx_exposure";

export interface DunningMetadata {
  clientName: string;
  amount: number;
  currency: string;
  daysOverdue: number;
  phone: string;
  invoiceRef: string;
}

export interface Alert {
  id: string;
  type?: AlertType;
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
  metadata?: DunningMetadata;
}

export type AlertAction = "acknowledge" | "resolve" | "snooze";
