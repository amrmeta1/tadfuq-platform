---
name: Simulate API and Engine
overview: Add a deterministic simulation engine in `frontend/lib/simulationEngine.ts` and a POST API at `frontend/app/api/simulate/route.ts` that returns 7-day cash forecast, delta, risk level, and confidence for delay/split/accelerate scenarios using in-memory mock data.
todos: []
isProject: false
---

# Simulation API and Deterministic Engine (AI Advisor)

## Scope

- **In scope:** New `simulationEngine.ts` (pure logic) and new `app/api/simulate/route.ts` (POST handler). No LLM, no dashboard changes, no DB.
- **Out of scope:** Wiring the existing SimulationModal to this API (can be done later); dashboard remains untouched.

## 1. Types and mock data

**File:** [frontend/lib/simulationEngine.ts](frontend/lib/simulationEngine.ts) (new)

- **Types (minimal):**
  - `ScenarioType`: `"delay_payment" | "split_payment" | "accelerate_receivable"`
  - `SimulateParams`: `{ days?: number; splitPercentage?: number }`
  - Flow items: `{ id: string; amount: number; dueInDays: number }` (dueInDays 1–7 for the 7-day window)
  - `SimulateResult`: `{ deltaCash: number; originalForecast: number[]; newForecast: number[]; riskLevel: "high" | "medium" | "low"; confidence: number }`
- **Mock data (constants in this file):**
  - `currentCash = 1_283_844`
  - `upcomingOutflows`: `[{ id: "p1", amount: 28_774, dueInDays: 3 }, { id: "p2", amount: 91_777, dueInDays: 5 }]`
  - `upcomingInflows`: `[{ id: "r1", amount: 67_000, dueInDays: 2 }]`
  - Forecast window = 7 days (days 1..7).

## 2. Forecast calculation

- **Convention:** Day `d` is the d-th day from now (d = 1..7). Each flow has `dueInDays` (1..7).
- **Formula:**  
`balance[0] = currentCash`  
For `d = 1..7`: `balance[d] = balance[d-1] + sum(inflows with dueInDays === d) - sum(outflows with dueInDays === d)`  
So `originalForecast` and `newForecast` are arrays of length 7: end-of-day balances for days 1..7.
- **Helper:** `buildForecast(startCash: number, inflows: Flow[], outflows: Flow[]): number[]`  
Aggregate inflows/outflows by day (1..7), then run the recurrence. Return the 7 end-of-day balances.

## 3. Scenario logic (deterministic)

- **delay_payment** (target = outflow identified by `entityId`):
  - Find outflow with `id === entityId`. New `dueInDays = min(7, currentDueInDays + (params.days ?? 0))`.
  - All other flows unchanged. Build new outflows array and run `buildForecast` with it.
- **split_payment** (target = outflow by `entityId`):
  - Find outflow with `id === entityId`. `pct = (params.splitPercentage ?? 50) / 100`.  
  - `part1 = amount * pct`, `part2 = amount - part1`.  
  - Replace that outflow with two: `(part1, dueInDays)` and `(part2, min(7, dueInDays + 1))`.  
  - Build new forecast from updated outflows.
- **accelerate_receivable** (target = inflow by `entityId`):
  - Find inflow with `id === entityId`. New `dueInDays = max(1, currentDueInDays - (params.days ?? 0))`.
  - Build new forecast from updated inflows.

## 4. Risk level and confidence

- **Risk (on `newForecast`):** If any of the 7 values < 0 → `"high"`. Else if any < 100_000 → `"medium"`. Else → `"low"`.
- **Confidence:** Return `85` (static).
- **deltaCash:** `newForecast[6] - originalForecast[6]` (difference at end of day 7).

## 5. Engine API

- **Function:** `runSimulation(scenarioType: ScenarioType, entityId: string, params: SimulateParams): SimulateResult`
  - Use the mock `currentCash`, `upcomingInflows`, `upcomingOutflows` (copied so mutations don’t affect constants).
  - Apply the selected scenario to get modified inflows/outflows.
  - `originalForecast = buildForecast(currentCash, upcomingInflows, upcomingOutflows)`.
  - `newForecast = buildForecast(currentCash, modifiedInflows, modifiedOutflows)`.
  - If `entityId` does not match any flow for that scenario type, treat as no-op (same as original) or return a clear result; prefer no-op for simplicity.
  - Return `{ deltaCash, originalForecast, newForecast, riskLevel, confidence }`.

## 6. HTTP route

**File:** [frontend/app/api/simulate/route.ts](frontend/app/api/simulate/route.ts) (new)

- **Method:** POST only.
- **Body:** `{ scenarioType: string; entityId: string; params?: { days?: number; splitPercentage?: number } }`
- **Validation:** Require `scenarioType` (must be one of the three), `entityId` (non-empty string). `params` optional.
- **Handler:** Call `runSimulation(scenarioType, entityId, params ?? {})` from `@/lib/simulationEngine`. Return `NextResponse.json(result)` with status 200. On validation failure return 400 with a short error message. On unexpected errors return 500. No database or external calls.

## 7. Edge cases

- **entityId not found:** For delay/split, if no outflow has that id, use original outflows (no change). For accelerate, if no inflow has that id, use original inflows. Result is then “no change” (deltaCash 0, newForecast same as original).
- **days/splitPercentage:** Use defaults (e.g. delay 0 days, split 50%) when not provided so the engine never throws; route can pass `params ?? {}`.

## File summary


| File                                                                     | Action                                                                   |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [frontend/lib/simulationEngine.ts](frontend/lib/simulationEngine.ts)     | Create: types, mock data, `buildForecast`, risk logic, `runSimulation`   |
| [frontend/app/api/simulate/route.ts](frontend/app/api/simulate/route.ts) | Create: POST handler, body parse, validation, call engine, JSON response |


No changes to dashboard, no new dependencies, no LLM. Logic is fully isolated in the engine; the route is a thin adapter.