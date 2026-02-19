"use client";

import { Link2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useTenant } from "@/lib/hooks/use-tenant";
import { IntegrationsPageContent } from "@/features/settings/integrations/page-content";

export default function IntegrationsPage() {
  const { locale, dir } = useI18n();
  const { currentTenant } = useTenant();
  const isAr = locale === "ar";

  return (
    <div dir={dir} className="flex flex-col h-full overflow-y-auto" data-page-full>
      <div className="flex items-center gap-2 px-6 py-3 border-b bg-card shrink-0">
        <Link2 className="h-4 w-4 text-muted-foreground" />
        <h1 className="text-sm font-semibold">
          {isAr ? "التكاملات" : "Integrations"}
        </h1>
      </div>
      <IntegrationsPageContent
        tenantId={currentTenant?.id}
        isAr={isAr}
        locale={locale}
      />
    </div>
  );
}
