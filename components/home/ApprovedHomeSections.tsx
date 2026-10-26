"use client";

import { HomeContactSection } from "@/components/home/HomeContactSection";
import { ProjectPathSection } from "@/components/home/ProjectPathSection";
import type { HomeContent } from "@/lib/cms/content-contracts";

export function ApprovedHomeSections({ content }: { content: HomeContent }) {
  return (
    <>
      <ProjectPathSection content={content.projectPath} />
      <div className="irp-home__section-blend" aria-hidden="true" />
      <HomeContactSection />
    </>
  );
}
