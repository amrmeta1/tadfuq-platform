"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

// ── CFO visual ─────────────────────────────────────────────────────────────────

function CfoVisual() {
  const kpis = [
    { label: "Cash Runway",   val: "14 mo",   up: true  },
    { label: "DSO",           val: "32 days", up: true  },
    { label: "Burn Multiple", val: "0.71×",   up: true  },
    { label: "VAT Reserved",  val: "SAR 2.3M",up: true  },
  ];
  return (
    <div className="mt-8 grid grid-cols-2 gap-2.5">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="rounded-xl p-3" style={{ background: "hsl(174 80% 44% / 0.08)", border: "1px solid hsl(174 80% 44% / 0.2)" }}>
          <p className="text-[10px] font-medium mb-1" style={{ color: "hsl(174 80% 60%)" }}>{kpi.label}</p>
          <p className="text-lg font-extrabold text-white tabular-nums">{kpi.val}</p>
        </div>
      ))}
    </div>
  );
}

// ── Finance Manager visual ─────────────────────────────────────────────────────

function FinanceVisual() {
  const tasks = [
    { done: true,  label: "Bank statement imported · AI-categorized" },
    { done: true,  label: "VAT liability auto-calculated & locked"    },
    { done: true,  label: "Board report generated (3 min)"            },
    { done: false, label: "Supplier payment approval pending…"        },
  ];
  return (
    <div className="mt-8 space-y-2">
      {tasks.map((t, i) => (
        <motion.div
          key={t.label}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            background: t.done ? "hsl(220 35% 11%)" : "hsl(38 95% 60% / 0.08)",
            border: t.done ? "1px solid hsl(220 30% 16%)" : "1px solid hsl(38 95% 60% / 0.25)",
          }}
        >
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: t.done ? "hsl(142 71% 38% / 0.2)" : "hsl(38 95% 60% / 0.15)" }}>
            {t.done
              ? <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              : <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "hsl(38 95% 60%)" }} />}
          </div>
          <p className="text-[11px]" style={{ color: t.done ? "hsl(215 20% 65%)" : "hsl(38 95% 70%)" }}>
            {t.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AudienceCards() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const cards = [
    {
      id: "cfo",
      overline_en: "FOR CFOs",          overline_ar: "للمديرين الماليين",
      title_en: "Improve financial health through superior liquidity performance.",
      title_ar: "حسّن الصحة المالية من خلال أداء سيولة متفوق.",
      desc_en: "Get a real-time, board-ready view of your company's cash position across every bank, entity, and currency — with AI delivering the insights before you even ask.",
      desc_ar: "احصل على رؤية آنية وجاهزة لمجلس الإدارة لوضع شركتك النقدي عبر كل بنك وكيان وعملة — مع الذكاء الاصطناعي الذي يقدم الرؤى قبل أن تطلبها.",
      cta_en: "Learn more for CFOs",   cta_ar: "اعرف أكثر للمديرين الماليين",
      visual: <CfoVisual />,
      accentColor: "hsl(174 80% 44%)",
    },
    {
      id: "finance",
      overline_en: "FOR FINANCE TEAMS",  overline_ar: "لفرق المالية",
      title_en: "Drive optimal liquidity with data-driven treasury management.",
      title_ar: "حقق سيولة مثالية مع إدارة خزينة مبنية على البيانات.",
      desc_en: "Automate the manual: import & categorize bank data in seconds, lock away VAT automatically, generate board reports in minutes, and send WhatsApp reminders to clients.",
      desc_ar: "أتمت المهام اليدوية: استيراد وتصنيف البيانات البنكية في ثوانٍ، حجز الضريبة تلقائيًا، إنشاء تقارير مجلس الإدارة في دقائق، وإرسال تذكيرات WhatsApp للعملاء.",
      cta_en: "Learn more for Finance", cta_ar: "اعرف أكثر لفرق المالية",
      visual: <FinanceVisual />,
      accentColor: "hsl(210 80% 55%)",
    },
  ];

  return (
    <section className="mt-32 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-white">
            {isAr ? "مصمم لقادة المالية." : "Purpose-built for finance leaders."}
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
              className="relative rounded-3xl p-8 overflow-hidden group"
              style={{ background: "hsl(220 48% 7.5%)", border: `1px solid hsl(220 30% 14%)` }}
            >
              {/* Corner accent glow */}
              <div className="pointer-events-none absolute -top-12 -start-12 h-36 w-36 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{ background: card.accentColor }} />

              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: card.accentColor }}>
                {isAr ? card.overline_ar : card.overline_en}
              </p>
              <h3 className="text-xl font-extrabold text-white leading-tight mb-3">
                {isAr ? card.title_ar : card.title_en}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "hsl(215 20% 55%)" }}>
                {isAr ? card.desc_ar : card.desc_en}
              </p>

              {card.visual}

              <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3" style={{ color: card.accentColor }}>
                {isAr ? card.cta_ar : card.cta_en}
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
