"use client";

import { useMe } from "@/lib/hooks/use-me";
import {
  hasPermission,
  hasAnyPermission,
  type Permission,
} from "@/lib/auth/permissions";
import {
  canAccessRoute,
  filterNavByRoles,
  hasRole,
  hasAnyRole,
  isAdminOrOwner,
  isFinanceAndAbove,
} from "@/lib/auth/rbac";
import type { Role } from "@/lib/api/types";

export function usePermissions() {
  const { roles, isLoading } = useMe();

  return {
    roles,
    isLoading,
    can: (permission: Permission) => hasPermission(roles, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(roles, permissions),
    hasRole: (role: Role) => hasRole(roles, role),
    hasAnyRole: (check: Role[]) => hasAnyRole(roles, check),
    isAdminOrOwner: () => isAdminOrOwner(roles),
    isFinanceAndAbove: () => isFinanceAndAbove(roles),
    canAccessRoute: (href: string) => canAccessRoute(roles, href),
    visibleNav: () => filterNavByRoles(roles),
  };
}
