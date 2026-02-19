"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, ArrowLeftRight, Upload, TrendingUp, Bell, Bot, FileText, CreditCard, Settings, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/app/dashboard", labelKey: "dashboard" as const, icon: LayoutDashboard },
  { href: "/app/transactions", labelKey: "transactions" as const, icon: ArrowLeftRight },
  { href: "/app/forecast", labelKey: "forecast" as const, icon: TrendingUp },
  { href: "/app/alerts", labelKey: "alerts" as const, icon: Bell },
  { href: "/app/agents", labelKey: "agents" as const, icon: Bot },
  { href: "/app/import", labelKey: "import" as const, icon: Upload },
  { href: "/app/reports", labelKey: "reports" as const, icon: FileText },
  { href: "/app/billing", labelKey: "billing" as const, icon: CreditCard },
  { href: "/app/settings", labelKey: "organization" as const, icon: Settings },
  { href: "/app/audit", labelKey: "audit" as const, icon: ShieldCheck, permission: "audit:read" as const },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useI18n();
  const { can } = usePermissions();

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 start-0 w-64 bg-card shadow-lg z-50">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <span className="font-semibold">{t.common.appName}</span>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="space-y-1 p-3">
              {navItems.map((item) => {
                if (item.permission && !can(item.permission)) return null;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {t.nav[item.labelKey]}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
