"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";

// ── Animated counter ───────────────────────────────────────────────────────────

function useCounter(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);

  return value;
}

// ── Stat item ─────────────────────────────────────────────────────────────────

interface StatProps {
  prefix?: string;
  value: number;
  decimals?: number;
  suffix: string;
  label_en: string;
  label_ar: string;
  isAr: boolean;
  started: boolean;
  delay: number;
}

function StatItem({ prefix = "", value, decimals = 0, suffix, label_en, label_ar, isAr, started, delay }: StatProps) {
  const raw = useCounter(value * Math.pow(10, decimals), 1800, started);
  const display = decimals > 0
    ? (raw / Math.pow(10, decimals)).toFixed(decimals)
    : raw.toString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }}
      className="flex flex-col items-center gap-1.5 px-6 py-4"
    >
      <span className="text-4xl md:text-5xl font-extrabold tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
        {prefix}{display}{suffix}
      </span>
      <span className="text-sm text-zinc-500 text-center">
        {isAr ? label_ar : label_en}
      </span>
    </motion.div>
  );
}

// ── Stats data ─────────────────────────────────────────────────────────────────

const STATS = [
  {
    prefix: "SAR ",
    value: 4.2,
    decimals: 1,
    suffix: "B",
    label_en: "Managed on Platform",
    label_ar: "تحت الإدارة على المنصة",
  },
  {
    prefix: "",
    value: 200,
    decimals: 0,
    suffix: "+",
    label_en: "Companies in GCC",
    label_ar: "شركة في منطقة الخليج",
  },
  {
    prefix: "",
    value: 94,
    decimals: 0,
    suffix: "%",
    label_en: "Time Saved on Reporting",
    label_ar: "توفير في وقت التقارير",
  },
  {
    prefix: "",
    value: 99.97,
    decimals: 2,
    suffix: "%",
    label_en: "Platform Uptime",
    label_ar: "وقت تشغيل المنصة",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function StatsStrip() {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative mt-24 px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto"
      >
        {/* Separator line with glow */}
        <div className="relative flex items-center justify-center mb-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative inline-flex items-center rounded-full border border-white/10 px-4 py-1 text-[11px] text-zinc-500 uppercase tracking-widest" style={{ background: "hsl(220 55% 5%)" }}>
            {isAr ? "بالأرقام" : "By the numbers"}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-white/5">
          {STATS.map((stat, i) => (
            <StatItem
              key={stat.label_en}
              prefix={stat.prefix}
              value={stat.value}
              decimals={stat.decimals}
              suffix={stat.suffix}
              label_en={stat.label_en}
              label_ar={stat.label_ar}
              isAr={isAr}
              started={inView}
              delay={i * 0.1}
            />
          ))}
        </div>

        {/* Bottom separator */}
        <div className="w-full border-t border-white/5 mt-6" />
      </motion.div>
    </section>
  );
}
