"use client";

import { useI18n } from "@/lib/i18n/context";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { resolvePermissions } from "@/lib/auth/permissions";
import type { Role } from "@/lib/api/types";

const ROLES: { role: Role; description: string }[] = [
  { role: "tenant_admin", description: "Full access to all tenant resources" },
  { role: "owner", description: "Manage members and view all data" },
  { role: "finance_manager", description: "Read access plus audit logs" },
  { role: "accountant_readonly", description: "Read-only access to tenant data" },
];

export default function RolesPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div>
        <CardTitle className="text-base">{t.settings.rolesTitle}</CardTitle>
        <CardDescription className="mt-1">
          {t.settings.rolesDescription}
        </CardDescription>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ROLES.map(({ role, description }) => {
          const permissions = resolvePermissions([role]);
          return (
            <Card key={role}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{t.roles[role]}</CardTitle>
                <CardDescription className="text-xs">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {permissions.map((p) => (
                    <Badge key={p} variant="outline" className="text-xs">
                      {p}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
