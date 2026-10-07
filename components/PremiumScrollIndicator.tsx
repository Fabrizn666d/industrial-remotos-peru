"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useHomeIntro } from "@/components/HomeIntroController";

const TRACK_TRAVEL_PX = 168;

export function PremiumScrollIndicator() {
  const { status } = useHomeIntro();
  const { scrollYProgress } = useScroll();
  const dotY = useTransform(scrollYProgress, [0, 1], [0, TRACK_TRAVEL_PX]);
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
