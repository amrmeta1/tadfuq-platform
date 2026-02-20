"use client";

import { motion } from "framer-motion";
import { Wand2, Shield, MessageCircle, LineChart } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

// ── Bento card data ───────────────────────────────────────────────────────────

const CARDS = [
  {
    id: "import",
    colSpan: "md:col-span-2",
    icon: Wand2,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
    title_en: "Zero-Touch Import",
    title_ar: "استيراد بدون لمس",
    desc_en: "Drop a messy CSV. Get a clean ledger in seconds mapped to GCC standards.",
    desc_ar: "أفلت ملف CSV فوضويًا. احصل على دفتر أستاذ نظيف في ثوانٍ مرسوم وفق معايير الخليج.",
  },
  {
    id: "vat",
    colSpan: "md:col-span-1",
    icon: Shield,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    title_en: "Smart VAT Isolation",
    title_ar: "عزل ضريبة القيمة المضافة",
    desc_en: "Never spend tax money by mistake again. Auto-calculated liabilities, locked away.",
    desc_ar: "لا تنفق أموال الضريبة بالخطأ مجددًا. التزامات محسوبة تلقائيًا ومجمدة.",
  },
  {
    id: "whatsapp",
    colSpan: "md:col-span-1",
    icon: MessageCircle,
    iconColor: "text-green-400",
    iconBg: "bg-green-500/10",
    title_en: "AI WhatsApp Collections",
    title_ar: "تحصيل عبر واتساب بالذكاء الاصطناعي",
    desc_en: "Let Mustashar draft and send polite payment reminders instantly via WhatsApp.",
    desc_ar: "دع مستشار يصيغ ويرسل تذكيرات دفع مهذبة فورًا عبر واتساب.",
  },
  {
    id: "sandbox",
    colSpan: "md:col-span-2",
    icon: LineChart,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-500/10",
    title_en: "Interactive What-If Sandbox",
    title_ar: "بيئة تجريبية تفاعلية",
    desc_en: "Slide the dials to simulate revenue drops or delayed payments in real-time.",
    desc_ar: "حرك الأشرطة لمحاكاة انخفاض الإيرادات أو تأخر المدفوعات في الوقت الفعلي.",
  },
] as const;

// ── Component ────────────────────────────────────────────────────────────────

export function FeaturesGrid() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <section id="features" className="mt-32 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Section title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl md:text-4xl font-bold text-white text-center"
        >
          {isAr ? "مصمم لشركات الشرق الأوسط" : "Built for Middle East Businesses"}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-zinc-400 text-center mt-4 max-w-xl mx-auto"
        >
          {isAr
            ? "كل ميزة مصممة خصيصًا لمتطلبات الامتثال والعمليات في منطقة الخليج."
            : "Every feature purpose-built for GCC compliance requirements and operational realities."}
        </motion.p>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
                className={`${card.colSpan} relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 transition-colors group`}
              >
                {/* Subtle inner glow on hover */}
                <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-white/5 to-transparent" />

                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg} mb-5`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  {isAr ? card.title_ar : card.title_en}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {isAr ? card.desc_ar : card.desc_en}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
