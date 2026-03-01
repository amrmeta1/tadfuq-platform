"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

// ── Scenario type ────────────────────────────────────────────────────────────

export interface Scenario {
  id: string;
  type: "delay_payment" | "split_payment" | "accelerate_receivable";
  deltaCash: number;
  newForecast: number[];
  riskLevel: string;
  confidence: number;
}

const MAX_SCENARIOS = 3;

// ── Context ───────────────────────────────────────────────────────────────────

interface ScenarioContextValue {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  activeScenario: Scenario | null;
  addScenario: (scenario: Scenario) => void;
  removeScenario: (id: string) => void;
  setActiveScenario: (id: string | null) => void;
  clearAllScenarios: () => void;
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const activeScenario = useMemo(
    () => scenarios.find((s) => s.id === activeScenarioId) ?? null,
    [scenarios, activeScenarioId]
  );

  const addScenario = useCallback((scenario: Scenario) => {
    setScenarios((prev) => {
      if (prev.length >= MAX_SCENARIOS) return prev;
      setActiveScenarioId((id) => (id === null ? scenario.id : id));
      return [...prev, scenario];
    });
  }, []);

  const removeScenario = useCallback((id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
    setActiveScenarioId((prev) => (prev === id ? null : prev));
  }, []);

  const setActiveScenario = useCallback((id: string | null) => {
    setActiveScenarioId(id);
  }, []);

  const clearAllScenarios = useCallback(() => {
    setScenarios([]);
    setActiveScenarioId(null);
  }, []);

  const value: ScenarioContextValue = useMemo(
    () => ({
      scenarios,
      activeScenarioId,
      activeScenario,
      addScenario,
      removeScenario,
      setActiveScenario,
      clearAllScenarios,
    }),
    [
      scenarios,
      activeScenarioId,
      activeScenario,
      addScenario,
      removeScenario,
      setActiveScenario,
      clearAllScenarios,
    ]
  );

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error("useScenario must be used within ScenarioProvider");
  return ctx;
}
