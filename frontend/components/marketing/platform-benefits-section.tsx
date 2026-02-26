"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";
import {
  Shield,
  Brain,
  GitMerge,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CARDS: {
  id: string;
  icon: LucideIcon;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  glow: string;
}[] = [
  {
    id: "agents",
    icon: Brain,
    titleEn: "Agentic AI: Raqib, Mutawaqi, Mustashar",
    titleAr: "وكلاء AI: رقيب، متوقع، مستشار",
    descEn: "Three AI agents watch, forecast, and advise on your cash—24/7, GCC-aware.",
    descAr: "ثلاثة وكلاء AI يراقبون ويتوقعون وينصحون في سيولتك—على مدار الساعة، واعون بمنطقة الخليج.",
    glow: "shadow-neon/20",
  },
  {
    id: "project",
    icon: TrendingUp,
    titleEn: "Project Cash Flow & Consolidation",
    titleAr: "تدفق نقدي للمشاريع والتوحيد",
    descEn: "Per-project visibility and group consolidation for holding companies.",
    descAr: "رؤية لكل مشروع وتوحيد مجموعة للشركات القابضة.",
    glow: "shadow-gold/20",
  },
  {
    id: "consolidation",
    icon: GitMerge,
    titleEn: "Group Consolidation",
    titleAr: "توحيد المجموعة",
    descEn: "Multi-entity rollups, intercompany netting, and group reporting.",
    descAr: "تجمعات متعددة الكيانات ومقاصة بين الشركات وتقارير المجموعة.",
    glow: "shadow-neon/20",
  },
  {
    id: "compliance",
    icon: Shield,
    titleEn: "GCC Compliance & ZATCA VAT",
    titleAr: "الامتثال الخليجي وضريبة القيمة المضافة",
    descEn: "ZATCA-ready VAT isolation, Zakat calendar, and audit trails.",
    descAr: "عزل ضريبة القيمة المضافة جاهز للزاتكا، تقويم الزكاة، ومسارات التدقيق.",
    glow: "shadow-gold/20",
  },
];

export function PlatformBenefitsSection() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  return (
    <section id="platform" className="py-20 md:py-28 bg-landing-darker overflow-hidden" aria-labelledby="platform-heading">
      <div id="resources" className="scroll-mt-24" aria-hidden />
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex rounded-full border border-neon/30 bg-neon/10 px-4 py-1.5 text-xs font-medium text-neon mb-4">
            {isAr ? "المنصة" : "Platform"}
          </span>
          <h2 id="platform-heading" className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            {isAr ? "مصمم لشركات الخليج" : "Built for GCC Enterprises"}
          </h2>
          <p className="text-zinc-400 mt-4 max-w-2xl mx-auto text-lg">
            {isAr
              ? "كل ميزة مصممة لمتطلبات الامتثال والعمليات في منطقة الخليج."
              : "Every feature purpose-built for GCC compliance and operational realities."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                id={card.id === "agents" ? "agents" : undefined}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={cn(
                  "group relative rounded-2xl border border-white/10 bg-white/5 p-8 transition-all duration-300",
                  "hover:border-neon/30 hover:bg-white/[0.07] hover:shadow-[0_0_40px_-10px_rgba(0,255,170,0.25)]"
                )}
              >
                <div className="absolute inset-0 rounded-2xl bg-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neon/10 text-neon mb-5">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isAr ? card.titleAr : card.titleEn}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    {isAr ? card.descAr : card.descEn}
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
