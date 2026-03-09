"use client";

import { useQuery } from "@tanstack/react-query";
import { getCashStory, type CashStoryData } from "@/lib/api/cash-story-api";

interface UseCashStoryOptions {
  enabled?: boolean;
  staleTime?: number;
}

/**
 * React Query hook to fetch AI-generated cash story.
 * Provides automatic caching, background refetching, and optimistic updates.
 */
export function useCashStory(
  tenantId: string | null,
  options: UseCashStoryOptions = {}
) {
  const {
    enabled = true,
    staleTime = 5 * 60_000, // 5 minutes
  } = options;

  return useQuery<CashStoryData, Error>({
    queryKey: ["cash-story", tenantId],
    queryFn: () => {
      if (!tenantId) {
        throw new Error("Tenant ID is required");
      }
      return getCashStory(tenantId);
    },
    enabled: enabled && !!tenantId,
    staleTime,
    gcTime: 10 * 60_000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
