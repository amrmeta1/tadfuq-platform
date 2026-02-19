export type ReportType = "monthly" | "quarterly";
export type ReportStatus = "ready" | "generating" | "failed";

export interface ReportSummary {
  opening_balance: number;
  closing_balance: number;
  total_inflows: number;
  total_outflows: number;
  net_cash_flow: number;
}

export interface Report {
  id: string;
  type: ReportType;
  status: ReportStatus;
  title_en: string;
  title_ar: string;
  period: string;       // "2025-01" | "2024-Q4"
  generated_at: string;
  size_kb: number;
  include_ai: boolean;
  summary: ReportSummary;
}

export interface GenerateFormValues {
  period: string;
  type: ReportType;
  include_ai: boolean;
}
