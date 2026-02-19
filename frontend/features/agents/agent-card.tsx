"use client";

import { Activity, TrendingUp, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToggleAgent, useRunAgent } from "./hooks";
import type { Agent, AgentStatus } from "./types";

// ── Config ─────────────────────────────────────────────────────────────────

const ICON_MAP = {
  "activity": Activity,
  "trending-up": TrendingUp,
  "zap": Zap,
} as const;

const ACCENT_MAP: Record<Agent["accent"], string> = {
  blue: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
  violet: "text-violet-600 bg-violet-50 dark:bg-violet-950/40",
  amber: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
};

const STATUS_DOT: Record<AgentStatus, string> = {
  active: "bg-green-500",
  idle: "bg-amber-400",
  error: "bg-red-500",
  disabled: "bg-zinc-400",
};

const STATUS_LABEL: Record<AgentStatus, { en: string; ar: string }> = {
  active: { en: "Active", ar: "نشط" },
  idle: { en: "Idle", ar: "خامل" },
  error: { en: "Error", ar: "خطأ" },
  disabled: { en: "Disabled", ar: "معطّل" },
};

function relativeTime(iso: string, isAr: boolean): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(m / 60);
  if (h > 0) return isAr ? `منذ ${h} ساعة` : `${h}h ago`;
  if (m > 0) return isAr ? `منذ ${m} دقيقة` : `${m}m ago`;
  return isAr ? "الآن" : "just now";
}

function nextRunLabel(iso: string, isAr: boolean): string {
  const diff = new Date(iso).getTime() - Date.now();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(m / 60);
  if (diff <= 0) return isAr ? "قريبًا" : "soon";
  if (h > 0) return isAr ? `خلال ${h} ساعة` : `in ${h}h`;
  return isAr ? `خلال ${m} دقيقة` : `in ${m}m`;
}

// ── Component ──────────────────────────────────────────────────────────────

interface AgentCardProps {
  agent: Agent;
  tenantId?: string;
  isAr: boolean;
}

export function AgentCard({ agent, tenantId, isAr }: AgentCardProps) {
  const { mutate: toggle, isPending: isToggling } = useToggleAgent(tenantId);
  const { mutate: run, isPending: isRunning } = useRunAgent(tenantId);

  const Icon = ICON_MAP[agent.icon_key];
  const accentClass = ACCENT_MAP[agent.accent];
  const statusDot = STATUS_DOT[agent.status];
  const statusLabel = STATUS_LABEL[agent.status];
  const isActive = agent.status === "active";

  return (
    <div className="rounded-md border bg-card flex flex-col gap-0 overflow-hidden hover:shadow-sm transition-shadow">
      {/* ── Card header ── */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-md", accentClass)}>
          <Icon className="h-4.5 w-4.5" />
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 ms-auto">
          <span className="relative flex h-2 w-2 shrink-0">
            {isActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 bg-green-400" />
            )}
            <span className={cn("relative inline-flex h-2 w-2 rounded-full", statusDot)} />
          </span>
          <span className="text-xs text-muted-foreground">
            {isAr ? statusLabel.ar : statusLabel.en}
          </span>
        </div>
      </div>

      {/* ── Name & role ── */}
      <div className="px-4 pb-2">
        <p className="font-semibold text-sm leading-tight">
          {isAr ? agent.name_ar : agent.name_en}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isAr ? agent.role_ar : agent.role_en}
        </p>
      </div>

      {/* ── Description ── */}
      <div className="px-4 pb-3 flex-1">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {isAr ? agent.description_ar : agent.description_en}
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="px-4 py-2.5 border-t grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground/70 mb-0.5">{isAr ? "آخر تشغيل" : "Last run"}</p>
          <p className="font-medium tabular">{relativeTime(agent.last_run_at, isAr)}</p>
        </div>
        <div>
          <p className="text-muted-foreground/70 mb-0.5">{isAr ? "التالي" : "Next run"}</p>
          <p className="font-medium tabular">{nextRunLabel(agent.next_run_at, isAr)}</p>
        </div>
        <div>
          <p className="text-muted-foreground/70 mb-0.5">{isAr ? "إجمالي" : "Total runs"}</p>
          <p className="font-medium tabular">{agent.run_count.toLocaleString()}</p>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="px-4 py-3 border-t flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Switch
            checked={agent.enabled}
            disabled={isToggling}
            onCheckedChange={(v) => toggle({ id: agent.id, enabled: v })}
            aria-label={isAr ? "تفعيل / تعطيل الوكيل" : "Toggle agent"}
          />
          <span className="text-xs text-muted-foreground">
            {agent.enabled
              ? (isAr ? "مفعّل" : "Enabled")
              : (isAr ? "معطّل" : "Disabled")}
          </span>
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2.5 text-xs gap-1.5"
          disabled={!agent.enabled || isRunning}
          onClick={() => run(agent.id)}
        >
          <RefreshCw className={cn("h-3 w-3", isRunning && "animate-spin")} />
          {isRunning
            ? (isAr ? "جارٍ..." : "Running…")
            : (isAr ? "تشغيل" : "Run now")}
        </Button>
      </div>
    </div>
  );
}
