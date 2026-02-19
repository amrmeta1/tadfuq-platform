"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { useTenant } from "@/lib/hooks/use-tenant";
import { useI18n } from "@/lib/i18n/context";
import { listTenants } from "@/lib/api/tenant-api";
import { getTenant } from "@/lib/api/tenant-api";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { dir } = useI18n();
  const {
    currentTenant,
    setCurrentTenant,
    setMemberships,
    setIsLoading,
  } = useTenant();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const { data: tenantList } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => listTenants(),
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (!tenantList?.data) return;

    const membershipsWithTenant = tenantList.data.map((t) => ({
      id: t.id,
      tenant_id: t.id,
      user_id: "",
      role: "accountant_readonly" as const,
      status: "active" as const,
      created_at: t.created_at,
      updated_at: t.updated_at,
      tenant: t,
    }));

    setMemberships(membershipsWithTenant);

    if (!currentTenant && tenantList.data.length > 0) {
      const savedId =
        typeof window !== "undefined"
          ? localStorage.getItem("currentTenantId")
          : null;
      const found = tenantList.data.find((t) => t.id === savedId);
      setCurrentTenant(found ?? tenantList.data[0]);
    }

    setIsLoading(false);
  }, [tenantList, currentTenant, setCurrentTenant, setMemberships, setIsLoading]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="flex h-screen overflow-hidden" dir={dir}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 [&:has([data-page-full])]:p-0 [&:has([data-page-full])]:overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
