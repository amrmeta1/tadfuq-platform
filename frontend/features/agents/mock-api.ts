import type { Agent, BriefItem } from "./types";

const DELAY = 400;
const delay = (ms = DELAY) => new Promise((r) => setTimeout(r, ms));

export const MOCK_AGENTS: Agent[] = [
  {
    id: "raqib",
    name_en: "Raqib",
    name_ar: "رقيب",
    role_en: "Cash Monitor",
    role_ar: "مراقب السيولة",
    description_en:
      "Watches real-time cash positions across all connected accounts. Detects anomalies, unusual outflow patterns, and triggers alerts the moment a threshold is breached.",
    description_ar:
      "يراقب مراكز النقد في الوقت الفعلي عبر جميع الحسابات المرتبطة. يكتشف الشذوذات وأنماط المدفوعات غير المعتادة، ويطلق التنبيهات فور اختراق أي حد.",
    status: "active",
    enabled: true,
    last_run_at: new Date(Date.now() - 12 * 60_000).toISOString(),
    next_run_at: new Date(Date.now() + 48 * 60_000).toISOString(),
    run_count: 1847,
    icon_key: "activity",
    accent: "blue",
  },
  {
    id: "mutawaqi",
    name_en: "Mutawaqi'",
    name_ar: "متوقع",
    role_en: "Forecasting Engine",
    role_ar: "محرك التوقعات",
    description_en:
      "Generates 13-week and 30-day cash flow forecasts using ML models trained on your historical transaction patterns, seasonality, and payment cycles.",
    description_ar:
      "يولّد توقعات التدفق النقدي لـ١٣ أسبوعًا و٣٠ يومًا باستخدام نماذج تعلم آلي مدربة على أنماط معاملاتك التاريخية والموسمية ودورات الدفع.",
    status: "active",
    enabled: true,
    last_run_at: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    next_run_at: new Date(Date.now() + 21 * 3_600_000).toISOString(),
    run_count: 312,
    icon_key: "trending-up",
    accent: "violet",
  },
  {
    id: "mustashar",
    name_en: "Mustashar",
    name_ar: "مستشار",
    role_en: "Decision Advisor",
    role_ar: "مستشار القرارات",
    description_en:
      "Synthesises outputs from Raqib and Mutawaqi' into a daily morning brief and actionable recommendations. Surfaces the single most important action for the CFO each day.",
    description_ar:
      "يجمع مخرجات رقيب ومتوقع في ملخص صباحي يومي وتوصيات قابلة للتنفيذ. يُبرز الإجراء الأهم للمدير المالي كل يوم.",
    status: "idle",
    enabled: true,
    last_run_at: new Date(Date.now() - 8 * 3_600_000).toISOString(),
    next_run_at: new Date(Date.now() + 16 * 3_600_000).toISOString(),
    run_count: 89,
    icon_key: "zap",
    accent: "amber",
  },
];

export const MOCK_BRIEF: BriefItem[] = [
  {
    id: "b1",
    time: "07:01",
    agent_id: "raqib",
    agent_name_en: "Raqib",
    agent_name_ar: "رقيب",
    type: "insight",
    message_en:
      "Cash position across 2 accounts: SAR 820,000 — up 4.2% vs last week. Liquidity ratio is healthy at 2.4×.",
    message_ar:
      "مركز النقد عبر حسابين: ٨٢٠٬٠٠٠ ريال — أعلى بنسبة ٤٫٢٪ مقارنةً بالأسبوع الماضي. نسبة السيولة صحية عند ٢٫٤×.",
  },
  {
    id: "b2",
    time: "07:01",
    agent_id: "raqib",
    agent_name_en: "Raqib",
    agent_name_ar: "رقيب",
    type: "alert",
    message_en:
      "Detected a 15% increase in delayed receivables vs 30-day average. INV-2024-089 (SAR 280k) is now 32 days overdue — escalation recommended.",
    message_ar:
      "رصد ارتفاعًا بنسبة ١٥٪ في المستحقات المتأخرة مقارنةً بمتوسط ٣٠ يومًا. الفاتورة INV-2024-089 (٢٨٠ ألف ريال) متأخرة ٣٢ يومًا — يُوصى بالتصعيد.",
  },
  {
    id: "b3",
    time: "07:02",
    agent_id: "mutawaqi",
    agent_name_en: "Mutawaqi'",
    agent_name_ar: "متوقع",
    type: "forecast",
    message_en:
      "13-week forecast updated. Base scenario: positive net cash flow in 11 of 13 weeks. Pessimistic scenario flags a SAR 42k shortfall in week 4 if the overdue receivable remains uncollected.",
    message_ar:
      "تم تحديث توقعات ١٣ أسبوعًا. السيناريو الأساسي: صافي تدفق نقدي إيجابي في ١١ من ١٣ أسبوعًا. السيناريو المتشائم يُشير إلى عجز ٤٢ ألف ريال في الأسبوع الرابع إذا لم يُحصَّل المستحق المتأخر.",
  },
  {
    id: "b4",
    time: "07:02",
    agent_id: "mutawaqi",
    agent_name_en: "Mutawaqi'",
    agent_name_ar: "متوقع",
    type: "forecast",
    message_en:
      "Payroll SAR 320k due Thursday. Post-payroll projected balance: SAR 500k — above the SAR 50k cash floor. No immediate action required.",
    message_ar:
      "رواتب بقيمة ٣٢٠ ألف ريال مستحقة يوم الخميس. الرصيد المتوقع بعد الرواتب: ٥٠٠ ألف ريال — أعلى من الحد الأدنى ٥٠ ألف ريال. لا يلزم اتخاذ إجراء فوري.",
  },
  {
    id: "b5",
    time: "07:03",
    agent_id: "mustashar",
    agent_name_en: "Mustashar",
    agent_name_ar: "مستشار",
    type: "action",
    message_en:
      "Priority action for today: Contact Al-Noor Contracting regarding INV-2024-089. A SAR 100k partial payment would eliminate the week-4 shortfall risk entirely.",
    message_ar:
      "الإجراء ذو الأولوية لليوم: التواصل مع شركة النور للمقاولات بشأن الفاتورة INV-2024-089. دفعة جزئية بقيمة ١٠٠ ألف ريال ستُزيل مخاطر العجز في الأسبوع الرابع كليًا.",
  },
  {
    id: "b6",
    time: "07:03",
    agent_id: "mustashar",
    agent_name_en: "Mustashar",
    agent_name_ar: "مستشار",
    type: "insight",
    message_en:
      "Secondary consideration: SAR/USD exposure of USD 45k is within tolerance. No hedge action needed this week.",
    message_ar:
      "اعتبار ثانوي: تعرض الريال/الدولار بقيمة ٤٥ ألف دولار ضمن الحدود المقبولة. لا يلزم اتخاذ إجراء تحوط هذا الأسبوع.",
  },
];

export async function fetchAgents(): Promise<Agent[]> {
  await delay();
  return MOCK_AGENTS;
}

export async function fetchBrief(): Promise<BriefItem[]> {
  await delay(300);
  return MOCK_BRIEF;
}

export async function apiToggleAgent(
  id: string,
  enabled: boolean
): Promise<{ id: string; enabled: boolean }> {
  await delay();
  return { id, enabled };
}

export async function apiRunAgent(id: string): Promise<{ id: string }> {
  await delay(800);
  return { id };
}
