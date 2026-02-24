"use client";

import { useState } from "react";
import { Bot, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCompany } from "@/contexts/CompanyContext";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

// ── Message types ──────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
}

// ── Copilot component ──────────────────────────────────────────────────────────

export function MustasharCopilot() {
  const { profile } = useCompany();
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const currency = profile.currency || "SAR";
  const companyName = profile.companyName || (isAr ? "شركتك" : "your company");

  const [open, setOpen] = useState(false);

  const MESSAGES: Message[] = [
    {
      id: "1",
      role: "ai",
      text: isAr
        ? `أهلاً بك في ${companyName}. رصيدك اليوم آمن، ولكن لاحظت فاتورة بقيمة 45,000 ${currency} تستحق غداً. كيف يمكنني مساعدتك؟`
        : `Welcome to ${companyName}. Your balance today is safe, but I noticed an invoice of ${currency} 45,000 due tomorrow. How can I help?`,
    },
    {
      id: "2",
      role: "user",
      text: isAr
        ? `هل يمكنني قبول عقد المقاولات الجديد بقيمة 350,000 ${currency} يبدأ الشهر القادم؟`
        : `Can I accept the new contracting deal worth ${currency} 350,000 starting next month?`,
    },
    {
      id: "3",
      role: "ai",
      text: isAr
        ? `قمت بمحاكاة التدفق النقدي. نعم يمكنك، ولكن ستحتاج لطلب دفعة مقدمة (Advance Payment) بنسبة 20% لتغطية تكاليف المواد لتجنب عجز بقيمة 12,000 ${currency} يوم 10 الشهر القادم.`
        : `I simulated the cash flow. Yes you can, but you'll need to request a 20% Advance Payment to cover material costs and avoid a ${currency} 12,000 deficit on the 10th of next month.`,
    },
    {
      id: "4",
      role: "user",
      text: isAr
        ? "شكراً، سأتواصل مع العميل."
        : "Thanks, I'll reach out to the client.",
    },
  ];

  return (
    <>
      {/* ── Chat window ── */}
      {open && (
        <div className="fixed bottom-20 left-6 z-50 w-[350px] h-[500px] flex flex-col" dir={isAr ? "rtl" : "ltr"}>
          <Card className="flex flex-col h-full shadow-2xl border-border/60 overflow-hidden">

            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between px-4 py-3 border-b bg-card shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/60 shrink-0">
                  <Bot className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">
                    {isAr ? "الوكيل مُستشار" : "Mustashar Agent"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">(Decision Agent)</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium ms-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isAr ? "متصل" : "Online"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => setOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {MESSAGES.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                      msg.role === "ai"
                        ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-100 rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    )}
                    suppressHydrationWarning
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Input footer */}
            <div className="flex items-center gap-2 px-4 py-3 border-t bg-card shrink-0">
              <Input
                placeholder={isAr ? "اكتب رسالتك..." : "Type your message..."}
                className="h-8 text-xs flex-1"
                disabled
              />
              <Button size="icon" className="h-8 w-8 shrink-0" disabled>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>

          </Card>
        </div>
      )}

      {/* ── FAB ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-xl transition-all duration-200",
          open
            ? "bg-zinc-800 hover:bg-zinc-700 text-white"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        )}
        aria-label={isAr ? "فتح الوكيل مستشار" : "Open Mustashar Agent"}
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </button>
    </>
  );
}
