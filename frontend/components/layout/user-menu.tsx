"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { data: session } = useSession();
  const { t } = useI18n();

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden md:flex flex-col items-end text-sm">
        <span className="font-medium">{session.user.name ?? session.user.email}</span>
        <span className="text-xs text-muted-foreground">{session.user.email}</span>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
        {(session.user.name ?? session.user.email ?? "U").charAt(0).toUpperCase()}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => signOut({ callbackUrl: "/login" })}
        title={t.auth.logout}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
