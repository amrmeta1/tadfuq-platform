"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import { ArrowRight, ShieldCheck, TrendingUp, Zap } from "lucide-react";

// ── Animation helpers ──────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as const, delay },
});

// ── Floating dashboard preview ─────────────────────────────────────────────────

function DashboardPreview({ isAr }: { isAr: boolean }) {
  const rows = [
    { label: isAr ? "QNB - شركات" : "QNB – Corporate",  val: "5,752,678", up: true  },
    { label: isAr ? "CBQ - رواتب"  : "CBQ – Payroll",    val: "2,310,450", up: true  },
    { label: isAr ? "HSBC - جاري"  : "HSBC – Current",   val: "-516,401",  up: false },
    { label: isAr ? "مصرف الريان"  : "Masraf Al Rayan",  val: "4,239,264", up: true  },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, rotateY: -8 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
      className="relative w-full max-w-[540px] mx-auto lg:mx-0"
      style={{ perspective: "1200px" }}
    >
      {/* Outer glow */}
      <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-30" style={{ background: "hsl(174 80% 44% / 0.3)" }} />

      {/* Browser chrome */}
      <div className="relative rounded-2xl border overflow-hidden shadow-2xl" style={{ borderColor: "hsl(174 80% 44% / 0.25)", background: "hsl(220 48% 7%)" }}>
        {/* Top bar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: "hsl(220 30% 14%)" }}>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
          <span className="ms-3 text-[10px] font-mono" style={{ color: "hsl(215 20% 40%)" }}>
            app.cashflow.ai / cash-positioning
          </span>
          <span className="ms-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium" style={{ background: "hsl(174 80% 44% / 0.12)", color: "hsl(174 80% 60%)", border: "1px solid hsl(174 80% 44% / 0.25)" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            {isAr ? "مباشر" : "Live"}
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Total balance card */}
          <div className="rounded-xl p-4" style={{ background: "hsl(174 80% 44% / 0.08)", border: "1px solid hsl(174 80% 44% / 0.2)" }}>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "hsl(174 80% 60%)" }}>
              {isAr ? "إجمالي التمركز النقدي" : "Total Cash Positioning"}
            </p>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-extrabold tabular-nums tracking-tight text-white">16,787,545</span>
              <span className="text-sm font-medium" style={{ color: "hsl(174 80% 60%)" }}>SAR</span>
              <span className="ms-auto text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">+2.1%</span>
            </div>
            {/* Mini bar chart */}
            <div className="mt-3 flex items-end gap-1 h-8">
              {[55, 70, 62, 80, 68, 85, 72, 90, 78, 95, 82, 100].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${h}%`, background: i === 11 ? "hsl(174 80% 44%)" : "hsl(174 80% 44% / 0.25)" }} />
              ))}
            </div>
          </div>

          {/* Account rows */}
          <div className="space-y-1.5">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "hsl(220 35% 10%)" }}>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.up ? "bg-emerald-400" : "bg-rose-400"}`} />
                  <span className="text-[11px] text-zinc-300">{r.label}</span>
                </div>
                <span className={`text-[11px] font-mono font-semibold tabular-nums ${r.up ? "text-emerald-400" : "text-rose-400"}`}>
                  {r.val} SAR
                </span>
              </div>
            ))}
          </div>

          {/* AI insight chip */}
          <div className="flex items-start gap-2.5 rounded-xl p-3" style={{ background: "hsl(220 35% 10%)", border: "1px solid hsl(174 80% 44% / 0.15)" }}>
            <Zap className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "hsl(174 80% 55%)" }} />
            <p className="text-[10px] leading-relaxed" style={{ color: "hsl(215 20% 65%)" }}>
              {isAr
                ? "مستشار: HSBC سيتجاوز الحد المصرح — أنصح تحويل 3.4M SAR من QNB قبل 25 ديس"
                : "Mustashar: HSBC will breach OD limit — recommend transfer SAR 3.4M from QNB before Dec 25"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HeroSection() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <section className="relative overflow-hidden px-4 pt-24 pb-20 md:pt-32 md:pb-28">

      {/* Background radial glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full blur-[130px] opacity-40" style={{ background: "hsl(174 80% 44% / 0.2)" }} />
        <div className="absolute top-1/2 right-0 h-[400px] w-[400px] rounded-full blur-[100px] opacity-20" style={{ background: "hsl(210 80% 55% / 0.25)" }} />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* ── Left: Text ── */}
          <div className="flex-1 text-center lg:text-start">

            {/* Overline badge */}
            <motion.div {...fadeUp(0)}>
              <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium mb-8" style={{ borderColor: "hsl(174 80% 44% / 0.35)", color: "hsl(174 80% 60%)", background: "hsl(174 80% 44% / 0.08)" }}>
                <span className="me-1.5 h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "hsl(174 80% 55%)" }} />
                {isAr ? "أول منصة سيولة بالذكاء الاصطناعي للخليج" : "The First AI-Native Liquidity Platform for GCC"}
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              {...fadeUp(0.08)}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.05] text-white mb-6"
            >
              {isAr ? (
                <>أداء السيولة<br /><span style={{ color: "hsl(174 80% 55%)" }}>بلا حدود.</span></>
              ) : (
                <>Limitless<br /><span style={{ color: "hsl(174 80% 55%)" }}>Liquidity Performance.</span></>
              )}
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              {...fadeUp(0.15)}
              className="text-lg leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0"
              style={{ color: "hsl(215 20% 62%)" }}
            >
              {isAr
                ? "وحّد أرصدة بنوكك، تنبأ بتدفقاتك النقدية، أتمت الامتثال للزكاة والضريبة — كل ذلك في منصة واحدة تعمل بالذكاء الاصطناعي."
                : "Unify your bank balances, predict your cash flows, automate ZATCA compliance — all in one AI-powered platform built for the GCC."}
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(0.22)} className="flex flex-col sm:flex-row items-center lg:items-start gap-3">
              <Link
                href="/app/onboarding"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full text-sm font-semibold transition-all hover:opacity-90 gap-2"
                style={{ background: "hsl(174 80% 44%)", color: "hsl(220 55% 5%)" }}
              >
                {isAr ? "ابدأ مجانًا" : "Start Free Trial"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full text-sm font-medium transition-all hover:text-white gap-2"
                style={{ border: "1px solid hsl(220 30% 22%)", color: "hsl(215 20% 62%)" }}
              >
                {isAr ? "احجز عرضًا" : "Get a Demo"}
              </Link>
            </motion.div>

            {/* Trust micro-badges */}
            <motion.div {...fadeUp(0.3)} className="flex flex-wrap items-center justify-center lg:justify-start gap-5 mt-10">
              {[
                { icon: ShieldCheck, label: isAr ? "متوافق مع ZATCA" : "ZATCA Certified" },
                { icon: TrendingUp,  label: isAr ? "دقة ٩٤٪ في التوقع" : "94% Forecast Accuracy" },
                { icon: Zap,         label: isAr ? "إعداد في ٢٤ ساعة" : "Live in 24 hrs" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs" style={{ color: "hsl(215 20% 50%)" }}>
                  <Icon className="h-3.5 w-3.5" style={{ color: "hsl(174 80% 50%)" }} />
                  {label}
                </span>
              ))}
            </motion.div>
          </div>

          {/* ── Right: Dashboard preview ── */}
          <div className="flex-1 w-full">
            <DashboardPreview isAr={isAr} />
          </div>

        </div>
      </div>
    </section>
  );
}
