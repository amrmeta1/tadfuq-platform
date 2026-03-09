"use client";

import { useQuery } from "@tanstack/react-query";
import { getInsights, type InsightsData } from "@/lib/api/insights-api";

interface UseInsightsOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useInsights(
  tenantId: string | null,
  options: UseInsightsOptions = {}
) {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  return useQuery<InsightsData>({
    queryKey: ["insights", tenantId],
    queryFn: () => getInsights(tenantId!),
    enabled: enabled && !!tenantId,
    staleTime,
  });
}
