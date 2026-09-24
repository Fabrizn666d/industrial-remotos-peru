"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { MotionStyle } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

const SOFT_EASE = [0.16, 1, 0.3, 1] as const;
const SOFT_EXIT_EASE = [0.4, 0, 0.2, 1] as const;

function useHydratedReducedMotion() {
  const systemPreference = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => setReduceMotion(systemPreference === true), [systemPreference]);
  return reduceMotion;
}

type MotionPresetProps = {
  children?: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  visible?: boolean;
  as?: "div" | "span" | "p";
  ariaHidden?: boolean;
  offset?: number;
  initialScale?: number;
  style?: MotionStyle;
};

export function FadeInUp({
  children,
  className,
  delay = 0,
  duration = 0.54,
  visible = true,
  as = "div",
  ariaHidden,
  offset = 10,
  initialScale = 1,
  style
}: MotionPresetProps) {
  const reduceMotion = useHydratedReducedMotion();
  const MotionElement = as === "span" ? motion.span : as === "p" ? motion.p : motion.div;
  const y = reduceMotion ? 0 : offset;

  return (
    <MotionElement
      className={className}
      aria-hidden={ariaHidden}
      initial={{ opacity: 0, y, scale: reduceMotion ? 1 : initialScale }}
      animate={visible
        ? { opacity: 1, y: 0, scale: 1 }
        : { opacity: 0, y, scale: 1 }}
      transition={{ duration, delay: visible ? delay : 0, ease: visible ? SOFT_EASE : SOFT_EXIT_EASE }}
      style={{ ...style, pointerEvents: visible ? undefined : "none" }}
    >
      {children}
    </MotionElement>
  );
}

type SlideInRightProps = Omit<MotionPresetProps, "as" | "offset"> & {
  distance?: number;
  mobileDistance?: number;
  mobileDuration?: number;
  opacityDuration?: number;
  initialY?: number;
};

function useHydratedMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 900px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return mobile;
}

export function SlideInRight({
  children,
  className,
  delay = 0,
  duration = 0.85,
  visible = true,
  ariaHidden,
  distance = 125,
  mobileDistance = 70,
  mobileDuration = 0.8,
  opacityDuration = 0.3,
  initialY = 0,
  initialScale = 1,
  style
}: SlideInRightProps) {
  const reduceMotion = useHydratedReducedMotion();
  const mobile = useHydratedMobile();
  const activeDuration = mobile ? mobileDuration : duration;
  const x = reduceMotion ? 0 : mobile ? mobileDistance : distance;
  const y = reduceMotion ? 0 : initialY;

  return (
    <motion.div
      className={className}
      aria-hidden={ariaHidden}
      initial={{ opacity: 0, x, y, scale: reduceMotion ? 1 : initialScale }}
      animate={visible
        ? { opacity: 1, x: 0, y: 0, scale: 1 }
        : { opacity: 0, x, y, scale: initialScale }}
      transition={{
        opacity: { duration: visible ? opacityDuration : 0.2, delay: visible ? delay : 0, ease: SOFT_EASE },
        x: { duration: activeDuration, delay: visible ? delay : 0, ease: SOFT_EASE },
        y: { duration: activeDuration, delay: visible ? delay : 0, ease: SOFT_EASE },
        scale: { duration: activeDuration, delay: visible ? delay : 0, ease: SOFT_EASE }
      }}
      style={{ ...style, pointerEvents: visible ? undefined : "none" }}
    >
      {children}
    </motion.div>
  );
}
