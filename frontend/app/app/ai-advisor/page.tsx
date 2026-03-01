"use client";

import { useRef, useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useToast } from "@/components/ui/toast";
import { useScenario } from "@/contexts/ScenarioContext";
import { AIDailyBrief } from "@/components/agent/AIDailyBrief";
import { ForecastSnapshot } from "@/components/agent/ForecastSnapshot";
import { TreasuryChat } from "@/components/agent/TreasuryChat";
import { ActiveCasesPanel } from "@/components/agent/ActiveCasesPanel";
import { CaseDrawer } from "@/components/agent/CaseDrawer";
import { SimulationModal } from "@/components/agent/SimulationModal";
import type { AgentCase } from "@/components/agent/ActiveCasesPanel";
import type { Scenario } from "@/contexts/ScenarioContext";
import { getTenantId } from "@/lib/api/client";
import { getActiveAlerts } from "@/lib/api/alerts-api";
import type { Alert } from "@/lib/api/alerts-api";

export default function AIAdvisorPage() {
  const { dir, locale } = useI18n();
  const { toast } = useToast();
  const { scenarios, activeScenario, addScenario } = useScenario();
  const casesSectionRef = useRef<HTMLDivElement>(null);
  const [selectedCase, setSelectedCase] = useState<AgentCase | null>(null);
  const [simulationOpen, setSimulationOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const tenantId = getTenantId();

  useEffect(() => {
    if (!tenantId) return;
    
    setAlertsLoading(true);
    getActiveAlerts(tenantId)
      .then(setAlerts)
      .catch((err) => {
        console.error("Failed to load alerts:", err);
        setAlerts([]);
      })
      .finally(() => setAlertsLoading(false));
  }, [tenantId]);

  const handleOpenCases = () => {
    casesSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleApplyScenario = (scenario: Scenario) => {
    const isAr = locale === "ar";
    if (scenarios.length >= 3) {
      toast({
        title: isAr ? "الحد الأقصى للسيناريوهات" : "Maximum scenarios",
        description: isAr ? "يمكنك إضافة 3 سيناريوهات كحد أقصى. احذف واحداً للمتابعة." : "You can add up to 3 scenarios. Remove one to continue.",
        variant: "destructive",
      });
      return;
    }
    addScenario(scenario);
    toast({
      title: isAr ? "تمت إضافة السيناريو" : "Scenario added",
      description: isAr
        ? `فرق السيولة: ${scenario.deltaCash >= 0 ? "+" : ""}${scenario.deltaCash.toLocaleString("en")} · ${scenario.riskLevel}`
        : `Delta: ${scenario.deltaCash >= 0 ? "+" : ""}${scenario.deltaCash.toLocaleString("en")} · ${scenario.riskLevel}`,
      variant: "success",
    });
  };

  return (
    <div dir={dir} className="min-h-full w-full" data-page-content>
      <div className="max-w-6xl w-full mx-auto px-4 py-8 md:px-6 md:py-10 flex flex-col gap-8">
        {scenarios.length > 0 && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-sm text-muted-foreground">
            {locale === "ar"
              ? `${scenarios.length} سيناريو نشط${activeScenario ? ` · الأساس للمقارنة: فرق ${activeScenario.deltaCash >= 0 ? "+" : ""}${activeScenario.deltaCash.toLocaleString("en")} · ${activeScenario.riskLevel}` : ""}`
              : `${scenarios.length} scenario(s) active${activeScenario ? ` · Primary: delta ${activeScenario.deltaCash >= 0 ? "+" : ""}${activeScenario.deltaCash.toLocaleString("en")} · ${activeScenario.riskLevel}` : ""}`}
          </div>
        )}
        <AIDailyBrief
          onOpenCases={handleOpenCases}
          onOpenSimulation={() => setSimulationOpen(true)}
        />
        <ForecastSnapshot tenantId={tenantId} />
        <div ref={casesSectionRef}>
          <ActiveCasesPanel
            alerts={alerts}
            loading={alertsLoading}
            selectedCase={selectedCase}
            onSelectCase={setSelectedCase}
          />
        </div>
        <TreasuryChat />
      </div>
      <CaseDrawer
        open={!!selectedCase}
        case={selectedCase}
        onClose={() => setSelectedCase(null)}
        onSimulate={() => {
          setSelectedCase(null);
          setSimulationOpen(true);
        }}
      />
      <SimulationModal
        open={simulationOpen}
        onClose={() => setSimulationOpen(false)}
        onApply={handleApplyScenario}
      />
    </div>
  );
}
