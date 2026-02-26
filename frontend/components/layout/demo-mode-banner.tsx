"use client";

/**
 * Visible banner in development when current tenant is "demo".
 * Only rendered when NODE_ENV is development and tenant id is "demo".
 */
export function DemoModeBanner({ tenantId }: { tenantId: string | undefined }) {
  const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";
  if (!isDev || tenantId !== "demo") return null;

  return (
    <div
      className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium bg-amber-500/90 text-amber-950 border-b border-amber-600/50"
      role="status"
      aria-label="Demo mode"
    >
      <span className="uppercase tracking-wider">DEMO MODE</span>
      <span aria-hidden>—</span>
      <span>Tenant: demo</span>
    </div>
  );
}
