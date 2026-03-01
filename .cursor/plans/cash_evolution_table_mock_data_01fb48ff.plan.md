---
name: Cash Evolution Table Mock Data
overview: Fill the Cash Evolution section table on the main dashboard with 12 months (Oct 2024–Sep 2025) of realistic inflow mock data for the eight requested categories plus a total row, add percentages and green styling for positive values, and keep Arabic RTL/Cairo.
todos: []
isProject: false
---

# Cash Evolution Table — Rich Mock Data (12 Months)

## Scope

- **File**: [frontend/app/app/dashboard/page.tsx](frontend/app/app/dashboard/page.tsx)
- **Section**: Cash Evolution (chart + table below it)
- **Range**: 12 months — Oct 2024 through Sep 2025 (inclusive)
- **Preview**: The marketing [dashboard-preview-section.tsx](frontend/components/marketing/dashboard-preview-section.tsx) is a separate “13 Weeks” bar placeholder; no change there. “Regenerate the preview” = make the main dashboard’s Cash Evolution block look complete when viewed in the app.

---

## 1. Restrict chart and table to 12 months (Oct 2024 → Sep 2025)

**In `buildCashEvolutionData` (lines ~118–156):**

- Today the loop builds Oct 2024 → Nov 2025 (14 months). Change the range so the last month is **September 2025** (e.g. when `y === 2025` use `end = 9` instead of `11`).
- This will yield exactly 12 `CashEvolutionPoint` entries and 12 `monthKeys` (e.g. `Oct 24`, `Nov 24`, … `Sep 25`).

**In the Cash Evolution header (lines ~537–540):**

- Update the subtitle from “Oct 2024 — Nov 2025” to **“Oct 2024 — Sep 2025”** (and the Arabic equivalent: “أكتوبر 2024 — سبتمبر 2025”).

---

## 2. Replace table data with 8 categories + total row

**Categories (left column) — exactly as requested:**


| English                        | Arabic (existing or add)          |
| ------------------------------ | --------------------------------- |
| Cash Inflow from Sales         | وارد مبيعات                       |
| Loans                          | قروض                              |
| Other Cash Inflow              | وارد نقدي آخر                     |
| Funding round                  | جولة تمويل                        |
| Short-term deposit investments | استثمارات ودائع قصيرة الأجل (new) |
| Other income from investment   | إيراد استثمار آخر                 |
| Uncategorized                  | غير مصنف                          |
| Internal transfers             | تحويلات داخلية                    |


**Changes in `buildCategoryTableRows` (lines ~170–188):**

- **Remove** the two current header rows: “Cash balance at the beginning of the month” and “Cash inflow”.
- **Return only the 8 category rows** above, each with **12 monthly values** (aligned to the 12-month range).
- **Add “Short-term deposit investments”** with EN/AR labels.
- **Realistic values**:
  - Cash Inflow from Sales: main driver; e.g. 200k–3.2M spread across months, some months stronger (e.g. 52%, 20%, 10% of month total where relevant).
  - Loans: a few large amounts in selected months (e.g. 2M–6.5M), others 0.
  - Other Cash Inflow: sporadic (e.g. 0, 0, 500k, 200k, …).
  - Funding round: 0 for most months, one or two months with a large round (e.g. 5M, 0, …).
  - Short-term deposit investments: small positive amounts or interest-like (e.g. 20k–80k).
  - Other income from investment: occasional (e.g. 0, 50k, 0, 30k, …).
  - Uncategorized: low/medium in a few months (e.g. 10k–80k), rest 0.
  - Internal transfers: mix of 0 and moderate values so totals stay consistent.
- **Percentages**: For “important” rows (e.g. Cash Inflow from Sales, Loans when non-zero), set `pct` for some months (e.g. 52%, 20%, 10%) so they display next to the value in the table.
- **Total row**: Do **not** add it inside `buildCategoryTableRows`. Instead, in the page component, **compute one total row** from the 8 category rows (sum per month). Give it a distinct structure (e.g. `id: "total"`, `type: "total"`).

**Type update for total row:**

- Extend `CategoryTableRow["type"]` with `"total"` (line ~165) so the total row can be styled differently (bold, border-top, no green dot).

---

## 3. Table rendering updates

**Total row (in JSX, ~558–585):**

- After the existing `categoryRows.filter(...).map(...)` loop, render a **single total row**:
  - Use the computed total row (sum of the 8 categories per month).
  - `type === "total"`: no green/red dot, bold label, optional top border (e.g. `border-t-2 border-border`).
  - Cells: monthly totals, formatted like other rows; no percentage. Style as bold or neutral (no green needed for “total” unless you want totals in green; plan assumes neutral/bold for total).

**Green for positive inflow numbers:**

- In the `<td>` that renders `cell.value` (and optional `cell.pct`), when `row.type === "inflow"` and `cell.value > 0`, add a class for green text (e.g. `text-positive` or `text-emerald-600 dark:text-emerald-400`) on the value so positive inflow amounts appear green. Zero or “—” can stay default color.

**RTL / Cairo:**

- No code change: the page already uses `dir={dir}` and the app’s global Cairo font; ensure the new Arabic label for “Short-term deposit investments” is used in the row so RTL and font apply automatically.

---

## 4. Data shape summary

- **12 months**: `Oct 24, Nov 24, Dec 24, Jan 25, Feb 25, Mar 25, Apr 25, May 25, Jun 25, Jul 25, Aug 25, Sep 25`.
- **8 rows** from `buildCategoryTableRows`; **1 total row** computed in the page.
- **Percentages**: e.g. Sales row: 52%, 20%, 10% in selected months; Loans row: one or two pct values where relevant; others optional.
- **Realism**: Some months with 0 or low values for Loans, Funding round, Other income, Uncategorized; Sales and a couple of others drive most of the inflow with a few peak months.

---

## 5. Files to touch


| File                                                                       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [frontend/app/app/dashboard/page.tsx](frontend/app/app/dashboard/page.tsx) | 1) `buildCashEvolutionData`: 12-month range ending Sep 2025. 2) Subtitle “Oct 2024 — Sep 2025”. 3) `CategoryTableRow`: add `"total"` to type. 4) `buildCategoryTableRows`: remove 2 header rows; add 8 category rows with 12 values + optional pcts; add “Short-term deposit investments” EN/AR. 5) In component: compute `totalRow` from 8 rows (sum per month), render after filtered rows. 6) Table cells: green class for positive inflow values; total row styling (bold, border-top, no dot). |


No changes to [frontend/components/marketing/dashboard-preview-section.tsx](frontend/components/marketing/dashboard-preview-section.tsx) or dictionaries unless you want the subtitle text to come from i18n later (optional).

---

## 6. Optional (not required for this plan)

- Move “Oct 2024 — Sep 2025” and the new Arabic label into [frontend/lib/i18n/dictionaries.ts](frontend/lib/i18n/dictionaries.ts) for consistency.
- Export a small constant (e.g. `CASH_EVOLUTION_MONTHS = 12`) or derive the range from a single source of truth to keep chart and table in sync.

