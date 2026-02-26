"use client";

import { HeroSection } from "@/components/marketing/hero-section";
import { AppPreview } from "@/components/marketing/app-preview";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { LeadCapture } from "@/components/marketing/lead-capture";

export default function HomePage() {
  return (
    <div className="text-white min-h-screen" style={{ background: "hsl(220 55% 5%)" }}>
      <HeroSection />
      <AppPreview />
      <FeaturesGrid />
      <LeadCapture />
    </div>
  );
}
