"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { NeedsSection } from "@/components/home/NeedsSection";
import { ProjectsShowcase } from "@/components/home/ProjectsShowcase";
import { StatsWaveSection } from "@/components/home/StatsWaveSection";
import { ApprovedHomeSections } from "@/components/home/ApprovedHomeSections";

export function HomeExperience() {
  return (
    <main id="contenido" className="irp-home">
      <HeroSection />
      <NeedsSection />
      <ProjectsShowcase />
      <StatsWaveSection />
      <ApprovedHomeSections />
    </main>
  );
}
