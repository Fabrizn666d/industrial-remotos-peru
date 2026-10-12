"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { NeedsSection } from "@/components/home/NeedsSection";
import { ProjectsShowcase } from "@/components/home/ProjectsShowcase";
import { ExperienceImpactSection } from "@/components/home/ExperienceImpactSection";
import { InteractiveSolutionsSection } from "@/components/home/InteractiveSolutionsSection";
import { StatsWaveSection } from "@/components/home/StatsWaveSection";
import { ApprovedHomeSections } from "@/components/home/ApprovedHomeSections";
import type { HomeContent } from "@/lib/cms/content-contracts";

export function HomeExperience({ content }: { content: HomeContent }) {
  return (
    <main id="contenido" className="irp-home">
      <HeroSection content={content.hero} />
      <NeedsSection content={content.needs} />
      <ProjectsShowcase content={content.projects} />
      <InteractiveSolutionsSection content={content.integrated} />
      <div className="irp-home__section-blend" aria-hidden="true" />
      <ExperienceImpactSection content={content.impact} />
      <StatsWaveSection content={content.process} />
      <div className="irp-home__section-blend" aria-hidden="true" />
      <ApprovedHomeSections content={content} />
    </main>
  );
}
