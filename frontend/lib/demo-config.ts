/**
 * Client Demo Mode — slug to company name and industry.
 * Add new demos by adding a row here or use title-case from slug.
 */

export type DemoIndustry = "contracting" | "clinic" | "retail" | "trading" | "general";

export interface DemoCompany {
  companyName: string;
  companyNameAr: string;
  industry: DemoIndustry;
}

const KNOWN_DEMOS: Record<string, DemoCompany> = {
  "harbi-contracting": {
    companyName: "Harbi Contracting",
    companyNameAr: "مقاولات حربي",
    industry: "contracting",
  },
  "al-noor-clinic": {
    companyName: "Al Noor Clinic",
    companyNameAr: "عيادة النور",
    industry: "clinic",
  },
  "gulf-retail": {
    companyName: "Gulf Retail Co",
    companyNameAr: "شركة الخليج للتجزئة",
    industry: "retail",
  },
  "delta-trading": {
    companyName: "Delta Trading LLC",
    companyNameAr: "دلتا للتجارة",
    industry: "trading",
  },
};

/** Convert slug to title-case name (e.g. "harbi-contracting" → "Harbi Contracting") */
function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Get demo company from URL slug; falls back to title-case name and "general" industry */
export function getDemoFromSlug(slug: string | null | undefined): DemoCompany | null {
  if (!slug || typeof slug !== "string") return null;
  const key = slug.toLowerCase().trim();
  if (KNOWN_DEMOS[key]) return KNOWN_DEMOS[key];
  const name = slugToTitle(key);
  return {
    companyName: name,
    companyNameAr: name,
    industry: "general",
  };
}

export function isDemoPath(pathname: string): boolean {
  return pathname.startsWith("/demo/");
}
