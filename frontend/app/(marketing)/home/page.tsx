"use client";

import { HeroSection } from "@/components/marketing/hero-section";
import { CustomerLogosBar } from "@/components/marketing/customer-logos-bar";
import { StatsSection } from "@/components/marketing/stats-section";
import { PlatformBenefitsSection } from "@/components/marketing/platform-benefits-section";
import { DashboardPreviewSection } from "@/components/marketing/dashboard-preview-section";
import { FinalCtaSection } from "@/components/marketing/final-cta-section";

export default function HomePage() {
  return (
    <div className="text-white min-h-screen bg-landing-darker">
      <HeroSection />
      <CustomerLogosBar />
      <StatsSection />
      <PlatformBenefitsSection />
      <DashboardPreviewSection />
      <FinalCtaSection />
    </div>
  );
}
