"use client";

import Image from "next/image";
import { HeroSection } from "@/components/home/HeroSection";
import { NeedsSection } from "@/components/home/NeedsSection";
import { ProjectsShowcase } from "@/components/home/ProjectsShowcase";
import { StatsWaveSection } from "@/components/home/StatsWaveSection";
import { ApprovedHomeSections } from "@/components/home/ApprovedHomeSections";
import styles from "./HomeExperience.module.css";

export function HomeExperience() {
  return (
    <main id="contenido" className="irp-home">
      <HeroSection />
      <NeedsSection />
      <div className={styles.projectsTransitionAnchor} aria-hidden="true">
        <Image
          className={styles.projectsTransitionImage}
          src="/NUEVO/transition-proyectos.png"
          alt=""
          width={1672}
          height={941}
        />
      </div>
      <ProjectsShowcase />
      <StatsWaveSection />
      <ApprovedHomeSections />
    </main>
  );
}
