/**
 * Multi-tenant resolution — SERVER ONLY.
 * Import this only in Server Components, Route Handlers, or API routes.
 * Client code must use lib/hooks/use-tenant.tsx and lib/tenant-constants.ts.
 */
import { headers, cookies } from "next/headers";
import { TENANT_HEADER, TENANT_COOKIE } from "@/lib/tenant-constants";

export type { TenantInfo } from "@/lib/tenant-constants";

/** Default tenant id when none is set (e.g. development without auth) */
const DEFAULT_DEV_TENANT_ID = "demo";

/**
 * Get current tenant id from request (server-side).
 * Precedence: x-tenant-id header > tadfuq_tenant_id cookie. Middleware sets both from JWT/cookie.
 */
export async function getTenantFromRequest(): Promise<string | null> {
  const headersList = await headers();
  const headerTenant = headersList.get(TENANT_HEADER);
  if (headerTenant) return headerTenant;

  const cookieStore = await cookies();
  const cookieTenant = cookieStore.get(TENANT_COOKIE)?.value;
  if (cookieTenant) return cookieTenant;

  return null;
}

/**
 * Get tenant id from JWT payload (e.g. in API route with getToken(req)).
 */
export function getTenantIdFromToken(payload: { tenantId?: string } | null): string | null {
  return payload?.tenantId ?? null;
}

/**
 * Get current tenant id: header > cookie. In development, falls back to 'demo' if none set.
 */
export async function getCurrentTenantId(): Promise<string | null> {
  const fromRequest = await getTenantFromRequest();
  if (fromRequest) return fromRequest;

  if (process.env.NODE_ENV !== "production") {
    return DEFAULT_DEV_TENANT_ID;
  }
  return null;
}
