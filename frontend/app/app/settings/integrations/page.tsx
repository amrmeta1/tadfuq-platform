"use client";

import { useState } from "react";
import {
  Plug,
  Building2,
  BookOpen,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useCompany } from "@/contexts/CompanyContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Integration {
  key: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ReactNode;
  interactive?: boolean;
}

// ── Data ───────────────────────────────────────────────────────────────────────

const BANK_INTEGRATIONS: Integration[] = [
  {
    key: "qnb",
    name: "QNB",
    nameAr: "بنك قطر الوطني",
    description: "Qatar National Bank — Open Banking API",
    descriptionAr: "بنك قطر الوطني — واجهة Open Banking",
    icon: <Building2 className="h-6 w-6 text-indigo-600" />,
    interactive: true,
  },
  {
    key: "alrajhi",
    name: "Al Rajhi Bank",
    nameAr: "مصرف الراجحي",
    description: "Al Rajhi Bank — Open Banking API",
    descriptionAr: "مصرف الراجحي — واجهة Open Banking",
    icon: <Building2 className="h-6 w-6 text-emerald-600" />,
  },
  {
    key: "emiratesnbd",
    name: "Emirates NBD",
    nameAr: "بنك الإمارات دبي الوطني",
    description: "Emirates NBD — Open Banking API",
    descriptionAr: "بنك الإمارات دبي الوطني — واجهة Open Banking",
    icon: <Building2 className="h-6 w-6 text-rose-600" />,
  },
];

const ACCOUNTING_INTEGRATIONS: Integration[] = [
  {
    key: "wafeq",
    name: "Wafeq (وافق)",
    nameAr: "وافق",
    description: "GCC-native accounting software",
    descriptionAr: "برنامج محاسبة مخصص لدول الخليج",
    icon: <BookOpen className="h-6 w-6 text-violet-600" />,
    interactive: true,
  },
  {
    key: "zoho",
    name: "Zoho Books",
    nameAr: "Zoho Books",
    description: "Cloud accounting for SMEs",
    descriptionAr: "محاسبة سحابية للشركات الصغيرة والمتوسطة",
    icon: <BookOpen className="h-6 w-6 text-orange-500" />,
  },
  {
    key: "quickbooks",
    name: "QuickBooks Online",
    nameAr: "QuickBooks Online",
    description: "Intuit QuickBooks — global standard",
    descriptionAr: "المعيار العالمي للمحاسبة",
    icon: <BookOpen className="h-6 w-6 text-green-600" />,
  },
];

// ── Integration Card ───────────────────────────────────────────────────────────

function IntegrationCard({
  integration,
  isAr,
  connecting,
  connected,
  onConnect,
}: {
  integration: Integration;
  isAr: boolean;
  connecting: string | null;
  connected: string[];
  onConnect: (key: string) => void;
}) {
  const isConnecting = connecting === integration.key;
  const isConnected = connected.includes(integration.key);

  return (
    <Card className="shadow-sm border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted shrink-0">
              {integration.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {isAr ? integration.nameAr : integration.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {isAr ? integration.descriptionAr : integration.description}
              </p>
            </div>
          </div>

          {isConnected ? (
            <Button
              size="sm"
              className="h-8 text-xs shrink-0 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isAr ? "متصل · تزامن منذ دقيقتين" : "Connected · Synced 2 mins ago"}
            </Button>
          ) : isConnecting ? (
            <Button size="sm" variant="outline" className="h-8 text-xs shrink-0 gap-1.5" disabled>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {isAr ? "جاري الربط..." : "Connecting..."}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs shrink-0 gap-1.5"
              onClick={() => integration.interactive && onConnect(integration.key)}
              disabled={!integration.interactive}
            >
              <Plug className="h-3.5 w-3.5" />
              {isAr ? "ربط الحساب" : "Connect"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const { dir } = useI18n();
  const { profile } = useCompany();
  const isAr = profile.currency !== undefined ? dir === "rtl" : dir === "rtl";

  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);

  function handleConnect(key: string) {
    setConnecting(key);
    setTimeout(() => {
      setConnecting(null);
      setConnected((prev) => [...prev, key]);
    }, 2000);
  }

  return (
    <div dir={dir} className="flex flex-col gap-8 p-5 md:p-7 overflow-y-auto h-full">

      {/* ══ HEADER ══ */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight">
          مصادر البيانات والربط
          <span className="text-muted-foreground font-normal text-base ms-2">(Data Integrations)</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          اربط حساباتك البنكية والأنظمة المحاسبية لتفعيل وكلاء الذكاء الاصطناعي.
        </p>
      </div>

      {/* ══ SECTION 1 — Open Banking ══ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">الربط البنكي</h2>
            <p className="text-xs text-muted-foreground mt-0.5">(Open Banking)</p>
          </div>
          <Badge variant="outline" className="text-[10px] gap-1 font-medium">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Secured by Lean Technologies &amp; Tarabut
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {BANK_INTEGRATIONS.map((integration) => (
            <IntegrationCard
              key={integration.key}
              integration={integration}
              isAr={isAr}
              connecting={connecting}
              connected={connected}
              onConnect={handleConnect}
            />
          ))}
        </div>
      </section>

      {/* ══ SECTION 2 — Accounting Sync ══ */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">الأنظمة المحاسبية</h2>
          <p className="text-xs text-muted-foreground mt-0.5">(Accounting Sync)</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ACCOUNTING_INTEGRATIONS.map((integration) => (
            <IntegrationCard
              key={integration.key}
              integration={integration}
              isAr={isAr}
              connecting={connecting}
              connected={connected}
              onConnect={handleConnect}
            />
          ))}
        </div>
      </section>

    </div>
  );
}
