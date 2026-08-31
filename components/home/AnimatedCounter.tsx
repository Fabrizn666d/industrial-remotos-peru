"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const reduceMotion = usePrefersReducedMotion();
  // Keep the real value in the server-rendered HTML. Animation must never be a
  // prerequisite for displaying business information.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!inView && !reduceMotion) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    setDisplay(0);
    const duration = 1700;
    const start = performance.now();
    let frame = 0;
    const update = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, value]);

  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}
