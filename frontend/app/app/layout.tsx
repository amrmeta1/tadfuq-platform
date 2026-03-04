"use client";

import { AppShell } from "@/components/layout/app-shell";
import { OnboardingGuard } from "@/components/providers/OnboardingGuard";

const DEV_SKIP_AUTH = process.env.NEXT_PUBLIC_DEV_SKIP_AUTH === "true";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Temporarily bypass app-shell in DEV_SKIP_AUTH mode to isolate the issue
  if (DEV_SKIP_AUTH) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
            <p className="text-sm font-medium">DEV MODE - Simplified Layout</p>
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <OnboardingGuard>
      <AppShell>{children}</AppShell>
    </OnboardingGuard>
  );
}
