"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type MotionPresetProps = {
  children?: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "span" | "p";
  ariaHidden?: boolean;
};

export function FadeInUp({ children, className, delay = 0, as = "div", ariaHidden }: MotionPresetProps) {
  const reduceMotion = useReducedMotion();
  const MotionElement = as === "span" ? motion.span : as === "p" ? motion.p : motion.div;

  return (
    <MotionElement
      className={className}
      aria-hidden={ariaHidden}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.6, delay: reduceMotion ? 0 : delay, ease: "easeOut" }}
    >
      {children}
    </MotionElement>
  );
}

export function SlideInRight({ children, className, delay = 0.2, ariaHidden }: MotionPresetProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      aria-hidden={ariaHidden}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: reduceMotion ? 0.01 : 0.8, delay: reduceMotion ? 0 : delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
