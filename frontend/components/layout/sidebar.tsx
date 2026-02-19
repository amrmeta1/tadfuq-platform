"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Upload,
  TrendingUp,
  Bell,
  Bot,
  FileText,
  CreditCard,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Target,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { useSidebar } from "@/lib/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  href: string;
  labelKey: keyof typeof import("@/lib/i18n/dictionaries").dictionaries.en.nav;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Parameters<ReturnType<typeof usePermissions>["can"]>[0];
  separator?: boolean;
}

const navItems: NavItem[] = [
  { href: "/app/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/app/transactions", labelKey: "transactions", icon: ArrowLeftRight },
  { href: "/app/forecast", labelKey: "forecast", icon: TrendingUp },
  { href: "/app/alerts", labelKey: "alerts", icon: Bell },
  { href: "/app/agents", labelKey: "agents", icon: Bot },
  { href: "/app/import", labelKey: "import", icon: Upload },
  { href: "/app/reports", labelKey: "reports", icon: FileText },
  { href: "/app/analytics/waterfall", labelKey: "waterfall", icon: BarChart2 },
  { href: "/app/analytics/budget", labelKey: "budget", icon: Target },
  { href: "/app/billing", labelKey: "billing", icon: CreditCard, separator: true },
  { href: "/app/settings", labelKey: "organization", icon: Settings },
  {
    href: "/app/audit",
    labelKey: "audit",
    icon: ShieldCheck,
    permission: "audit:read",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t, dir } = useI18n();
  const { can } = usePermissions();
  const { collapsed, toggle } = useSidebar();
  const isRtl = dir === "rtl";

  const CollapseIcon = collapsed
    ? isRtl ? ChevronLeft : ChevronRight
    : isRtl ? ChevronRight : ChevronLeft;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "hidden md:flex flex-col border-e bg-card transition-all duration-200 shrink-0",
          collapsed ? "w-[52px]" : "w-[220px]"
        )}
      >
        {/* Logo row */}
        <div className="flex h-12 items-center border-b px-3 gap-2 overflow-hidden">
          <Link
            href="/app/dashboard"
            className="flex items-center gap-2 shrink-0"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
              CF
            </div>
            {!collapsed && (
              <span className="font-semibold text-sm truncate">
                {t.common.appName}
              </span>
            )}
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-2 px-1.5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            if (item.permission && !can(item.permission)) return null;
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");

            const linkEl = (
              <Link
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800/50 text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:text-foreground"
                )}
              >
                {isActive && !collapsed && (
                  <span className="absolute start-0 inset-y-1 w-0.5 rounded-full bg-primary" />
                )}
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="truncate">{t.nav[item.labelKey]}</span>
                )}
              </Link>
            );

            return (
              <div key={item.href}>
                {item.separator && (
                  <div className="my-1.5 border-t mx-1" />
                )}
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                    <TooltipContent side={isRtl ? "left" : "right"}>
                      {t.nav[item.labelKey]}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  linkEl
                )}
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t p-1.5">
          <button
            onClick={toggle}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
              collapsed && "justify-center px-0"
            )}
            aria-label="Toggle sidebar"
          >
            <CollapseIcon className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && (
              <span>{isRtl ? "طي" : "Collapse"}</span>
            )}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
