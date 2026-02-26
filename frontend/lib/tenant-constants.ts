/**
 * Multi-tenant constants and types — safe to import from client or server.
 * Server-only logic (headers, cookies, getToken) lives in lib/server/tenant.ts.
 */

export const TENANT_HEADER = "x-tenant-id";
export const TENANT_COOKIE = "tadfuq_tenant_id";
export const TENANT_SLUG_COOKIE = "tadfuq_tenant_slug";

/** Cookie/header names for middleware and client (keep in sync) */
export const TENANT_IDS = {
  header: TENANT_HEADER,
  cookie: TENANT_COOKIE,
  slugCookie: TENANT_SLUG_COOKIE,
} as const;

export interface TenantInfo {
  id: string;
  name?: string;
  slug?: string;
}
