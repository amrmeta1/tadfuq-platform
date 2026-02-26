"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { CurrencyCode } from "@/contexts/CurrencyContext";
import { FX_RATES } from "@/contexts/CurrencyContext";
import { useTenant } from "@/lib/hooks/use-tenant";

// ── Entity type (balance in native currency) ────────────────────────────────

export interface AppEntity {
  id: string;
  flag: string;
  nameEn: string;
  nameAr: string;
  /** Balance in entity's native currency */
  balanceNative: number;
  currency: CurrencyCode;
  /** When set, entity is shown only for this tenant (multi-tenant). Omit = show for all. */
  tenantId?: string;
}

/** Convert entity balance to SAR (for display in selected currency via CurrencyContext) */
export function entityBalanceInSAR(entity: AppEntity): number {
  // FX_RATES[code] = units of that currency per 1 SAR → 1 SAR = FX_RATES[code] units
  // So amountInSAR = amountNative / FX_RATES[currency]
  return entity.balanceNative / FX_RATES[entity.currency];
}

export const ENTITIES: AppEntity[] = [
  { id: "hq", flag: "🇸🇦", nameEn: "HQ Hub", nameAr: "المركز الرئيسي", balanceNative: 8_600_000, currency: "SAR" },
  { id: "riyadh", flag: "🇸🇦", nameEn: "Riyadh Branch", nameAr: "فرع الرياض", balanceNative: 3_200_000, currency: "SAR" },
  { id: "jeddah", flag: "🇸🇦", nameEn: "Jeddah Branch", nameAr: "فرع جدة", balanceNative: 2_450_000, currency: "SAR" },
  { id: "dubai", flag: "🇦🇪", nameEn: "Dubai Branch", nameAr: "فرع دبي", balanceNative: 4_120_000, currency: "AED" },
  { id: "doha", flag: "🇶🇦", nameEn: "Doha Branch", nameAr: "فرع الدوحة", balanceNative: 1_890_000, currency: "QAR" },
];

export type SelectedEntityId = string | "consolidated";

// ── Context ───────────────────────────────────────────────────────────────────

interface EntityContextValue {
  entities: AppEntity[];
  selectedId: SelectedEntityId;
  setSelectedEntity: (id: SelectedEntityId) => void;
  selectedEntity: AppEntity | null;
  /** Total group cash in SAR (sum of all entities) */
  totalGroupSAR: number;
}

const EntityContext = createContext<EntityContextValue | null>(null);

const STORAGE_KEY = "tadfuq_selected_entity";

/** Entities visible for current tenant only (tenant_id filter for multi-tenant) */
function entitiesForTenant(all: AppEntity[], tenantId: string | null): AppEntity[] {
  if (!tenantId) return all;
  return all.filter((e) => !e.tenantId || e.tenantId === tenantId);
}

export function EntityProvider({ children }: { children: React.ReactNode }) {
  const { currentTenant } = useTenant();
  const [selectedId, setSelectedIdState] = useState<SelectedEntityId>("hq");

  const entities = useMemo(
    () => entitiesForTenant(ENTITIES, currentTenant?.id ?? null),
    [currentTenant?.id],
  );

  const setSelectedEntity = useCallback((id: SelectedEntityId) => {
    setSelectedIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch { /* ignore */ }
  }, []);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as SelectedEntityId | null;
      if (saved != null && (saved === "consolidated" || entities.some((e) => e.id === saved))) {
        setSelectedIdState(saved);
      } else if (entities.length > 0) {
        setSelectedIdState(entities[0].id);
      }
    } catch { /* ignore */ }
  }, [entities]);

  const selectedEntity = useMemo(
    () => (selectedId === "consolidated" ? null : entities.find((e) => e.id === selectedId) ?? null),
    [selectedId, entities],
  );

  const totalGroupSAR = useMemo(
    () => entities.reduce((sum, e) => sum + entityBalanceInSAR(e), 0),
    [entities],
  );

  const value: EntityContextValue = useMemo(
    () => ({
      entities,
      selectedId,
      setSelectedEntity,
      selectedEntity,
      totalGroupSAR,
    }),
    [entities, selectedId, setSelectedEntity, selectedEntity, totalGroupSAR],
  );

  return (
    <EntityContext.Provider value={value}>
      {children}
    </EntityContext.Provider>
  );
}

export function useEntity() {
  const ctx = useContext(EntityContext);
  if (!ctx) throw new Error("useEntity must be used within EntityProvider");
  return ctx;
}
