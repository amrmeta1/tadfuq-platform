"use client";

import { HeroSection } from "@/components/marketing/hero-section";
import { AppPreview } from "@/components/marketing/app-preview";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { LeadCapture } from "@/components/marketing/lead-capture";

export default function HomePage() {
  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <HeroSection />
      <AppPreview />
      <FeaturesGrid />
      <LeadCapture />
    </div>
  );
}
