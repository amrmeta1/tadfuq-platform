"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n/context";
import { TenantProvider } from "@/lib/hooks/use-tenant";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { EntityProvider } from "@/contexts/EntityContext";
import { ScenarioProvider } from "@/contexts/ScenarioContext";
import { TenantSegmentProvider } from "@/contexts/TenantSegmentContext";
import { ToastProvider } from "@/components/ui/toast";
import { CommandMenuProvider } from "@/lib/command-store";
import { CommandPalette } from "@/components/global/command-palette";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nProvider>
          <TenantProvider>
            <CompanyProvider>
              <CurrencyProvider>
                <EntityProvider>
                  <ScenarioProvider>
                    <TenantSegmentProvider>
                      <ToastProvider>
                        <CommandMenuProvider>
                          {children}
                          <CommandPalette />
                        </CommandMenuProvider>
                      </ToastProvider>
                    </TenantSegmentProvider>
                  </ScenarioProvider>
                </EntityProvider>
              </CurrencyProvider>
            </CompanyProvider>
          </TenantProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
