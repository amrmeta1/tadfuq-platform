"use client";

import React, { createContext, useContext, useMemo } from "react";
import { getDemoFromSlug, type DemoCompany, type DemoIndustry } from "@/lib/demo-config";

export interface DemoContextValue extends DemoCompany {
  slug: string;
  isDemoMode: true;
}

const defaultValue: {
  slug: string;
  companyName: string;
  companyNameAr: string;
  industry: DemoIndustry;
  isDemoMode: false;
} = {
  slug: "",
  companyName: "",
  companyNameAr: "",
  industry: "general",
  isDemoMode: false,
};

const DemoContext = createContext<DemoContextValue | typeof defaultValue>(defaultValue);

export function DemoProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const demo = useMemo(() => {
    const company = getDemoFromSlug(slug);
    if (!company) return defaultValue;
    return {
      ...company,
      slug,
      isDemoMode: true as const,
    };
  }, [slug]);

  return (
    <DemoContext.Provider value={demo.isDemoMode ? demo : defaultValue}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue | typeof defaultValue {
  return useContext(DemoContext);
}
