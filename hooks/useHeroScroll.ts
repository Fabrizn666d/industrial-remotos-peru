"use client";

import { useScroll, useTransform } from "framer-motion";
import type { RefObject } from "react";

export function useHeroScroll(sectionRef: RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", "3%"]);
  const glowX = useTransform(scrollYProgress, [0, 1], ["0%", "1.5%"]);
  const waveY = useTransform(scrollYProgress, [0, 1], [0, -5]);

  return { mediaY, glowX, waveY };
}
