"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { createFadeUpVariants, scrollViewport } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className={cn("motion-reveal", className)}
      variants={createFadeUpVariants(reduceMotion, { delay })}
      initial="hidden"
      whileInView="visible"
      viewport={scrollViewport}
    >
      {children}
    </motion.div>
  );
}
