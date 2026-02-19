"use client";

import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useTenant } from "@/lib/hooks/use-tenant";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { SecurityPageContent } from "@/features/settings/security/page-content";

export default function SecurityPage() {
  const { locale, dir } = useI18n();
  const { currentTenant } = useTenant();
  const { can } = usePermissions();
  const isAr = locale === "ar";

  const isAdmin = can("tenant:update");

  return (
    <div dir={dir} className="flex flex-col h-full overflow-y-auto" data-page-full>
      <div className="flex items-center gap-2 px-6 py-3 border-b bg-card shrink-0">
        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        <h1 className="text-sm font-semibold">
          {isAr ? "الأمان" : "Security"}
        </h1>
      </div>
      <SecurityPageContent
        tenantId={currentTenant?.id}
        isAr={isAr}
        isAdmin={isAdmin}
      />
    </div>
  );
}
