import type { Role } from "@/lib/api/types";

// Permission names must match backend internal/auth/permissions.go
export type Permission =
  | "tenant:create"
  | "tenant:read"
  | "tenant:update"
  | "tenant:delete"
  | "member:add"
  | "member:read"
  | "member:remove"
  | "member:role_change"
  | "role:create"
  | "role:read"
  | "role:update"
  | "audit:read"
  | "audit:export"
  | "user:read_self"
  | "ingestion:import"
  | "ingestion:read"
  | "ingestion:sync"
  | "bank_account:create"
  | "bank_account:read"
  | "treasury:read"
  | "treasury:write"
  | "fx:read"
  | "fx:write"
  | "forecast:read"
  | "forecast:write"
  | "payables:read"
  | "payables:write"
  | "receivables:read"
  | "receivables:write"
  | "report:executive";

// Synced with backend internal/auth/permissions.go RolePermissions
const PERMISSION_MATRIX: Record<Role, Permission[]> = {
  tenant_admin: [
    "tenant:create",
    "tenant:read",
    "tenant:update",
    "tenant:delete",
    "member:add",
    "member:read",
    "member:remove",
    "member:role_change",
    "role:create",
    "role:read",
    "role:update",
    "audit:read",
    "user:read_self",
    "ingestion:import",
    "ingestion:read",
    "ingestion:sync",
    "bank_account:create",
    "bank_account:read",
  ],
  owner: [
    "tenant:read",
    "tenant:update",
    "member:add",
    "member:read",
    "member:remove",
    "member:role_change",
    "role:read",
    "audit:read",
    "user:read_self",
    "ingestion:import",
    "ingestion:read",
    "ingestion:sync",
    "bank_account:create",
    "bank_account:read",
  ],
  finance_manager: [
    "tenant:read",
    "member:read",
    "role:read",
    "audit:read",
    "user:read_self",
    "ingestion:import",
    "ingestion:read",
    "ingestion:sync",
    "bank_account:create",
    "bank_account:read",
  ],
  accountant_readonly: [
    "tenant:read",
    "member:read",
    "role:read",
    "user:read_self",
    "ingestion:read",
    "bank_account:read",
  ],
  group_cfo: [
    "tenant:create",
    "tenant:read",
    "tenant:update",
    "tenant:delete",
    "member:add",
    "member:read",
    "member:remove",
    "member:role_change",
    "role:create",
    "role:read",
    "role:update",
    "audit:read",
    "user:read_self",
    "ingestion:import",
    "ingestion:read",
    "ingestion:sync",
    "bank_account:create",
    "bank_account:read",
    "treasury:read",
    "treasury:write",
    "fx:read",
    "fx:write",
    "forecast:read",
    "forecast:write",
    "payables:read",
    "payables:write",
    "receivables:read",
    "receivables:write",
    "audit:export",
    "report:executive",
  ],
  treasury_director: [
    "tenant:read",
    "member:read",
    "role:read",
    "user:read_self",
    "ingestion:read",
    "bank_account:read",
    "treasury:read",
    "treasury:write",
    "fx:read",
    "fx:write",
    "forecast:read",
    "forecast:write",
  ],
  financial_controller: [
    "tenant:read",
    "member:read",
    "role:read",
    "user:read_self",
    "ingestion:read",
    "bank_account:read",
  ],
  ap_manager: ["user:read_self", "payables:read", "payables:write"],
  ar_manager: ["user:read_self", "receivables:read", "receivables:write"],
  bank_relationship_manager: [
    "tenant:read",
    "user:read_self",
    "bank_account:read",
  ],
  auditor_readonly: [
    "tenant:read",
    "member:read",
    "role:read",
    "audit:read",
    "audit:export",
    "user:read_self",
    "ingestion:read",
    "bank_account:read",
  ],
  board_member: ["report:executive", "user:read_self"],
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
