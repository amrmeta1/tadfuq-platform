import type { Alert, AlertAction } from "./types";

export const MOCK_ALERTS: Alert[] = [
  {
    id: "a1",
    severity: "high",
    title_en: "Cash floor breach projected in 9 days",
    title_ar: "توقع اختراق الحد الأدنى للنقد خلال ٩ أيام",
    description_en:
      "Based on current burn rate, balance will drop below SAR 50,000 by next Wednesday.",
    description_ar:
      "بناءً على معدل الإنفاق الحالي، سينخفض الرصيد إلى ما دون ٥٠٬٠٠٠ ريال بحلول الأربعاء القادم.",
    why_en:
      "Outflows in the last 7 days exceeded inflows by SAR 142,000. Three large vendor payments are scheduled this week.",
    why_ar:
      "تجاوزت المدفوعات في الأيام السبعة الماضية التدفقات بمقدار ١٤٢٬٠٠٠ ريال. ثلاث مدفوعات كبيرة للموردين مجدولة هذا الأسبوع.",
    status: "open",
    created_at: new Date(Date.now() - 2 * 3_600_000).toISOString(),
    related_amount: 142_000,
  },
  {
    id: "a2",
    severity: "high",
    title_en: "Overdue receivable: Al-Noor Contracting",
    title_ar: "مستحقات متأخرة: شركة النور للمقاولات",
    description_en: "Invoice #INV-2024-089 for SAR 280,000 is 32 days overdue.",
    description_ar:
      "الفاتورة رقم INV-2024-089 بقيمة ٢٨٠٬٠٠٠ ريال متأخرة ٣٢ يومًا.",
    why_en:
      "Payment terms were Net-30. No payment received and no response to follow-up emails sent on days 15 and 25.",
    why_ar:
      "شروط الدفع كانت ٣٠ يومًا. لم يتم استلام أي دفعة ولا رد على رسائل المتابعة المرسلة في اليومين ١٥ و٢٥.",
    status: "open",
    created_at: new Date(Date.now() - 5 * 3_600_000).toISOString(),
    related_amount: 280_000,
  },
  {
    id: "a3",
    severity: "medium",
    title_en: "Unusual outflow pattern detected",
    title_ar: "نمط مدفوعات غير معتاد",
    description_en:
      "3 transactions totalling SAR 67,500 to a new payee in the last 48 hours.",
    description_ar:
      "٣ معاملات بإجمالي ٦٧٬٥٠٠ ريال لمستفيد جديد خلال الـ٤٨ ساعة الماضية.",
    why_en:
      "This payee has not appeared in your transaction history before. The transaction amounts are above your typical single-payee threshold.",
    why_ar:
      "لم يظهر هذا المستفيد في سجل معاملاتك من قبل. مبالغ المعاملات تتجاوز الحد المعتاد لمستفيد واحد.",
    status: "acknowledged",
    created_at: new Date(Date.now() - 18 * 3_600_000).toISOString(),
    related_amount: 67_500,
  },
  {
    id: "a4",
    severity: "low",
    title_en: "Bank account sync failed",
    title_ar: "فشل مزامنة الحساب البنكي",
    description_en:
      "Al Rajhi account last synced 26 hours ago. Data may be stale.",
    description_ar:
      "آخر مزامنة لحساب الراجحي كانت منذ ٢٦ ساعة. قد تكون البيانات قديمة.",
    why_en:
      "The bank API returned a 503 error during the scheduled sync at 02:00 AM. Retries have been exhausted.",
    why_ar:
      "أعادت واجهة برمجة التطبيقات البنكية خطأ 503 أثناء المزامنة المجدولة في الساعة 2:00 صباحًا. تم استنفاد إعادة المحاولات.",
    status: "open",
    created_at: new Date(Date.now() - 26 * 3_600_000).toISOString(),
  },
  {
    id: "a5",
    severity: "medium",
    title_en: "Payroll funding deadline in 3 days",
    title_ar: "موعد تمويل الرواتب بعد ٣ أيام",
    description_en:
      "SAR 320,000 payroll due on Thursday. Current liquid balance: SAR 410,000.",
    description_ar:
      "رواتب بقيمة ٣٢٠٬٠٠٠ ريال مستحقة يوم الخميس. الرصيد السائل الحالي: ٤١٠٬٠٠٠ ريال.",
    why_en:
      "Payroll is the largest recurring outflow. With 3 pending vendor payments this week, the buffer may be insufficient.",
    why_ar:
      "الرواتب هي أكبر مدفوعات متكررة. مع ٣ مدفوعات موردين معلقة هذا الأسبوع، قد يكون الهامش غير كافٍ.",
    status: "resolved",
    created_at: new Date(Date.now() - 72 * 3_600_000).toISOString(),
    related_amount: 320_000,
  },
  {
    id: "a6",
    severity: "low",
    title_en: "FX exposure: USD receivable unhedged",
    title_ar: "تعرض للعملات الأجنبية: مستحقات USD غير مغطاة",
    description_en:
      "USD 45,000 receivable from international client with no FX hedge in place.",
    description_ar:
      "مستحقات بقيمة ٤٥٬٠٠٠ دولار من عميل دولي دون تغطية مخاطر العملة.",
    why_en:
      "SAR/USD rate has moved 0.8% against you in the last 30 days. Exposure is within tolerance but worth monitoring.",
    why_ar:
      "تحرك سعر صرف الريال/الدولار بنسبة ٠٫٨٪ ضدك خلال الـ٣٠ يومًا الماضية. التعرض ضمن الحدود المقبولة لكن يستحق المتابعة.",
    status: "open",
    created_at: new Date(Date.now() - 4 * 3_600_000).toISOString(),
    related_amount: 45_000,
  },
];

const SIMULATED_DELAY = 500;

export async function fetchAlerts(): Promise<Alert[]> {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return MOCK_ALERTS;
}

export async function performAlertAction(
  id: string,
  action: AlertAction
): Promise<{ id: string; action: AlertAction }> {
  await new Promise((r) => setTimeout(r, SIMULATED_DELAY));
  return { id, action };
}
