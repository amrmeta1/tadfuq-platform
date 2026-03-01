---
name: AI Advisor Page UI
overview: Add a standalone AI Advisor page at `/app/ai-advisor` with four UI sections (AIDailyBrief, ActiveCasesPanel with CaseDrawer, SimulationModal, DriversPopover), using local mock data only and existing design system. No Dashboard or API changes.
todos: []
isProject: false
---

# AI Advisor Page — UI Only

## Route decision

- **Existing:** [frontend/app/app/daily-brief/page.tsx](frontend/app/app/daily-brief/page.tsx) exists (Daily Brief with Raqib/Mutawaqi/Mustashar).
- **Choice:** Create a **new route** `/app/ai-advisor` and build all new sections there. This keeps the current daily-brief page unchanged and matches the “standalone AI Advisor page” requirement. No changes to [frontend/app/app/dashboard/page.tsx](frontend/app/app/dashboard/page.tsx).

---

## Files to create


| File                                                                                             | Purpose                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [frontend/components/ui/popover.tsx](frontend/components/ui/popover.tsx)                         | Radix Popover wrapper (project has `@radix-ui/react-popover`; no `ui/popover.tsx` yet). Required for DriversPopover.                                                                                 |
| [frontend/components/agent/AIDailyBrief.tsx](frontend/components/agent/AIDailyBrief.tsx)         | Top section: title “ملخص الوكيل المالي اليومي”, Risks/Opportunities/Recommendations, Confidence/Data Quality badges, timestamp, CTAs. Static JSON inside.                                            |
| [frontend/components/agent/ActiveCasesPanel.tsx](frontend/components/agent/ActiveCasesPanel.tsx) | List of case cards; each card: title, severity badge, impact (QAR), due date, top 2 drivers, recommendation; click opens CaseDrawer. Mock cases in component.                                        |
| [frontend/components/agent/CaseDrawer.tsx](frontend/components/agent/CaseDrawer.tsx)             | Sheet (RTL-aware `side`: left in AR, right in EN). Content: case summary, mock timeline, action buttons (Simulate, Mark Resolved, Send Reminder) — UI only.                                          |
| [frontend/components/agent/SimulationModal.tsx](frontend/components/agent/SimulationModal.tsx)   | Dialog: type selector (delay / split / accelerate), inputs (days, %), mocked result (Delta Cash, Risk Level, Confidence %). No real logic.                                                           |
| [frontend/components/agent/DriversPopover.tsx](frontend/components/agent/DriversPopover.tsx)     | “لماذا؟” trigger; popover shows top 3 drivers with amounts. Mock data per invocation.                                                                                                                |
| [frontend/app/app/ai-advisor/page.tsx](frontend/app/app/ai-advisor/page.tsx)                     | Page layout: `dir`/locale from useI18n; render AIDailyBrief, ActiveCasesPanel, button to open SimulationModal; wire DriversPopover into AIDailyBrief (per recommendation) and case cards (per card). |


---

## Implementation details

### 1. Popover (design system)

- Add [frontend/components/ui/popover.tsx](frontend/components/ui/popover.tsx) using `@radix-ui/react-popover`: export `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor` with same patterns as existing [frontend/components/ui/sheet.tsx](frontend/components/ui/sheet.tsx) (cn, border, shadow). RTL: use logical classes or `side`/`align` so content flips when `dir="rtl"`.

### 2. AIDailyBrief.tsx

- **Title:** “🤖 ملخص الوكيل المالي اليومي” (Arabic as per spec; can add `isAr` and show EN title when locale is en).
- **Data:** Static JSON object inside the file, e.g. `{ risks: [...], opportunities: [...], recommendations: [...], confidence: 82, dataQuality: 91, lastUpdated: "..." }`.
- **Sections:** Three blocks (Risks, Opportunities, Recommendations) using [frontend/components/ui/card.tsx](frontend/components/ui/card.tsx), [frontend/components/ui/badge.tsx](frontend/components/ui/badge.tsx).
- **Badges:** Confidence (82%), Data Quality (91%), Last updated timestamp.
- **CTAs:** Three buttons: “عرض الحالات”, “تشغيل محاكاة”, “تصدير التقرير الأسبوعي”. “عرض الحالات” scrolls or links to cases section; “تشغيل محاكاة” opens SimulationModal (callback prop); “تصدير التقرير الأسبوعي” is UI only (no export).
- **Drivers:** Each recommendation row includes a “لماذا؟” button that opens `DriversPopover` with mock drivers (e.g. top 3 with label + amount).

### 3. ActiveCasesPanel.tsx

- **Data:** Mock array of cases, e.g. `{ id, title, severity, impactAmount, dueDate, drivers: [2 items], recommendation }`. Severity: High/Medium/Low; impact in QAR (use `useCurrency().fmt` for display).
- **Layout:** Grid or list of cards (Card + CardHeader + CardContent). Each card: title, severity Badge, impact, due date, two drivers, short recommendation.
- **Interaction:** `onCaseSelect(case)` or set selected case id; parent (page) controls `<CaseDrawer open={!!selected} case={selected} onClose={() => setSelected(null)} />`. “لماذا؟” on each card opens DriversPopover with mock top 3 drivers.

### 4. CaseDrawer.tsx

- **Shell:** [frontend/components/ui/sheet.tsx](frontend/components/ui/sheet.tsx) with `side={isAr ? "left" : "right"}` so it opens from the correct side in RTL.
- **Content:** Case summary (title, severity, impact, due date, recommendation); mock timeline (e.g. 3–4 events with time + text); three action buttons: Simulate, Mark Resolved, Send Reminder. Buttons do not call APIs; optional `onSimulate` could close drawer and open SimulationModal.

### 5. SimulationModal.tsx

- **Shell:** [frontend/components/ui/dialog.tsx](frontend/components/ui/dialog.tsx).
- **Form (mock):** Radio or select for type: “Delay payment” / “Split payment” / “Accelerate receivable”. Inputs: “Number of days” (number), “Percentage split” (number, e.g. for split). No validation beyond basic input.
- **Result block:** Static or one-time mock: “Delta Cash: +X QAR”, “Risk Level: Low/Medium/High”, “Confidence: 85%”. No real calculations.

### 6. DriversPopover.tsx

- **API:** `children` (trigger, e.g. “لماذا؟” button), optional `drivers?: { label: string; amount: number }[]` (default: mock 3 drivers). Use PopoverTrigger + PopoverContent; content lists drivers with formatted amounts (useCurrency().fmt).
- **Usage:** In AIDailyBrief next to each recommendation; in ActiveCasesPanel on each case card.

### 7. ai-advisor/page.tsx

- **Layout:** `dir={dir}` on container; `max-w-6xl mx-auto px-4 py-8` (same pattern as [frontend/app/app/daily-brief/page.tsx](frontend/app/app/daily-brief/page.tsx)).
- **State:** `selectedCase` (for CaseDrawer), `simulationOpen` (for SimulationModal).
- **Composition:**  
  - `<AIDailyBrief onOpenSimulation={() => setSimulationOpen(true)} />` (and optionally scroll to cases or set state for “عرض الحالات”).  
  - `<ActiveCasesPanel selectedCase={selectedCase} onSelectCase={setSelectedCase} />`.  
  - `<CaseDrawer case={selectedCase} open={!!selectedCase} onClose={() => setSelectedCase(null)} onSimulate={() => { setSelectedCase(null); setSimulationOpen(true); }} />`.  
  - `<SimulationModal open={simulationOpen} onClose={() => setSimulationOpen(false)} />`.
- **No** API routes, no fetch, no LLM. Use `useI18n` and `useCurrency` for RTL and QAR formatting.

---

## RTL and i18n

- Page and all agent components use `useI18n()` for `dir` and `locale`; pass `isAr` where needed for labels.
- Sheet `side` and any directional styling use logical (start/end) or `isAr` so RTL layout stays correct.
- Currency: use `useCurrency().fmt` for all amounts (QAR as per spec; app already supports SAR/QAR in CurrencyContext).

---

## Acceptance checklist (from spec)

- `/ai-advisor` renders without errors.
- Daily Brief (AIDailyBrief) visible and styled.
- Cases visible and interactive; clicking a case opens CaseDrawer; drawer closes correctly.
- Simulation modal opens (from CTA and/or from drawer) and closes.
- “لماذا؟” (DriversPopover) works from AIDailyBrief and from case cards.
- No changes to dashboard.
- No API routes created.
- No unused imports; clean TypeScript.

---

## Optional (out of scope for Phase 1)

- Add a link/button on the daily-brief page to “AI Advisor” (`/app/ai-advisor`) so users can navigate there (single link; no structural change to daily-brief).
- Nav/sidebar entry for “AI Advisor” if desired (spec did not require it).

