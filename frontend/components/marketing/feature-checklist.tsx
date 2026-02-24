"use client";

import { motion } from "framer-motion";
import {
  Building2, BarChart3, Shield, MessageCircle, GitMerge, TrendingUp,
  CheckCircle2, Calendar, FileText, Zap,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

// ── Data ──────────────────────────────────────────────────────────────────────

interface Feature {
  icon: React.ElementType;
  title_en: string;
  title_ar: string;
  desc_en: string;
  desc_ar: string;
}

const FEATURES: Feature[] = [
  {
    icon: Building2,
    title_en: "Real-time connections to GCC banks.",
    title_ar: "اتصالات آنية ببنوك الخليج.",
    desc_en: "Unify QNB, CBQ, HSBC, Masraf Al Rayan and 9,900+ banks to automate, move, and control liquidity.",
    desc_ar: "وحّد QNB وCBQ وHSBC ومصرف الريان وأكثر من 9,900 بنك للتحكم الكامل في السيولة.",
  },
  {
    icon: BarChart3,
    title_en: "A single source of liquidity truth.",
    title_ar: "مصدر واحد لحقيقة السيولة.",
    desc_en: "Centralize financial projections to drive data-driven liquidity decision-making across your group.",
    desc_ar: "مركزة التوقعات المالية لاتخاذ قرارات سيولة مبنية على البيانات عبر مجموعتك.",
  },
  {
    icon: Shield,
    title_en: "Actionable ZATCA compliance.",
    title_ar: "امتثال الزكاة والضريبة قابل للتنفيذ.",
    desc_en: "Ring-fence VAT automatically. Zero exposure to compliance penalties. Built for Saudi e-invoicing.",
    desc_ar: "احجز ضريبة القيمة المضافة تلقائيًا. صفر تعرض لغرامات الامتثال. مصمم للفاتورة الإلكترونية السعودية.",
  },
  {
    icon: TrendingUp,
    title_en: "Precision 13-week forecasting.",
    title_ar: "توقع دقيق لـ 13 أسبوعًا.",
    desc_en: "Project cash, liquidity and exposures with 87% average accuracy and improved flexibility for GCC businesses.",
    desc_ar: "توقع التدفقات النقدية والسيولة بدقة متوسطة 87٪ ومرونة محسّنة لشركات الخليج.",
  },
  {
    icon: MessageCircle,
    title_en: "AI WhatsApp collections.",
    title_ar: "تحصيل ذكي عبر واتساب.",
    desc_en: "Let Mustashar AI draft and send polite payment reminders via WhatsApp — automatically.",
    desc_ar: "دع مستشار AI يصيغ ويرسل تذكيرات الدفع المهذبة عبر واتساب تلقائيًا.",
  },
  {
    icon: GitMerge,
    title_en: "Group consolidation in real time.",
    title_ar: "توحيد المجموعة في الوقت الفعلي.",
    desc_en: "One view across all subsidiaries, entities, and currencies — no spreadsheets, no end-of-month scramble.",
    desc_ar: "رؤية واحدة عبر جميع الشركات التابعة والكيانات والعملات — بدون جداول بيانات.",
  },
  {
    icon: Calendar,
    title_en: "Cash calendar & danger alerts.",
    title_ar: "تقويم نقدي وتنبيهات خطر.",
    desc_en: "Visual monthly calendar showing every inflow, outflow, and overdraft risk day before it hits.",
    desc_ar: "تقويم شهري مرئي يعرض كل تدفق داخل وخارج وأيام خطر السحب المكشوف قبل وقوعها.",
  },
  {
    icon: FileText,
    title_en: "One-click board reports.",
    title_ar: "تقارير مجلس الإدارة بنقرة.",
    desc_en: "Generate a print-perfect A4 board report with AI narrative, KPIs, and cash flow charts in minutes.",
    desc_ar: "أنشئ تقرير مجلس الإدارة A4 المثالي مع سرد الذكاء الاصطناعي ومؤشرات الأداء في دقائق.",
  },
  {
    icon: Zap,
    title_en: "Approval workflows & audit trail.",
    title_ar: "سير عمل الموافقات وسجل التدقيق.",
    desc_en: "Multi-level payment approvals with a complete, immutable audit trail for compliance.",
    desc_ar: "موافقات دفع متعددة المستويات مع سجل تدقيق كامل وغير قابل للتغيير للامتثال.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function FeatureChecklist() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <section className="mt-32 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-white mb-4">
            {isAr
              ? "هل توفر منصتك هذا؟"
              : "Does your platform offer you this?"}
          </h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: "hsl(215 20% 55%)" }}>
            {isAr
              ? "كل ميزة مصممة خصيصًا لمتطلبات الامتثال والعمليات في منطقة الخليج."
              : "Every feature purpose-built for GCC compliance requirements and operational realities."}
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title_en}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
                className="flex gap-4 rounded-2xl p-5 group hover:border-opacity-40 transition-all duration-300"
                style={{ background: "hsl(220 48% 7.5%)", border: "1px solid hsl(220 30% 13%)" }}
              >
                <div className="shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "hsl(174 80% 44% / 0.1)" }}>
                    <Icon className="h-4.5 w-4.5" style={{ color: "hsl(174 80% 55%)" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-start gap-2 mb-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white leading-snug">
                      {isAr ? feat.title_ar : feat.title_en}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "hsl(215 20% 50%)" }}>
                    {isAr ? feat.desc_ar : feat.desc_en}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
