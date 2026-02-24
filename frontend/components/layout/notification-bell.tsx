"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  FileText,
  Download,
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

/* ─── Types ─── */

type NotificationType = "alert" | "agent" | "system";
type NotificationSeverity = "critical" | "warning" | "info" | "success";

interface Notification {
  id: string;
  type: NotificationType;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  time: string;
  read: boolean;
  icon: string;
  severity: NotificationSeverity;
}

/* ─── Mock data ─── */

const now = Date.now();
const h = (hours: number) => new Date(now - hours * 3_600_000).toISOString();
const m = (mins: number) => new Date(now - mins * 60_000).toISOString();

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "alert",
    title_en: "Cash balance below floor",
    title_ar: "الرصيد النقدي أقل من الحد الأدنى",
    description_en: "QNB account dropped below SAR 50,000 threshold",
    description_ar: "حساب QNB انخفض عن حد 50,000 ريال",
    time: m(3),
    read: false,
    icon: "alert-triangle",
    severity: "critical",
  },
  {
    id: "n2",
    type: "agent",
    title_en: "Raqib detected an anomaly",
    title_ar: "رقيب اكتشف حالة شاذة",
    description_en: "Unusual outflow of SAR 28,000 flagged for review",
    description_ar: "تدفق غير عادي بقيمة 28,000 ريال يتطلب مراجعة",
    time: m(12),
    read: false,
    icon: "👁️",
    severity: "warning",
  },
  {
    id: "n3",
    type: "agent",
    title_en: "Mutawaqi forecast updated",
    title_ar: "تحديث توقعات المتوقع",
    description_en: "30-day cash projection revised upward by 8%",
    description_ar: "تم تعديل التوقع النقدي لـ30 يومًا بزيادة 8%",
    time: m(45),
    read: false,
    icon: "🔮",
    severity: "info",
  },
  {
    id: "n4",
    type: "system",
    title_en: "CSV import completed",
    title_ar: "اكتمل استيراد CSV",
    description_en: "142 transactions imported from bank statement",
    description_ar: "تم استيراد 142 معاملة من كشف الحساب",
    time: h(1),
    read: false,
    icon: "file-text",
    severity: "success",
  },
  {
    id: "n5",
    type: "agent",
    title_en: "Mustashar has a recommendation",
    title_ar: "المستشار لديه توصية",
    description_en: "Consider delaying supplier payment to optimise runway",
    description_ar: "يُنصح بتأجيل دفع المورّد لتحسين فترة التشغيل",
    time: h(2),
    read: false,
    icon: "🧠",
    severity: "info",
  },
  {
    id: "n6",
    type: "alert",
    title_en: "Overdue invoice: Al Jazeera Trading",
    title_ar: "فاتورة متأخرة: الجزيرة للتجارة",
    description_en: "SAR 15,200 outstanding for 14 days",
    description_ar: "15,200 ريال مستحقة منذ 14 يومًا",
    time: h(5),
    read: true,
    icon: "shield-alert",
    severity: "warning",
  },
  {
    id: "n7",
    type: "system",
    title_en: "Report ready for download",
    title_ar: "التقرير جاهز للتحميل",
    description_en: "Monthly cash flow report (Jan 2026) generated",
    description_ar: "تم إنشاء تقرير التدفق النقدي الشهري (يناير 2026)",
    time: h(8),
    read: true,
    icon: "download",
    severity: "success",
  },
  {
    id: "n8",
    type: "agent",
    title_en: "Raqib: payroll spike expected",
    title_ar: "رقيب: ارتفاع متوقع في الرواتب",
    description_en: "End-of-service benefit due for 2 employees next week",
    description_ar: "مستحقات نهاية خدمة لموظفَيْن الأسبوع القادم",
    time: h(18),
    read: true,
    icon: "👁️",
    severity: "warning",
  },
  {
    id: "n9",
    type: "alert",
    title_en: "FX exposure alert",
    title_ar: "تنبيه التعرض لسعر الصرف",
    description_en: "USD/SAR position exceeds hedging threshold",
    description_ar: "مركز USD/SAR يتجاوز حد التحوط",
    time: h(26),
    read: true,
    icon: "alert-triangle",
    severity: "critical",
  },
];

/* ─── Helpers ─── */

const SEVERITY_STYLES: Record<NotificationSeverity, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-400",
  info: "bg-blue-400",
  success: "bg-emerald-500",
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "alert-triangle": AlertTriangle,
  "shield-alert": ShieldAlert,
  "file-text": FileText,
  download: Download,
  info: Info,
  "check-circle": CheckCircle2,
};

function NotificationIcon({ icon, severity }: { icon: string; severity: NotificationSeverity }) {
  const LucideIcon = ICON_MAP[icon];
  if (LucideIcon) {
    const colorClass =
      severity === "critical"
        ? "text-red-500"
        : severity === "warning"
          ? "text-amber-500"
          : severity === "success"
            ? "text-emerald-500"
            : "text-blue-500";
    return <LucideIcon className={cn("h-4 w-4 shrink-0", colorClass)} />;
  }
  return <span className="text-sm leading-none shrink-0">{icon}</span>;
}

function relativeTime(iso: string, isAr: boolean): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return isAr ? `منذ ${days}ي` : `${days}d ago`;
  if (hrs > 0) return isAr ? `منذ ${hrs}س` : `${hrs}h ago`;
  if (mins > 0) return isAr ? `منذ ${mins}د` : `${mins}m ago`;
  return isAr ? "الآن" : "just now";
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

/* ─── Component ─── */

export function NotificationBell() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const n of MOCK_NOTIFICATIONS) {
      if (n.read) initial.add(n.id);
    }
    return initial;
  });

  const notifications = useMemo(
    () => MOCK_NOTIFICATIONS.map((n) => ({ ...n, read: readIds.has(n.id) })),
    [readIds],
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const todayItems = notifications.filter((n) => isToday(n.time));
  const earlierItems = notifications.filter((n) => !isToday(n.time));

  const markAllRead = () => {
    setReadIds(new Set(MOCK_NOTIFICATIONS.map((n) => n.id)));
  };

  const markRead = (id: string) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 end-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-0.5 leading-none animate-in zoom-in-50 duration-200">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-[28rem] overflow-y-auto">
        {/* Header */}
        <DropdownMenuLabel className="flex items-center justify-between py-2">
          <span className="text-sm font-semibold">
            {isAr ? "الإشعارات" : "Notifications"}
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                markAllRead();
              }}
              className="flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
            >
              <CheckCheck className="h-3 w-3" />
              {isAr ? "قراءة الكل" : "Mark all read"}
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            {isAr ? "لا توجد إشعارات" : "No notifications"}
          </div>
        ) : (
          <>
            {/* Today section */}
            {todayItems.length > 0 && (
              <>
                <div className="px-3 py-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {isAr ? "اليوم" : "Today"}
                  </span>
                </div>
                {todayItems.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    asChild
                    className={cn(
                      "cursor-pointer px-3 py-2.5 transition-colors duration-200",
                      !n.read && "bg-primary/[0.04]",
                    )}
                  >
                    <Link
                      href="/app/alerts"
                      onClick={() => markRead(n.id)}
                      className="flex items-start gap-2.5"
                    >
                      <div className="mt-0.5">
                        <NotificationIcon icon={n.icon} severity={n.severity} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium leading-snug truncate">
                            {isAr ? n.title_ar : n.title_en}
                          </p>
                          {!n.read && (
                            <span
                              className={cn(
                                "h-1.5 w-1.5 shrink-0 rounded-full animate-in fade-in duration-300",
                                SEVERITY_STYLES[n.severity],
                              )}
                            />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                          {isAr ? n.description_ar : n.description_en}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1 tabular-nums">
                          {relativeTime(n.time, isAr)}
                        </p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </>
            )}

            {/* Earlier section */}
            {earlierItems.length > 0 && (
              <>
                {todayItems.length > 0 && <DropdownMenuSeparator />}
                <div className="px-3 py-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {isAr ? "سابقًا" : "Earlier"}
                  </span>
                </div>
                {earlierItems.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    asChild
                    className={cn(
                      "cursor-pointer px-3 py-2.5 transition-colors duration-200",
                      !n.read && "bg-primary/[0.04]",
                    )}
                  >
                    <Link
                      href="/app/alerts"
                      onClick={() => markRead(n.id)}
                      className="flex items-start gap-2.5"
                    >
                      <div className="mt-0.5">
                        <NotificationIcon icon={n.icon} severity={n.severity} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium leading-snug truncate">
                            {isAr ? n.title_ar : n.title_en}
                          </p>
                          {!n.read && (
                            <span
                              className={cn(
                                "h-1.5 w-1.5 shrink-0 rounded-full animate-in fade-in duration-300",
                                SEVERITY_STYLES[n.severity],
                              )}
                            />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                          {isAr ? n.description_ar : n.description_en}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1 tabular-nums">
                          {relativeTime(n.time, isAr)}
                        </p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/app/alerts" className="flex justify-center text-xs text-primary py-1.5">
            {isAr ? "عرض جميع الإشعارات" : "View all notifications"}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
