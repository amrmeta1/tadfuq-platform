/**
 * In-memory store for demo personalization used by mock data.
 * Set by DemoCompanySync when entering demo; cleared when leaving.
 * Avoids threading demo options through every API caller.
 */

export interface DemoMockOptions {
  companyName: string;
  industry: string;
}

let current: DemoMockOptions | null = null;

export function setDemoMockOptions(opts: DemoMockOptions | null): void {
  current = opts;
}

export function getDemoMockOptions(): DemoMockOptions | null {
  return current;
}
