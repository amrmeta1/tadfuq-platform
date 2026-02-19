import type { Role } from "@/lib/api/types";

export type Permission =
  | "tenant:create"
  | "tenant:read"
  | "tenant:update"
  | "member:list"
  | "member:add"
  | "member:remove"
  | "role:change"
  | "audit:read"
  | "ingestion:import"
  | "ingestion:read"
  | "ingestion:sync"
  | "bank_account:create"
  | "bank_account:read";

const PERMISSION_MATRIX: Record<Role, Permission[]> = {
  tenant_admin: [
    "tenant:create",
    "tenant:read",
    "tenant:update",
    "member:list",
    "member:add",
    "member:remove",
    "role:change",
    "audit:read",
    "ingestion:import",
    "ingestion:read",
    "ingestion:sync",
    "bank_account:create",
    "bank_account:read",
  ],
  owner: [
    "tenant:read",
    "tenant:update",
    "member:list",
    "member:add",
    "member:remove",
    "audit:read",
    "ingestion:import",
    "ingestion:read",
    "ingestion:sync",
    "bank_account:create",
    "bank_account:read",
  ],
  finance_manager: [
    "tenant:read",
    "member:list",
    "audit:read",
    "ingestion:import",
    "ingestion:read",
    "bank_account:read",
  ],
  accountant_readonly: [
    "tenant:read",
    "member:list",
    "ingestion:read",
    "bank_account:read",
  ],
};

export function resolvePermissions(roles: string[]): Permission[] {
  const perms = new Set<Permission>();
  for (const role of roles) {
    const rp = PERMISSION_MATRIX[role as Role];
    if (rp) rp.forEach((p) => perms.add(p));
  }
  return Array.from(perms);
}

export function hasPermission(
  roles: string[],
  permission: Permission
): boolean {
  return resolvePermissions(roles).includes(permission);
}

export function hasAnyPermission(
  roles: string[],
  permissions: Permission[]
): boolean {
  const resolved = resolvePermissions(roles);
  return permissions.some((p) => resolved.includes(p));
}
