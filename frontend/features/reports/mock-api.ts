import type { Report, GenerateFormValues } from "./types";

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export const MOCK_REPORTS: Report[] = [
  {
    id: "r1",
    type: "monthly",
    status: "ready",
    title_en: "Cash Flow Report — January 2025",
    title_ar: "تقرير التدفق النقدي — يناير ٢٠٢٥",
    period: "2025-01",
    generated_at: "2025-02-01T08:00:00Z",
    size_kb: 142,
    include_ai: true,
    summary: {
      opening_balance: 720_000,
      closing_balance: 845_000,
      total_inflows: 1_240_000,
      total_outflows: 1_115_000,
      net_cash_flow: 125_000,
    },
  },
  {
    id: "r2",
    type: "monthly",
    status: "ready",
    title_en: "Cash Flow Report — December 2024",
    title_ar: "تقرير التدفق النقدي — ديسمبر ٢٠٢٤",
    period: "2024-12",
    generated_at: "2025-01-02T08:00:00Z",
    size_kb: 138,
    include_ai: true,
    summary: {
      opening_balance: 680_000,
      closing_balance: 720_000,
      total_inflows: 1_180_000,
      total_outflows: 1_140_000,
      net_cash_flow: 40_000,
    },
  },
  {
    id: "r3",
    type: "quarterly",
    status: "ready",
    title_en: "Q4 2024 Cash Flow Report",
    title_ar: "تقرير التدفق النقدي — الربع الرابع ٢٠٢٤",
    period: "2024-Q4",
    generated_at: "2025-01-05T09:00:00Z",
    size_kb: 284,
    include_ai: false,
    summary: {
      opening_balance: 590_000,
      closing_balance: 720_000,
      total_inflows: 3_540_000,
      total_outflows: 3_410_000,
      net_cash_flow: 130_000,
    },
  },
  {
    id: "r4",
    type: "monthly",
    status: "ready",
    title_en: "Cash Flow Report — November 2024",
    title_ar: "تقرير التدفق النقدي — نوفمبر ٢٠٢٤",
    period: "2024-11",
    generated_at: "2024-12-02T08:00:00Z",
    size_kb: 129,
    include_ai: false,
    summary: {
      opening_balance: 640_000,
      closing_balance: 680_000,
      total_inflows: 1_090_000,
      total_outflows: 1_050_000,
      net_cash_flow: 40_000,
    },
  },
];

const PERIOD_LABELS: Record<string, { en: string; ar: string }> = {
  "2025-01": { en: "January 2025", ar: "يناير ٢٠٢٥" },
  "2024-12": { en: "December 2024", ar: "ديسمبر ٢٠٢٤" },
  "2024-11": { en: "November 2024", ar: "نوفمبر ٢٠٢٤" },
  "2024-10": { en: "October 2024", ar: "أكتوبر ٢٠٢٤" },
  "2024-Q4": { en: "Q4 2024", ar: "الربع الرابع ٢٠٢٤" },
  "2024-Q3": { en: "Q3 2024", ar: "الربع الثالث ٢٠٢٤" },
};

export { PERIOD_LABELS };

export async function fetchReports(): Promise<Report[]> {
  await delay();
  return MOCK_REPORTS;
}

export async function apiGenerateReport(values: GenerateFormValues): Promise<Report> {
  await delay(1500);
  const label = PERIOD_LABELS[values.period] ?? { en: values.period, ar: values.period };
  const isQ = values.type === "quarterly";
  return {
    id: `r-${Date.now()}`,
    type: values.type,
    status: "ready",
    title_en: isQ ? `${label.en} Cash Flow Report` : `Cash Flow Report — ${label.en}`,
    title_ar: isQ ? `تقرير التدفق النقدي — ${label.ar}` : `تقرير التدفق النقدي — ${label.ar}`,
    period: values.period,
    generated_at: new Date().toISOString(),
    size_kb: 135,
    include_ai: values.include_ai,
    summary: {
      opening_balance: 720_000,
      closing_balance: 845_000,
      total_inflows: 1_240_000,
      total_outflows: 1_115_000,
      net_cash_flow: 125_000,
    },
  };
}
