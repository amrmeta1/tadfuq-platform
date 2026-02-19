import { canAccessRoute, filterNavByRoles } from "@/lib/config/navigation";
import {
  hasPermission,
  hasAnyPermission,
  resolvePermissions,
  type Permission,
} from "@/lib/auth/permissions";
import type { Role } from "@/lib/api/types";

export type { Permission };

export {
  hasPermission,
  hasAnyPermission,
  resolvePermissions,
  canAccessRoute,
  filterNavByRoles,
};

export function hasRole(roles: string[], role: Role): boolean {
  return roles.includes(role);
}

export function hasAnyRole(roles: string[], check: Role[]): boolean {
  return check.some((r) => roles.includes(r));
}

export function isAdminOrOwner(roles: string[]): boolean {
  return hasAnyRole(roles, ["tenant_admin", "owner"]);
}

export function isFinanceAndAbove(roles: string[]): boolean {
  return hasAnyRole(roles, ["tenant_admin", "owner", "finance_manager"]);
}
