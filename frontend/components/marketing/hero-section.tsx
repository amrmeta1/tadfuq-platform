"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";

// ── Animation variants ────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
});

// ── Component ────────────────────────────────────────────────────────────────

export function HeroSection() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <section className="relative flex flex-col items-center justify-center text-center px-4 pt-28 pb-16 overflow-hidden">

      {/* Radial glow orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px] opacity-60" />
      </div>

      {/* Pill badge */}
      <motion.div {...fadeUp(0)}>
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 backdrop-blur-md mb-8 animate-pulse">
          ✨ {isAr ? "أول CFO مدعوم بالذكاء الاصطناعي في الخليج" : "The First AI-Native CFO for the GCC"}
        </span>
      </motion.div>

      {/* H1 */}
      <motion.h1
        {...fadeUp(0.1)}
        className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 max-w-5xl"
      >
        {isAr
          ? "لا تتتبع السيولة فحسب.\nتنبأ بها."
          : "Don't Just Track Cash.\nPredict It."}
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        {...fadeUp(0.2)}
        className="text-lg text-zinc-400 max-w-2xl mx-auto mt-6 leading-relaxed"
      >
        {isAr
          ? "استبدل جداول البيانات الفوضوية بذكاء اصطناعي ينظف بياناتك البنكية، يتنبأ بمدار سيولتك، يعزل ضريبة القيمة المضافة، ويؤتمت تحصيلاتك."
          : "Replace chaotic spreadsheets with an AI that cleans your bank data, predicts your cash runway, ring-fences your VAT, and automates your collections."}
      </motion.p>

      {/* CTA group */}
      <motion.div
        {...fadeUp(0.3)}
        className="flex flex-col sm:flex-row items-center gap-3 mt-10"
      >
        <Link
          href="/login"
          className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground text-base font-medium shadow-[0_0_30px_-5px_hsl(var(--primary)/0.6)] hover:opacity-90 transition-all"
        >
          {isAr ? "ابدأ مجانًا" : "Start Free Trial"}
        </Link>
        <Link
          href="/demo"
          className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all text-base font-medium"
        >
          {isAr ? "شاهد العرض" : "View Demo"}
        </Link>
      </motion.div>

    </section>
  );
}
