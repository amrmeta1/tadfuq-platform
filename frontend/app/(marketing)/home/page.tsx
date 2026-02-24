"use client";

import { HeroSection }      from "@/components/marketing/hero-section";
import { StatsStrip }       from "@/components/marketing/stats-strip";
import { PillarsSection }   from "@/components/marketing/pillars-section";
import { SocialProof }      from "@/components/marketing/social-proof";
import { AudienceCards }    from "@/components/marketing/audience-cards";
import { FeatureChecklist } from "@/components/marketing/feature-checklist";
import { Testimonials }     from "@/components/marketing/testimonials";
import { LeadCapture }      from "@/components/marketing/lead-capture";

export default function HomePage() {
  return (
    <div className="text-white min-h-screen" style={{ background: "hsl(220 55% 5%)" }}>

      {/* 1. Hero — headline + product preview */}
      <HeroSection />

      {/* 2. By the numbers — animated counters */}
      <StatsStrip />

      {/* 3. "This is the way" — CONNECT / PROTECT / FORECAST / OPTIMIZE */}
      <PillarsSection />

      {/* 4. Trusted by — logos + security badges */}
      <SocialProof />

      {/* 5. Purpose-built — For CFOs / For Finance Teams */}
      <AudienceCards />

      {/* 6. "Does your platform offer this?" — feature checklist */}
      <FeatureChecklist />

      {/* 7. What customers say — testimonials */}
      <Testimonials />

      {/* 8. Final CTA — lead capture */}
      <LeadCapture />

    </div>
  );
}
