"use client";

import { useSession } from "next-auth/react";
import {
  hasPermission,
  hasAnyPermission,
  type Permission,
} from "@/lib/auth/permissions";

export function usePermissions() {
  const { data: session } = useSession();
  const roles = session?.roles ?? [];

  return {
    roles,
    can: (permission: Permission) => hasPermission(roles, permission),
    canAny: (permissions: Permission[]) =>
      hasAnyPermission(roles, permissions),
  };
}
