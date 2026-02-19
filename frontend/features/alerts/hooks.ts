"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAlerts, performAlertAction } from "./mock-api";
import type { Alert, AlertAction, AlertStatus } from "./types";

const QUERY_KEY = ["alerts"] as const;

function actionToStatus(action: AlertAction): AlertStatus | null {
  if (action === "acknowledge") return "acknowledged";
  if (action === "resolve") return "resolved";
  return null; // snooze keeps current status
}

export function useAlerts(tenantId?: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, tenantId],
    queryFn: fetchAlerts,
    staleTime: 30_000,
  });
}

export function useAlertAction(tenantId?: string) {
  const qc = useQueryClient();
  const key = [...QUERY_KEY, tenantId];

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: AlertAction }) =>
      performAlertAction(id, action),

    // ── Optimistic update ──────────────────────────────────────────────────
    onMutate: async ({ id, action }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Alert[]>(key);

      const newStatus = actionToStatus(action);
      if (newStatus) {
        qc.setQueryData<Alert[]>(key, (old) =>
          old?.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
      }

      return { previous };
    },

    // ── Roll back on error ─────────────────────────────────────────────────
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData<Alert[]>(key, ctx.previous);
      }
    },

    // ── Sync server truth after settle ────────────────────────────────────
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}
