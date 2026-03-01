---
name: ForecastChart scenario UX upgrade
overview: "Upgrade the ForecastChart component in features/forecast/forecast-chart.tsx so Base vs Scenario is visually clear and decision-oriented: swap line styles (base solid/primary, scenario dashed/purple/thicker), enhance tooltip with impact label, add ReferenceArea highlights for impacted points, and add an optional Scenario Summary badge when activeScenario is passed in. No API calls or chart-library refactor."
todos: []
isProject: false
---

# ForecastChart Scenario Comparison UX Upgrade

## Scope

- **Single file to modify:** [frontend/features/forecast/forecast-chart.tsx](frontend/features/forecast/forecast-chart.tsx)
- **Optional parent change:** [frontend/app/app/scenario-planner/page.tsx](frontend/app/app/scenario-planner/page.tsx) to pass `activeScenario` and `currencyCode` into `ForecastChart` when the badge is desired
- **No changes:** chart library, other chart components, API

## Current state

- **ForecastChart** is used on the Scenario Planner page; it receives `data: SimulatedDay[]` with `label`, `baseBalance`, and `simulatedBalance` per point.
- Base is drawn as a **dashed** muted line; simulated as **solid** purple line with area fill.
- Tooltip already shows week label, Base, Simulated, and Variance (delta).

---

## 1) Base vs Scenario line styling (invert)

**Goal:** Base = solid, primary; Scenario = dashed, purple, slightly thicker.

- **Base (currently dashed muted):** Change to **solid** line and **primary** color. Use `stroke="hsl(var(--primary))"` (or existing primary from theme), `strokeWidth={2}`, `strokeDasharray={0}` (or omit), `dot={false}`.
- **Scenario (currently solid purple Area):** Keep purple fill optional or light; change **line** to **dashed** and **slightly thicker** than base (e.g. base 2, scenario 2.5). Use `stroke="hsl(243 75% 59%)"` (or similar purple), `strokeDasharray="6 4"`, `strokeWidth={2.5}`.

Keep existing `<Line>` for base and `<Area>` for scenario (area can stay for emphasis); ensure the visual hierarchy matches the spec (base = solid primary, scenario = dashed purple thicker).

---

## 2) Tooltip enhancement

**Goal:** Same week label, Base value, Scenario value, Delta, plus an **Impact** line.

- Keep existing rows: Week label, Base value, Scenario value (rename label to "Scenario" if desired), Delta = scenario - base.
- **Add Impact label:**
  - If `delta > 0`: e.g. "Positive liquidity shift" (and Arabic equivalent: e.g. "تحسن في السيولة").
  - If `delta < 0`: e.g. "Negative liquidity impact" (and Arabic: e.g. "تأثير سلبي على السيولة").
  - If `delta === 0`: optional "No change" / "بدون تغيير".
- Use existing `ForecastTooltip` props `fmt`, `isAr`; add the impact line below the Delta row, with appropriate color (emerald for positive, rose for negative).

---

## 3) Highlight impacted weeks (ReferenceArea)

**Goal:** Where `simulatedBalance !== baseBalance`, add a subtle vertical band under that segment.

- Compute **segments** from `data`: consecutive indices where `simulatedBalance !== baseBalance`. Each segment is a run of such indices; convert to `{ x1: data[i].label, x2: data[j].label }` (or use index if Recharts expects it).
- Render one `<ReferenceArea>` per segment (Recharts `ReferenceArea` with `x1`, `x2` for band between two x-axis values). Use a subtle fill, e.g. `fill="hsl(243 75% 59% / 0.08)"` or similar, so it doesn’t overpower the chart.
- If the data is dense (e.g. 60 days), consider merging adjacent segments to avoid too many tiny bands; alternatively one ReferenceArea per point where delta !== 0 (narrow band) is acceptable.

Reference: [MasterForecastChart](frontend/components/forecast/MasterForecastChart.tsx) uses `ReferenceArea x1={currentMonth} x2={currentMonth} fill="#3b82f6" fillOpacity={0.07}` for a single-month highlight; same pattern with multiple segments.

---

## 4) Scenario Summary badge above chart

**Goal:** When an optional `activeScenario` is provided, show a compact summary block **above** the chart (inside the same card/content area).

- **New optional props** on `ForecastChart`:
  - `activeScenario?: { type: "delay_payment" | "split_payment" | "accelerate_receivable"; deltaCash: number; riskLevel: string; confidence: number }`
  - `currencyCode?: string` (e.g. `"QAR"`) for the Impact line
  - `isAr?: boolean` (already present)
- **Badge content (when `activeScenario` is set):**
  - Line 1: "Scenario Active: {type}" (localize type: e.g. "Delay payment" / "تأخير الدفع" via a small map in the component).
  - Line 2: "Impact: +{deltaCash} {currencyCode}" (or minus if negative).
  - Line 3: "Risk: {riskLevel}"
  - Line 4: "Confidence: {confidence}%"
- **Layout:** A small block above `<ResponsiveContainer>`, e.g. a bordered/rounded div with two-column grid or stacked lines, compact text (text-xs). No API; all values come from the prop.

**Parent (scenario-planner page):** Optionally use `useScenario()` and `useCurrency()` and pass `activeScenario={activeScenario}` and `currencyCode={currCode}` into `<ForecastChart>` so that when the user has applied a scenario from the AI Advisor and navigates to Scenario Planner, the badge appears. If not passed, the badge is simply not rendered.

---

## 5) Responsiveness and constraints

- Keep `ResponsiveContainer width="100%" height={260}"` (or existing height); no fixed pixel widths.
- Badge and ReferenceArea should not break layout on small screens (stack or wrap text as needed).
- Do not refactor other charts or the chartStyles library beyond importing existing shared props if needed.

---

## 6) Implementation order

1. Update **line styling** (Base solid/primary, Scenario dashed/purple/thicker) in [forecast-chart.tsx](frontend/features/forecast/forecast-chart.tsx).
2. Add **Impact** line to **ForecastTooltip** (Positive liquidity shift / Negative liquidity impact) with i18n for `isAr`.
3. Compute **impacted segments** from `data` (where `baseBalance !== simulatedBalance`) and render **ReferenceArea**(s).
4. Add optional **activeScenario** and **currencyCode** props; when present, render **Scenario Summary badge** above the chart; add a small type-to-label map (EN/AR) for scenario type.
5. In [scenario-planner/page.tsx](frontend/app/app/scenario-planner/page.tsx): pass `activeScenario` from `useScenario()` and `currencyCode` from `useCurrency()` into `ForecastChart` (optional; only if you want the badge on that page).

---

## Files to touch


| File                                                                                           | Change                                                                                               |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [frontend/features/forecast/forecast-chart.tsx](frontend/features/forecast/forecast-chart.tsx) | Line styles, tooltip impact line, ReferenceArea segments, optional props and Scenario Summary badge. |
| [frontend/app/app/scenario-planner/page.tsx](frontend/app/app/scenario-planner/page.tsx)       | Optional: `useScenario()`, pass `activeScenario` and `currencyCode` to `ForecastChart`.              |


No new files; no API calls; no refactor of the rest of the chart library.