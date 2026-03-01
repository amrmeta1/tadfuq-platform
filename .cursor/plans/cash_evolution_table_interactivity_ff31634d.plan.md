---
name: Cash Evolution Table Interactivity
overview: Add row hover tooltips (breakdown, AI insight, % contribution), soft neon-green row highlight with Framer Motion, and Export to Excel/PDF buttons with success toasts in the Cash Evolution table on the dashboard.
todos: []
isProject: false
---

# Cash Evolution Table — Premium Interactivity and Export

## Scope

All changes are confined to the **Cash Evolution** section in [frontend/app/app/dashboard/page.tsx](frontend/app/app/dashboard/page.tsx): the table block and the section header (title area). No new pages or backend.

---

## 1. Section header: Export buttons

**Location:** The existing Cash Evolution header block (lines ~565–568: title "تطور النقد" + subtitle). Add a row so the header has two parts: left (title + subtitle) and right (two buttons).

- **Layout:** Flex row, title/subtitle on one side, buttons on the other (respect RTL: in Arabic the buttons stay at the visual “end” using `flex-row` + `justify-between` or `ms-auto`).
- **Buttons:**
  - **Export to Excel** — green: `bg-emerald-600 hover:bg-emerald-700` (or use a soft green from the design system). Label: `isAr ? "تصدير إلى Excel" : "Export to Excel"`. Icon: e.g. `FileSpreadsheet` or `Download` from lucide-react.
  - **Export to PDF** — blue: `bg-primary` (existing primary blue). Label: `isAr ? "تصدير إلى PDF" : "Export to PDF"`. Icon: `FileDown` or `FileText`.
- **Behavior (mock):**
  - Excel: Call existing [exportToCSV](frontend/lib/export.ts) with table data shaped as `Record<string, unknown>[]` (one row per category, columns = Category + month keys, values from `categoryRows` + `totalRow`). Filename e.g. `cash-evolution-{date}.csv`. Then show toast.
  - PDF: Give the **table wrapper** (the `div` that contains the `<table>`) a stable `id` (e.g. `cash-evolution-table`). On click, call `exportElementAsPDF("cash-evolution-table", "cash-evolution-{date}.pdf")` from [frontend/lib/export.ts](frontend/lib/export.ts) (already supports html2canvas + jsPDF). Then show toast.
- **Toast:** Use existing `useToast()` from [frontend/components/ui/toast.tsx](frontend/components/ui/toast.tsx). On either button click: `toast({ title: isAr ? "تم التصدير بنجاح" : "Export successful", variant: "success" })`.

---

## 2. Row hover: highlight and tooltip

**Current:** Rows are `motion.tr` with `whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}`.

**Changes:**

- **Highlight:** Replace with a soft neon-green background on hover. Use a theme-friendly green (e.g. `emerald-500/12` or `green-500/15`) so it stays “neon green” but fits the light theme. Apply via `whileHover` and `className` so the total row and header-style rows can be excluded or use a subtler hover.
- **Animation:** Keep using Framer Motion on the row: e.g. `transition={{ type: "tween", duration: 0.2 }}` and `whileHover={{ backgroundColor: "..." }}` for a smooth feel.

**Tooltip (right-side, per row):**

- **Trigger:** Mouse enter/leave on each data row (exclude the total row from the rich tooltip; total row can have a simple hover or none).
- **State:** Add `const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)`. On `onMouseEnter` set `row.id`, on `onMouseLeave` clear.
- **Content (for the hovered row):**
  - **Breakdown:** One line per month that has a value, e.g. “من المبيعات: SAR 85,000” (use `row.labelAr` or `row.labelEn`, currency from `curr`, and `fmt(cell.value)`). Or a single line “إجمالي الفترة: {sum of row.months}” plus top months. Prefer a short breakdown: e.g. “من [category]: [curr] [sum]” and optionally “أعلى شهر: [month] [value]”.
  - **Percentage:** Row total = sum of `row.months[].value`; grand total = sum of `totalRow.months[].value`; contribution = (row total / grand total) * 100. Display as “نسبة من الإجمالي: X%”.
  - **AI Insight:** Short deterministic text (no API). Add a helper e.g. `getMustasharInsightForRow(row, totalRow, isAr)` that returns 1–2 sentences based on `row.type`, `row.labelEn`/`labelAr`, and share of total (e.g. “هذا البند يشكل جزءاً كبيراً من التدفقات الواردة” when share > 20%). Keep it template-based and bilingual.
- **Positioning:** Render the tooltip in a portal (e.g. `createPortal` into `document.body`). Position with `fixed` and coordinates derived from the row’s `getBoundingClientRect()`: place the tooltip to the **right** of the row (in LTR; in RTL “right” means end of row, so use `isAr ? left - tooltipWidth : right + gap`). Use a `ref` on the row to measure; update on hover. Alternatively use a single ref for the table container and compute row position from event target.
- **Design:** Dark glassmorphism: e.g. `bg-zinc-900/95 backdrop-blur-md border border-emerald-500/30` (or similar), `text-zinc-100`, rounded-lg, padding, shadow. Neon green accent on border or a small left stripe. Typography: small headings for “التفصيل” / “نسبة المساهمة” / “بصيرة مستشار” and body text. Use `dir="rtl"` when `isAr`.
- **Animation:** Wrap tooltip in `motion.div` with `initial={{ opacity: 0, x: 8 }}` and `animate={{ opacity: 1, x: 0 }}` (or from left in RTL) and `exit` for unmount. Use `AnimatePresence` when conditionally rendering so it animates out when `hoveredRowId` is null.

**Implementation note:** `<tr>` cannot hold a ref that measures the row in some layouts. Prefer wrapping the row content in a fragment and using a hidden span or the first cell’s ref to get the row position, or use `event.currentTarget.getBoundingClientRect()` in `onMouseEnter` and store the rect in state to position the tooltip (re-measure on enter).

---

## 3. Data shape for export and tooltip

- **Row total:** `row.months.reduce((s, c) => s + c.value, 0)`.
- **Grand total:** `totalRow.months.reduce((s, c) => s + c.value, 0)`.
- **Contribution %:** `(rowTotal / grandTotal) * 100`.
- **CSV export:** Build array of objects: `[ { Category: labelEn/labelAr }, ...monthKeys.reduce((o, k, i) => ({ ...o, [k]: categoryRows[r].months[i].value }), {}) ]` for each category row, then one object for total row. Use existing `formatForExport` for values and [exportToCSV](frontend/lib/export.ts) for download.

---

## 4. Files to touch


| File                                                                       | Changes                                                                                                                                                                  |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [frontend/app/app/dashboard/page.tsx](frontend/app/app/dashboard/page.tsx) | Add export buttons and toast; table wrapper `id`; hover state and tooltip; row hover style; helper `getMustasharInsightForRow`; CSV build and `exportElementAsPDF` call. |
| [frontend/lib/export.ts](frontend/lib/export.ts)                           | No change (already has `exportToCSV` and `exportElementAsPDF`).                                                                                                          |


---

## 5. Design checklist

- Hover: smooth Framer Motion, soft neon-green row background.
- Tooltip: dark glassmorphism, neon green accent, Arabic RTL when `isAr`.
- Export: green Excel button, blue PDF button; toast “تم التصدير بنجاح” / “Export successful”.
- Keep existing light theme and RTL; total row keeps current style (strong border, muted bg), optional lighter hover for total row or no tooltip.

---

## 6. Optional refinement

- **Excel:** If you later want real .xlsx, add a dependency (e.g. `xlsx`) and a small helper in `lib/export.ts`; for this task, CSV-as-Excel is acceptable as “mock” and already delivers a file.

