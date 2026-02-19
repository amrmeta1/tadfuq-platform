"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAgents,
  fetchBrief,
  apiToggleAgent,
  apiRunAgent,
} from "./mock-api";
import type { Agent, BriefItem, AgentStatus } from "./types";

const AGENTS_KEY = ["agents"] as const;
const BRIEF_KEY = ["brief"] as const;

// ── Read hooks ─────────────────────────────────────────────────────────────

export function useAgents(tenantId?: string) {
  return useQuery({
    queryKey: [...AGENTS_KEY, tenantId],
    queryFn: fetchAgents,
    staleTime: 60_000,
  });
}

export function useBriefFeed(tenantId?: string) {
  return useQuery({
    queryKey: [...BRIEF_KEY, tenantId],
    queryFn: fetchBrief,
    staleTime: 300_000,
  });
}

// ── Toggle agent (optimistic) ──────────────────────────────────────────────

export function useToggleAgent(tenantId?: string) {
  const qc = useQueryClient();
  const key = [...AGENTS_KEY, tenantId];

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiToggleAgent(id, enabled),

    onMutate: async ({ id, enabled }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Agent[]>(key);

      const newStatus: AgentStatus = enabled ? "idle" : "disabled";
      qc.setQueryData<Agent[]>(key, (old) =>
        old?.map((a) =>
          a.id === id ? { ...a, enabled, status: newStatus } : a
        )
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData<Agent[]>(key, ctx.previous);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}

// ── Manual run (optimistic last_run_at + run_count) ────────────────────────

export function useRunAgent(tenantId?: string) {
  const qc = useQueryClient();
  const key = [...AGENTS_KEY, tenantId];

  return useMutation({
    mutationFn: (id: string) => apiRunAgent(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Agent[]>(key);

      qc.setQueryData<Agent[]>(key, (old) =>
        old?.map((a) =>
          a.id === id
            ? {
                ...a,
                status: "active" as AgentStatus,
                last_run_at: new Date().toISOString(),
                run_count: a.run_count + 1,
              }
            : a
        )
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData<Agent[]>(key, ctx.previous);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}
