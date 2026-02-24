"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, Shield, TrendingUp, Target, ArrowRight, CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Pillar {
  id: string;
  tag_en: string;
  tag_ar: string;
  title_en: string;
  title_ar: string;
  desc_en: string;
  desc_ar: string;
  bullets_en: string[];
  bullets_ar: string[];
  icon: React.ElementType;
  visual: React.ReactNode;
}

// ── Pillar visuals ─────────────────────────────────────────────────────────────

function ConnectVisual() {
  const banks = ["QNB", "CBQ", "HSBC", "Masraf", "Barclays", "Saudi Fransi"];
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "hsl(174 80% 55%)" }}>Bank Connections</p>
        <span className="text-[10px] rounded-full px-2 py-0.5" style={{ background: "hsl(174 80% 44% / 0.12)", color: "hsl(174 80% 60%)" }}>9,900+ supported</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {banks.map((bank, i) => (
          <motion.div
            key={bank}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="flex items-center justify-center rounded-xl py-3 text-[11px] font-semibold text-white"
            style={{ background: "hsl(220 35% 12%)", border: "1px solid hsl(174 80% 44% / 0.15)" }}
          >
            {bank}
          </motion.div>
        ))}
      </div>
      <div className="rounded-xl p-3 space-y-2" style={{ background: "hsl(220 35% 10%)" }}>
        <div className="flex items-center justify-between text-[10px]">
          <span style={{ color: "hsl(215 20% 50%)" }}>Last sync</span>
          <span className="flex items-center gap-1" style={{ color: "hsl(174 80% 55%)" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            Just now
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span style={{ color: "hsl(215 20% 50%)" }}>Transactions parsed</span>
          <span className="text-white font-semibold">1,247 <span className="font-normal" style={{ color: "hsl(215 20% 50%)" }}>today</span></span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span style={{ color: "hsl(215 20% 50%)" }}>AI accuracy</span>
          <span className="font-semibold" style={{ color: "hsl(174 80% 55%)" }}>98.6%</span>
        </div>
      </div>
    </div>
  );
}

function ProtectVisual() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: "hsl(142 71% 38% / 0.1)", border: "1px solid hsl(142 71% 38% / 0.25)" }}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: "hsl(142 71% 38% / 0.15)" }}>
          <Shield className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">VAT Ring-Fenced</p>
          <p className="text-xs text-emerald-400 tabular-nums font-mono">SAR 2,326,525 — Locked</p>
        </div>
        <span className="ms-auto text-[10px] rounded-full px-2 py-1 font-medium" style={{ background: "hsl(142 71% 38% / 0.15)", color: "hsl(142 71% 55%)" }}>ZATCA</span>
      </div>
      <div className="space-y-2">
        {[
          { label: "Q4 VAT liability", val: "SAR 2,326,525", pct: 100 },
          { label: "GOSI contribution", val: "SAR 89,000",   pct: 78 },
          { label: "Income tax reserve", val: "SAR 145,000", pct: 54 },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span style={{ color: "hsl(215 20% 60%)" }}>{item.label}</span>
              <span className="text-white font-mono">{item.val}</span>
            </div>
            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "hsl(220 35% 12%)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.pct}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-[10px]" style={{ background: "hsl(220 35% 10%)", color: "hsl(215 20% 50%)" }}>
        <Shield className="h-3 w-3 text-emerald-400 shrink-0" />
        SAR 0 in compliance penalties since onboarding
      </div>
    </div>
  );
}

function ForecastVisual() {
  const bars = [42, 55, 48, 70, 63, 80, 72, 90, 85, 95, 88, 100];
  const forecast = [null, null, null, null, null, null, null, null, 88, 96, 91, 100];
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "hsl(174 80% 55%)" }}>13-Week Forecast</p>
        <span className="text-[10px] rounded-full px-2 py-0.5" style={{ background: "hsl(174 80% 44% / 0.12)", color: "hsl(174 80% 60%)" }}>87% confidence</span>
      </div>
      {/* Chart */}
      <div className="flex items-end gap-1 h-24">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm relative">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              className="w-full rounded-t-sm"
              style={{
                background: forecast[i] != null
                  ? "hsl(174 80% 44% / 0.4)"
                  : i >= 9
                    ? "hsl(174 80% 44%)"
                    : "hsl(174 80% 44% / 0.6)",
                border: forecast[i] != null ? "1px dashed hsl(174 80% 44% / 0.6)" : "none",
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-[10px]">
        <span className="flex items-center gap-1.5" style={{ color: "hsl(215 20% 50%)" }}>
          <span className="h-2 w-3 rounded-sm bg-current inline-block" style={{ background: "hsl(174 80% 44%)" }} />
          Actual
        </span>
        <span className="flex items-center gap-1.5" style={{ color: "hsl(215 20% 50%)" }}>
          <span className="h-2 w-3 rounded-sm inline-block border border-dashed" style={{ borderColor: "hsl(174 80% 44%)" }} />
          Forecast
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Projected runway", val: "14 months" },
          { label: "Next 30-day net",  val: "+SAR 1.2M" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl p-3 text-center" style={{ background: "hsl(220 35% 10%)" }}>
            <p className="text-lg font-extrabold text-white tabular-nums">{kpi.val}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "hsl(215 20% 50%)" }}>{kpi.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OptimizeVisual() {
  const entities = [
    { name: "Holding Co.", bal: 16.8, pct: 62, color: "hsl(174 80% 44%)" },
    { name: "Subsidiary A", bal: 5.2,  pct: 19, color: "hsl(210 80% 55%)" },
    { name: "Subsidiary B", bal: 3.8,  pct: 14, color: "hsl(270 70% 60%)" },
    { name: "Subsidiary C", bal: 1.3,  pct: 5,  color: "hsl(38 95% 60%)" },
  ];
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest" style={{ color: "hsl(174 80% 55%)" }}>Group Consolidation</p>
        <span className="text-[10px]" style={{ color: "hsl(215 20% 50%)" }}>4 entities</span>
      </div>
      <div className="rounded-xl p-4 text-center" style={{ background: "hsl(174 80% 44% / 0.08)", border: "1px solid hsl(174 80% 44% / 0.2)" }}>
        <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "hsl(174 80% 55%)" }}>Group Net Position</p>
        <p className="text-3xl font-extrabold text-white tabular-nums">SAR 27.1M</p>
        <p className="text-xs mt-1 text-emerald-400">↑ +3.2% vs last month</p>
      </div>
      <div className="space-y-2.5">
        {entities.map((e) => (
          <div key={e.name}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-white font-medium">{e.name}</span>
              <span className="font-mono" style={{ color: "hsl(215 20% 65%)" }}>{e.bal}M SAR</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "hsl(220 35% 12%)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${e.pct}%` }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: e.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Pillar data ────────────────────────────────────────────────────────────────

const PILLARS: Pillar[] = [
  {
    id: "connect",
    tag_en: "CONNECT", tag_ar: "ربط",
    title_en: "Unify Everything.",
    title_ar: "وحّد كل شيء.",
    desc_en: "Connect banks, ERPs, and data sources to unify your enterprise cash data in real time.",
    desc_ar: "ربط البنوك وأنظمة ERP ومصادر البيانات لتوحيد بيانات السيولة في الوقت الفعلي.",
    bullets_en: ["Connect to 9,900+ banks, right out of the box", "Streamline SAP, Oracle & QuickBooks integration", "AI maps messy bank data to GCC chart of accounts"],
    bullets_ar: ["اتصال بأكثر من 9,900 بنك فورًا", "تكامل سلس مع SAP وOracle وQuickBooks", "الذكاء الاصطناعي يخرط البيانات وفق مخطط حسابات الخليج"],
    icon: Link2,
    visual: <ConnectVisual />,
  },
  {
    id: "protect",
    tag_en: "PROTECT", tag_ar: "حماية",
    title_en: "Master Risk.",
    title_ar: "أتقن إدارة المخاطر.",
    desc_en: "Ring-fence your VAT, automate ZATCA filings, and never touch compliance money by mistake.",
    desc_ar: "احمِ مبالغ ضريبة القيمة المضافة، أتمت ملفات الزكاة والضريبة، ولا تلمس الأموال الضريبية أبدًا.",
    bullets_en: ["Auto-calculated VAT liabilities, locked away", "ZATCA e-invoicing compliance built in", "SOC 2 Ready · ISO 27001 Aligned"],
    bullets_ar: ["التزامات ضريبية محسوبة تلقائيًا ومجمدة", "امتثال للفوترة الإلكترونية للزكاة والضريبة", "SOC 2 جاهز · متوافق مع ISO 27001"],
    icon: Shield,
    visual: <ProtectVisual />,
  },
  {
    id: "forecast",
    tag_en: "FORECAST", tag_ar: "توقع",
    title_en: "See the Future.",
    title_ar: "انظر إلى المستقبل.",
    desc_en: "Project cash, liquidity, and risk exposures 13 weeks ahead with AI precision.",
    desc_ar: "توقع التدفقات النقدية والسيولة والمخاطر 13 أسبوعًا مقدمًا بدقة الذكاء الاصطناعي.",
    bullets_en: ["87% average forecast accuracy on GCC data", "Scenario sandbox: test revenue drops & delays", "AI narrative explains every forecast change"],
    bullets_ar: ["87٪ دقة متوسط في توقعات بيانات الخليج", "بيئة سيناريوهات: اختبر الانخفاضات والتأخيرات", "الذكاء الاصطناعي يشرح كل تغيير في التوقع"],
    icon: TrendingUp,
    visual: <ForecastVisual />,
  },
  {
    id: "optimize",
    tag_en: "OPTIMIZE", tag_ar: "تحسين",
    title_en: "Act with Confidence.",
    title_ar: "تصرّف بثقة.",
    desc_en: "Make confident, data-driven decisions across all your entities with real-time group consolidation.",
    desc_ar: "اتخذ قرارات واثقة ومبنية على البيانات عبر جميع كياناتك بتوحيد المجموعة في الوقت الفعلي.",
    bullets_en: ["Single group-level cash position in real time", "Automated board reports with AI narrative", "Approval workflows with full audit trail"],
    bullets_ar: ["مركز نقدي واحد للمجموعة في الوقت الفعلي", "تقارير مجلس الإدارة الآلية مع سرد الذكاء الاصطناعي", "سير عمل الموافقات مع سجل تدقيق كامل"],
    icon: Target,
    visual: <OptimizeVisual />,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function PillarsSection() {
  const { locale } = useI18n();
  const isAr = locale === "ar";
  const [active, setActive] = useState("connect");

  const current = PILLARS.find((p) => p.id === active)!;

  return (
    <section className="relative mt-32 px-4 overflow-hidden">

      {/* Section background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(174 80% 44% / 0.3), transparent)" }} />
        <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(174 80% 44% / 0.2), transparent)" }} />
      </div>

      <div className="max-w-6xl mx-auto py-20">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "hsl(174 80% 55%)" }}>
            {isAr ? "هذا هو الطريق." : "This is the way."}
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-white">
            {isAr
              ? <>وصّل سيولتك بأكبر<br />مزاياك الاستراتيجية.</>
              : <>Connect your liquidity to your<br />most strategic advantages.</>}
          </h2>
        </motion.div>

        {/* Tab bar */}
        <div className="flex items-center justify-center gap-1 p-1 rounded-full mb-12 mx-auto max-w-fit" style={{ background: "hsl(220 35% 9%)", border: "1px solid hsl(220 30% 14%)" }}>
          {PILLARS.map((p) => {
            const Icon = p.icon;
            const isActive = p.id === active;
            return (
              <button
                key={p.id}
                onClick={() => setActive(p.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={{
                  background: isActive ? "hsl(174 80% 44%)" : "transparent",
                  color: isActive ? "hsl(220 55% 5%)" : "hsl(215 20% 50%)",
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {isAr ? p.tag_ar : p.tag_en}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left: text */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "hsl(174 80% 55%)" }}>
                {isAr ? current.tag_ar : current.tag_en}
              </p>
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-white mb-4 leading-tight">
                {isAr ? current.title_ar : current.title_en}
              </h3>
              <p className="text-base leading-relaxed mb-8" style={{ color: "hsl(215 20% 60%)" }}>
                {isAr ? current.desc_ar : current.desc_en}
              </p>
              <ul className="space-y-3 mb-8">
                {(isAr ? current.bullets_ar : current.bullets_en).map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm" style={{ color: "hsl(215 20% 72%)" }}>
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "hsl(174 80% 50%)" }} />
                    {b}
                  </li>
                ))}
              </ul>
              <button className="inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3" style={{ color: "hsl(174 80% 55%)" }}>
                {isAr ? "اعرف أكثر" : "Learn more"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Right: visual */}
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl blur-2xl opacity-20" style={{ background: "hsl(174 80% 44% / 0.4)" }} />
              <div className="relative rounded-2xl overflow-hidden" style={{ background: "hsl(220 48% 7.5%)", border: "1px solid hsl(174 80% 44% / 0.2)" }}>
                {current.visual}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
