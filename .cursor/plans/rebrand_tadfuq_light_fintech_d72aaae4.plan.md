---
name: Rebrand Tadfuq Light Fintech
overview: Apply a clean, light, professional fintech color palette globally via CSS variables and Tailwind, then update all app shell and key app components that use hardcoded neon green (#00FFAA) or emerald accent to the new primary blue and semantic colors. Layout, structure, RTL, and Cairo font remain unchanged.
todos: []
isProject: false
---

# Rebrand Tadfuq.ai to Light Professional Fintech Theme

## Approach

- **Centralize palette** in [frontend/app/globals.css](frontend/app/globals.css) and [frontend/tailwind.config.ts](frontend/tailwind.config.ts); map existing semantic tokens (primary, accent, border, background, inflow, outflow) to the new hex values.
- **Keep layout/structure identical**; only replace colors and subtle styling (borders, hover).
- **Scope**: App shell (navbar, sidebar) and all app routes (dashboard, cash-positioning, scenario-planner, group-consolidation, project-cash-flow, etc.). Marketing/landing pages that use `neon` can either be switched to the new primary for consistency or left for a later pass (recommend one global theme for the whole product).

## 1. Global palette (CSS + Tailwind)

**File: [frontend/app/globals.css](frontend/app/globals.css)**

- In `:root`, add or override variables:
  - `--header-bg: #F8F7F2` (light beige)
  - `--main-bg: #FAFBFC` (very light)
  - `--primary` / `--ring`: map to #1E40AF (e.g. `221 70% 40%` in HSL for deep blue)
  - `--accent`: use same blue tint for hover states
  - `--border` / `--input`: #E2E8F0 (soft border)
  - `--inflow`: #10B981 (emerald green for positive)
  - `--outflow` / `--destructive`: #EF4444 (red for negative)
  - `--card`: white; keep card border from `--border`
- Set `--background` to `#FAFBFC` (main background).
- Add optional tokens: `--tooltip-bg: #1E2937`, `--chart-line: #3B82F6`, `--sidebar-bg: #F1F5F9` for use in components.
- In `.dark`, keep a dark variant of the same palette (navy/slate backgrounds, same accent blue and green/red semantics) so dark mode stays consistent.

**File: [frontend/tailwind.config.ts](frontend/tailwind.config.ts)**

- Add extended colors for one-off use where needed:
  - `accentBlue: "#1E40AF"`, `chartBlue: "#3B82F6"`, `tooltipNavy: "#1E2937"`, `positive: "#10B981"`, `negative: "#EF4444"`, `headerBeige: "#F8F7F2"`, `sidebarGray: "#F1F5F9"`.
- Keep or repurpose `neon` (e.g. alias to chartBlue or remove from app usage) so existing `text-neon` / `bg-neon` in marketing can be updated in one place if desired.

## 2. App shell: header and sidebar

**Header (navbar)**

- [frontend/components/layout/navbar.tsx](frontend/components/layout/navbar.tsx): Replace `ACCENT = "#00FFAA"` with the new primary blue (#1E40AF). Use `bg-[#F8F7F2]` or a class from Tailwind for header background. Search trigger and logo use primary blue for border/ring and logo accent.
- [frontend/components/layout/EntitySwitcher.tsx](frontend/components/layout/EntitySwitcher.tsx): Replace inline `#00FFAA` with primary (e.g. `hsl(var(--primary))` or `theme accentBlue`). Balance text and chevron use primary color.
- [frontend/components/layout/CurrencySelector.tsx](frontend/components/layout/CurrencySelector.tsx): Replace `#00FFAA` hover/ring with primary.
- [frontend/components/layout/ConsolidatedViewCard.tsx](frontend/components/layout/ConsolidatedViewCard.tsx): Replace `#00FFAA` with primary for icon and value.
- [frontend/components/layout/user-menu.tsx](frontend/components/layout/user-menu.tsx): Replace focus ring `#00FFAA` with primary.

**Sidebar**

- [frontend/components/layout/sidebar.tsx](frontend/components/layout/sidebar.tsx): Sidebar container use `bg-[#F1F5F9]` (or `sidebarGray`). Logo and “.ai” use primary blue instead of emerald; active/highlight states and Raqib dot use primary or positive green where appropriate.

## 3. Dashboard and chart

**Dashboard page**

- [frontend/app/app/dashboard/page.tsx](frontend/app/app/dashboard/page.tsx): Replace all `#00FFAA` (DEMO banner, logo, Cashflow tab, cash balance card dot and value) with primary blue. Main content area can use `--main-bg` if desired. Card borders remain soft (#E2E8F0 via border-border). Hover: soft and elegant (e.g. opacity or light border change).

**Cash Evolution chart and tooltip**

- [frontend/components/dashboard/CashEvolutionChart.tsx](frontend/components/dashboard/CashEvolutionChart.tsx):
  - **Line and dots**: Change `stroke="#00FFAA"` and fill to chart blue (#3B82F6).
  - **Tooltip**: Background `#1E2937` (dark navy), text white/light gray. Structure already has multiple sections (CASHFLOW, TOTAL, CASH INFLOW, CASH OUTFLOW); ensure padding and typography are clear. Net change line use positive green (#10B981) instead of #00FFAA. Inflow indicator dot #10B981, outflow #EF4444.
  - **Bars**: Inflow fill #10B981, outflow keep red (#EF4444) or existing pattern.

## 4. Tables and cards (global)

- **Cards**: Already use `--card` and `--border`. With updated globals, cards will get white bg and #E2E8F0 borders. No structural change.
- **Tables**: Positive values use `--inflow` (#10B981), negative use `--destructive` (#EF4444). Existing classes like `text-emerald-600` / `text-destructive` can stay if globals map inflow/destructive to the new hex; or add a pass to use `text-positive` / `text-negative` where needed.
- **Dashboard category table**: Row backgrounds for inflow/outflow already use emerald/red; ensure they use the new semantic tokens (e.g. `bg-inflow` / `bg-outflow` or equivalent with new vars).

## 5. Other app pages (consistent accent and semantics)

- Replace any remaining **hardcoded #00FFAA** in app code with primary (search for `#00FFAA`, `00FFAA`, and `neon` in app routes and shared components).
- **Positive/negative**: Prefer CSS vars or Tailwind semantic tokens (e.g. `text-inflow` / `bg-inflow`, `text-destructive` / `bg-destructive`) so pages (cash-positioning, scenario-planner, group-consolidation, project-cash-flow, stress-testing, risk-radar, compliance, etc.) pick up the new green/red without sweeping every `emerald-`*/`rose-`* class. Optionally add utilities in globals.css like `.text-positive` / `.bg-positive` mapping to #10B981.
- **Charts** (e.g. Recharts line/area): Use chart blue (#3B82F6) for main series; keep green/red for positive/negative series or tooltips. [frontend/components/charts/ChartTooltipGlass.tsx](frontend/components/charts/ChartTooltipGlass.tsx) and similar: tooltip background #1E2937, text white; “main value” color use chart blue or primary.

## 6. Hover and polish

- Buttons/links: Use primary for primary actions; hover state slightly darker or with soft shadow (no neon glow).
- Inputs/dropdowns: Focus ring and border use primary blue.
- Sidebar nav items: Hover `bg-primary/5` or similar; active state primary left border and text.

## 7. RTL and font

- No changes: keep `dir`, `[dir="rtl"]`, and Cairo font in [frontend/app/globals.css](frontend/app/globals.css) and existing i18n.

## File change summary


| Area                  | Files to modify                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| Global theme          | `app/globals.css`, `tailwind.config.ts`                                                                     |
| Header/nav            | `navbar.tsx`, `EntitySwitcher.tsx`, `CurrencySelector.tsx`, `ConsolidatedViewCard.tsx`, `user-menu.tsx`     |
| Sidebar               | `sidebar.tsx`                                                                                               |
| Dashboard             | `app/app/dashboard/page.tsx`                                                                                |
| Chart/tooltip         | `components/dashboard/CashEvolutionChart.tsx`                                                               |
| Other charts/tooltips | `ChartTooltipGlass.tsx`, any Recharts usage using neon/emerald                                              |
| App-wide sweep        | Grep and replace remaining `#00FFAA` / `neon` in app and shared components (excluding marketing if decided) |


## Optional: marketing pages

- If rebrand should be product-wide: update [frontend/components/marketing/*](frontend/components/marketing/) (hero, navbar, dashboard-preview, etc.) to use primary blue instead of `neon` and adjust landing background to match light theme.
- If marketing stays separate: leave `neon` in tailwind and marketing components as-is; only app uses the new palette.

## Verification

- Run build; check dashboard, cash-positioning, scenario-planner, and one other app page in both light and RTL.
- Confirm header is #F8F7F2, main area #FAFBFC, sidebar #F1F5F9, cards white with #E2E8F0 borders, tooltip dark #1E2937 with white text, and accents are #1E40AF / #3B82F6 / #10B981 / #EF4444 as specified.

