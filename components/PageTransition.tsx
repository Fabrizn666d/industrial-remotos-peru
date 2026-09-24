"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { motionDuration, motionEase } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = usePrefersReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reduceMotion ? motionDuration.reduced : 0.3,
        ease: motionEase.enter
      }}
    >
      {children}
    </motion.div>
  );
}
