"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReports, apiGenerateReport } from "./mock-api";
import type { Report, GenerateFormValues } from "./types";

const REPORTS_KEY = ["reports"] as const;

export function useReports(tenantId?: string) {
  return useQuery({
    queryKey: [...REPORTS_KEY, tenantId],
    queryFn: fetchReports,
    staleTime: 60_000,
  });
}

export function useGenerateReport(tenantId?: string) {
  const qc = useQueryClient();
  const key = [...REPORTS_KEY, tenantId];

  return useMutation({
    mutationFn: (values: GenerateFormValues) => apiGenerateReport(values),

    // Optimistic: insert a "generating" placeholder immediately
    onMutate: async (values) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Report[]>(key);

      const placeholder: Report = {
        id: `optimistic-${Date.now()}`,
        type: values.type,
        status: "generating",
        title_en: `Generating report for ${values.period}…`,
        title_ar: `جارٍ إنشاء تقرير ${values.period}…`,
        period: values.period,
        generated_at: new Date().toISOString(),
        size_kb: 0,
        include_ai: values.include_ai,
        summary: {
          opening_balance: 0,
          closing_balance: 0,
          total_inflows: 0,
          total_outflows: 0,
          net_cash_flow: 0,
        },
      };

      qc.setQueryData<Report[]>(key, (old) => [placeholder, ...(old ?? [])]);
      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData<Report[]>(key, ctx.previous);
    },

    // Replace placeholder with real data on success
    onSuccess: (newReport) => {
      qc.setQueryData<Report[]>(key, (old) =>
        old?.map((r) => (r.status === "generating" ? newReport : r)) ?? [newReport]
      );
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}
