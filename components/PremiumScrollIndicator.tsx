"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useHomeIntro } from "@/components/HomeIntroController";

const TRACK_TRAVEL_PX = 168;

export function PremiumScrollIndicator() {
  const { status } = useHomeIntro();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    mass: 0.25,
    restDelta: 0.001
  });
  const dotY = useTransform(smoothProgress, [0, 1], [0, TRACK_TRAVEL_PX]);
  const visible = status === "completed" || status === "skipped" || status === "failed";

  return (
    <div
      className={`premium-scroll-indicator is-${status}${visible ? " is-visible" : ""}`}
      aria-hidden="true"
      data-scroll-indicator-status={status}
    >
      <span className="premium-scroll-indicator__track" />
      <motion.span className="premium-scroll-indicator__dot" style={{ y: dotY }} />
    </div>
  );
}
