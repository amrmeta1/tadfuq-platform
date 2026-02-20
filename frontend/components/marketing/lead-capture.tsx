"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

// ── Component ────────────────────────────────────────────────────────────────

export function LeadCapture() {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <section className="mt-32 pb-32 px-4">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          {isAr
            ? "هل أنت مستعد للحصول على وضوح مالي كامل؟"
            : "Ready to gain total financial clarity?"}
        </h2>
        <p className="text-zinc-400 mt-4 text-lg">
          {isAr
            ? "انضم إلى أكثر من ٥٠٠ شركة خليجية تنتظر الإطلاق."
            : "Join 500+ GCC businesses already on the waitlist."}
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-emerald-400 text-sm font-medium"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isAr ? "أنت على القائمة! سنتواصل معك قريبًا." : "You're on the list! We'll be in touch soon."}
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-md mx-auto">
            <div className="flex w-full items-center border border-zinc-800 bg-zinc-900/80 rounded-full p-1 focus-within:ring-1 focus-within:ring-primary transition-all">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAr ? "بريدك الإلكتروني" : "you@company.com"}
                className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-zinc-500 outline-none min-w-0"
                dir={isAr ? "rtl" : "ltr"}
              />
              <button
                type="submit"
                className="shrink-0 bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-medium hover:opacity-90 transition-all"
              >
                {isAr ? "انضم للقائمة" : "Join Waitlist"}
              </button>
            </div>
          </form>
        )}

        <p className="text-xs text-zinc-600 mt-4">
          {isAr ? "لا بريد مزعج. إلغاء الاشتراك في أي وقت." : "No spam. Unsubscribe at any time."}
        </p>
      </motion.div>
    </section>
  );
}
