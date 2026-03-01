"use client";

import { useState, useEffect, useCallback } from "react";
import { getForecastCurrent, type ForecastResult } from "@/lib/api/forecast";

interface UseForecastReturn {
  data: ForecastResult | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * React hook to fetch 13-week cash forecast for a tenant.
 * Automatically fetches on mount and when tenantId changes.
 * Returns empty forecast if no transaction data exists.
 */
export function useForecast(tenantId: string | null): UseForecastReturn {
  const [data, setData] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!tenantId) {
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getForecastCurrent(tenantId);
      setData(result);
    } catch (e) {
      setError(e as Error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
